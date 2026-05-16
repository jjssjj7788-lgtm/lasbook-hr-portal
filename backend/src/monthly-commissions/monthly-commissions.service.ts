import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcNetAmount, calcPaymentDueDate, calculateGrade, calcSalesCount } from '../common/grade-calculator';

@Injectable()
export class MonthlyCommissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 특정 월, 특정 직원의 월간 성과급 자동 계산 및 생성/갱신
   */
  async calculateAndUpsert(employeeId: string, settlementMonth: string) {
    const user = await this.prisma.user.findUnique({
      where: { employeeId },
      include: { project: true },
    });
    if (!user) throw new Error('직원을 찾을 수 없습니다.');

    // 해당 월 순매출 합계 조회
    const [y, m] = settlementMonth.split('-').map(Number);
    const sales = await this.prisma.sale.findMany({
      where: {
        employeeId,
        saleDate: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) },
      },
    });

    const netSalesTotal = sales.reduce((a, s) => a + s.netAmount, 0);
    const salesCount = calcSalesCount(netSalesTotal);

    // 등급 계산
    const gradeResult = calculateGrade(user.project.name, salesCount);

    let performanceRate = 0;
    let performanceBonus = 0;
    let subsidy = 0;
    let achievementGrade: string | null = null;

    if (gradeResult) {
      performanceRate = gradeResult.performanceRate;
      performanceBonus = Math.floor(netSalesTotal * performanceRate);
      subsidy = gradeResult.subsidy;
      achievementGrade = gradeResult.grade;
    }

    const totalGross = performanceBonus + subsidy;
    const netAmount = calcNetAmount(totalGross);
    const firstPaymentDue = totalGross > 0 ? calcPaymentDueDate(settlementMonth, user.isStoreOwner) : null;

    return this.prisma.monthlyCommission.upsert({
      where: { employeeId_settlementMonth: { employeeId, settlementMonth } },
      update: {
        salesCount,
        netSalesTotal,
        achievementGrade,
        performanceRate,
        performanceBonus,
        subsidy,
        totalGross,
        netAmount,
        firstPaymentDue,
      },
      create: {
        projectId: user.projectId,
        settlementMonth,
        employeeId,
        salesCount,
        netSalesTotal,
        achievementGrade,
        performanceRate,
        performanceBonus,
        subsidy,
        totalGross,
        netAmount,
        firstPaymentDue,
        paymentStatus: 'PENDING',
      },
      include: { employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true } } },
    });
  }

  async calculateProjectMonth(projectId: number, settlementMonth: string) {
    // 프로젝트 내 모든 활성 직원 대상 일괄 계산
    const users = await this.prisma.user.findMany({
      where: { projectId, isActive: true, role: 'USER' },
    });
    const results = await Promise.all(
      users.map((u) => this.calculateAndUpsert(u.employeeId, settlementMonth).catch((e) => ({ error: e.message, employeeId: u.employeeId }))),
    );
    return results;
  }

  async findAll(requesterId: string, filters?: { projectId?: number; month?: string; employeeId?: string }) {
    const requester = await this.prisma.user.findUnique({ where: { employeeId: requesterId } });
    if (!requester) return [];

    const where: any = {};
    if (requester.role !== 'ADMIN') {
      where.projectId = requester.projectId;
      const subs = await this.prisma.user.findMany({ where: { parentEmployeeId: requesterId }, select: { employeeId: true } });
      where.employeeId = { in: [requesterId, ...subs.map((s) => s.employeeId)] };
    } else {
      if (filters?.projectId) where.projectId = filters.projectId;
      if (filters?.employeeId) where.employeeId = filters.employeeId;
    }
    if (filters?.month) where.settlementMonth = filters.month;

    return this.prisma.monthlyCommission.findMany({
      where,
      include: {
        employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true, isStoreOwner: true } },
        project: { select: { name: true } },
      },
      orderBy: [{ settlementMonth: 'desc' }, { employee: { name: 'asc' } }],
    });
  }

  async updateStatus(id: number, status: 'PENDING' | 'PAID') {
    return this.prisma.monthlyCommission.update({
      where: { id },
      data: { paymentStatus: status, paidAt: status === 'PAID' ? new Date() : null },
    });
  }

  async getPayoutList(projectId: number, month: string) {
    const commissions = await this.prisma.monthlyCommission.findMany({
      where: { projectId, settlementMonth: month, paymentStatus: 'PENDING', totalGross: { gt: 0 } },
      include: {
        employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true } },
      },
    });

    // 원터치 추출 포맷: "이름 / 세후 실수령액(원) / 은행명 계좌번호 (예금주)"
    const lines = commissions.map((c) => {
      const emp = c.employee;
      const bankInfo = `${emp.bank || '-'} ${emp.accountNumber || '-'} (${emp.accountHolder || emp.name})`;
      return `${emp.name} / ${c.netAmount.toLocaleString('ko-KR')}원 / ${bankInfo}`;
    });

    return { lines, commissions };
  }
}
