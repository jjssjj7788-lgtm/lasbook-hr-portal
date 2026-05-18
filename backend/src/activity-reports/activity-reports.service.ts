import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityReportsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    projectId: number;
    employeeId: string;
    prospectCount: number;
    customerName?: string;
    customerPhone?: string;
    childAge?: string;
    counselContent?: string;
    customerReaction?: string;
    specialNotes?: string;
  }) {
    return this.prisma.activityReport.create({
      data,
      include: {
        employee: { select: { name: true, position: true, room: true } },
      },
    });
  }

  async findAll(
    requesterId: string,
    isAdmin: boolean,
    filters?: { projectId?: number; employeeId?: string; month?: string; date?: string },
  ) {
    const requester = await this.prisma.user.findUnique({ where: { employeeId: requesterId } });
    if (!requester) return [];

    const where: any = {};

    if (!isAdmin) {
      where.projectId = requester.projectId;
      const subs = await this.prisma.user.findMany({ where: { parentEmployeeId: requesterId }, select: { employeeId: true } });
      where.employeeId = { in: [requesterId, ...subs.map((s) => s.employeeId)] };
    } else {
      if (filters?.projectId) where.projectId = filters.projectId;
      if (filters?.employeeId) where.employeeId = filters.employeeId;
    }

    // 날짜 필터 (date: yyyy-MM-dd 형식 — 하루치만 조회)
    if (filters?.date) {
      const d = new Date(filters.date);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      where.submittedAt = { gte: start, lte: end };
    } else if (filters?.month) {
      // 월별 필터 (하위호환)
      const [y, m] = filters.month.split('-').map(Number);
      where.submittedAt = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }

    const reports = await this.prisma.activityReport.findMany({
      where,
      include: {
        employee: {
          select: {
            name: true,
            employeeId: true,
            position: true,
            room: { select: { id: true, name: true } },
          },
        },
        project: { select: { name: true } },
      },
      orderBy: [{ employeeId: 'asc' }, { submittedAt: 'asc' }],
    });

    // 보안 핵심: USER 권한이면 adminEvaluation 필드 제거
    if (!isAdmin) {
      return reports.map(({ adminEvaluation, ...rest }) => rest);
    }
    return reports;
  }

  async findOne(id: number, requesterId: string, isAdmin: boolean) {
    const report = await this.prisma.activityReport.findUnique({
      where: { id },
      include: { employee: { select: { name: true, position: true, room: true } } },
    });
    if (!report) throw new ForbiddenException('보고서를 찾을 수 없습니다.');

    if (!isAdmin && report.employeeId !== requesterId) {
      const subs = await this.prisma.user.findMany({ where: { parentEmployeeId: requesterId }, select: { employeeId: true } });
      if (!subs.some((s) => s.employeeId === report.employeeId)) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
    }

    if (!isAdmin) {
      const { adminEvaluation, ...rest } = report;
      return rest;
    }
    return report;
  }

  async updateEvaluation(id: number, adminEvaluation: string) {
    return this.prisma.activityReport.update({
      where: { id },
      data: { adminEvaluation },
    });
  }

  async delete(id: number) {
    return this.prisma.activityReport.delete({ where: { id } });
  }
}
