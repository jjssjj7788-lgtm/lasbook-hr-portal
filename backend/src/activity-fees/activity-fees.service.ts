import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcNetAmount } from '../common/grade-calculator';

@Injectable()
export class ActivityFeesService {
  constructor(private prisma: PrismaService) {}

  /**
   * 특정 직원의 활동비 1차/2차 생성
   * grossAmount는 Position 테이블에서 자동 참조
   */
  async createFee(data: {
    employeeId: string;
    projectId: number;
    payMonth: string;
    paymentRound: 1 | 2;
    isEligible?: boolean;
  }) {
    // 직원 직급에서 고정 활동비 조회
    const user = await this.prisma.user.findUnique({
      where: { employeeId: data.employeeId },
      include: { position: true },
    });
    if (!user) throw new Error('직원을 찾을 수 없습니다.');
    if (user.position.code === 'TRAINEE') throw new Error('수련생은 활동비 대상이 아닙니다. 교통비로 정산하세요.');

    const grossAmount = data.paymentRound === 1 ? user.position.fee1st : user.position.fee2nd;
    const netAmount = calcNetAmount(grossAmount);

    return this.prisma.activityFee.upsert({
      where: {
        employeeId_paymentRound_payMonth: {
          employeeId: data.employeeId,
          paymentRound: data.paymentRound,
          payMonth: data.payMonth,
        },
      },
      update: { grossAmount, netAmount, isEligible: data.isEligible ?? true },
      create: {
        projectId: data.projectId,
        payMonth: data.payMonth,
        employeeId: data.employeeId,
        paymentRound: data.paymentRound,
        grossAmount,
        isEligible: data.isEligible ?? true,
        netAmount,
        paymentStatus: 'PENDING',
      },
      include: {
        employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true, position: true } },
      },
    });
  }

  async bulkCreateForProject(projectId: number, payMonth: string, paymentRound: 1 | 2) {
    // 프로젝트 내 활동비 대상 직원 일괄 생성 (TRAINEE 제외)
    const users = await this.prisma.user.findMany({
      where: { projectId, isActive: true, role: 'USER', position: { code: { not: 'TRAINEE' } } },
      include: { position: true },
    });

    const results = await Promise.all(
      users.map((u) =>
        this.createFee({ employeeId: u.employeeId, projectId, payMonth, paymentRound }).catch((e) => ({
          error: e.message,
          employeeId: u.employeeId,
        })),
      ),
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
    if (filters?.month) where.payMonth = filters.month;

    return this.prisma.activityFee.findMany({
      where,
      include: {
        employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true, position: true } },
        project: { select: { name: true } },
      },
      orderBy: [{ payMonth: 'desc' }, { paymentRound: 'asc' }],
    });
  }

  async updateStatus(id: number, status: 'PENDING' | 'PAID') {
    return this.prisma.activityFee.update({
      where: { id },
      data: { paymentStatus: status, paidAt: status === 'PAID' ? new Date() : null },
    });
  }

  async updateEligibility(id: number, isEligible: boolean) {
    const fee = await this.prisma.activityFee.findUnique({ where: { id } });
    if (!fee) throw new Error('정산 항목을 찾을 수 없습니다.');
    const netAmount = isEligible ? calcNetAmount(fee.grossAmount) : 0;
    return this.prisma.activityFee.update({
      where: { id },
      data: { isEligible, netAmount },
    });
  }

  /**
   * 2차 지급 조건 자동 확인
   * 조건1: 판매실적(주인형 점주 OR 구독회원) 1건 이상
   * 조건2: 일일활동보고서 adminEvaluation = '\u25cb'(○) 1개 이상
   */
  async checkEligibility2nd(projectId: number) {
    // TRAINEE 제외한 전체 직원
    const users = await this.prisma.user.findMany({
      where: { projectId, isActive: true, position: { code: { not: 'TRAINEE' } } },
      include: {
        position: true,
        sales: { where: { projectId } },
        activityReports: { where: { projectId } },
      },
    });

    return users.map((u) => {
      // 조건1: 판매 실적
      const hasSale = u.sales.length > 0;
      const saleCount = u.sales.length;

      // 조건2: 일일활동보고서 동그라미(○) 평가
      const circleReports = u.activityReports.filter(
        (r: any) => r.adminEvaluation === '\u25cb',
      );
      const hasCircle = circleReports.length > 0;

      const eligible2nd = hasSale && hasCircle;

      return {
        employeeId: u.employeeId,
        name: u.name,
        position: u.position?.name,
        contractStart: u.contractStart,
        // 1차: 계약 시작일 기준 선지급 (항상 충족)
        eligible1st: true,
        // 2차 조건
        eligible2nd,
        conditions: {
          hasSale,
          saleCount,
          hasCircle,
          circleCount: circleReports.length,
        },
      };
    });
  }

  async getPayoutList(projectId: number, month: string) {
    const fees = await this.prisma.activityFee.findMany({
      where: { projectId, payMonth: month, paymentStatus: 'PENDING', isEligible: true, grossAmount: { gt: 0 } },
      include: {
        employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true } },
      },
      orderBy: [{ paymentRound: 'asc' }, { employee: { name: 'asc' } }],
    });

    const lines = fees.map((f) => {
      const emp = f.employee;
      const bankInfo = `${emp.bank || '-'} ${emp.accountNumber || '-'} (${emp.accountHolder || emp.name})`;
      return `${emp.name} / ${f.netAmount.toLocaleString('ko-KR')}원 / ${bankInfo}`;
    });

    return { lines, fees };
  }
}
