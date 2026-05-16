import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcDeductedFee, calcSalesWeek } from '../common/grade-calculator';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    projectId: number;
    saleDate: Date;
    employeeId: string;
    customerName: string;
    productId: number;
    paymentMethod: 'CARD' | 'CASH';
    actualAmount: number;
    notes?: string;
  }) {
    // 카드 수수료 자동 계산
    const deductedFee = calcDeductedFee(data.actualAmount, data.paymentMethod);
    const netAmount = data.actualAmount - deductedFee;

    // 영업 주차 자동 계산
    const user = await this.prisma.user.findUnique({ where: { employeeId: data.employeeId } });
    const salesWeek = user ? calcSalesWeek(user.contractStart, data.saleDate) : 1;

    return this.prisma.sale.create({
      data: {
        ...data,
        deductedFee,
        netAmount,
        salesWeek,
      },
      include: { product: true, employee: { select: { name: true, employeeId: true } } },
    });
  }

  async findAll(requesterId: string, filters?: {
    projectId?: number;
    employeeId?: string;
    startDate?: Date;
    endDate?: Date;
    month?: string; // "2026-05"
  }) {
    const requester = await this.prisma.user.findUnique({ where: { employeeId: requesterId } });
    if (!requester) return [];

    const where: any = {};

    // 프로젝트 격리
    if (requester.role !== 'ADMIN') {
      where.projectId = requester.projectId;
      // USER는 본인 + 하위 직원 데이터만
      const subs = await this.prisma.user.findMany({
        where: { parentEmployeeId: requesterId },
        select: { employeeId: true },
      });
      where.employeeId = { in: [requesterId, ...subs.map((s) => s.employeeId)] };
    } else {
      if (filters?.projectId) where.projectId = filters.projectId;
      if (filters?.employeeId) where.employeeId = filters.employeeId;
    }

    if (filters?.month) {
      const [y, m] = filters.month.split('-').map(Number);
      where.saleDate = {
        gte: new Date(y, m - 1, 1),
        lt: new Date(y, m, 1),
      };
    } else if (filters?.startDate || filters?.endDate) {
      where.saleDate = {};
      if (filters.startDate) where.saleDate.gte = filters.startDate;
      if (filters.endDate) where.saleDate.lt = filters.endDate;
    }

    return this.prisma.sale.findMany({
      where,
      include: {
        product: true,
        employee: { select: { name: true, employeeId: true, position: true } },
        project: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
    });
  }

  async update(id: number, data: Partial<{
    saleDate: Date;
    customerName: string;
    productId: number;
    paymentMethod: string;
    actualAmount: number;
    notes: string;
  }>) {
    const existing = await this.prisma.sale.findUnique({ where: { id } });
    if (!existing) throw new Error('실적을 찾을 수 없습니다.');

    const newAmount = data.actualAmount ?? existing.actualAmount;
    const newMethod = (data.paymentMethod ?? existing.paymentMethod) as 'CARD' | 'CASH';
    const deductedFee = calcDeductedFee(newAmount, newMethod);
    const netAmount = newAmount - deductedFee;

    return this.prisma.sale.update({
      where: { id },
      data: { ...data, deductedFee, netAmount },
      include: { product: true, employee: { select: { name: true } } },
    });
  }

  async delete(id: number) {
    return this.prisma.sale.delete({ where: { id } });
  }

  async getMonthSummary(projectId: number, month: string) {
    const [y, m] = month.split('-').map(Number);
    const sales = await this.prisma.sale.findMany({
      where: {
        projectId,
        saleDate: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) },
      },
    });
    const totalActual = sales.reduce((a, s) => a + s.actualAmount, 0);
    const totalFee = sales.reduce((a, s) => a + s.deductedFee, 0);
    const totalNet = sales.reduce((a, s) => a + s.netAmount, 0);
    return { count: sales.length, totalActual, totalFee, totalNet };
  }
}
