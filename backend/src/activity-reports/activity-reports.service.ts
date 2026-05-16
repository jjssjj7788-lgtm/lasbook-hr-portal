import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityReportsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    projectId: number;
    employeeId: string;
    prospectCount: number;
    counselContent?: string;
    specialNotes?: string;
  }) {
    return this.prisma.activityReport.create({
      data,
      include: { employee: { select: { name: true, position: true } } },
    });
  }

  async findAll(requesterId: string, isAdmin: boolean, filters?: { projectId?: number; employeeId?: string; month?: string }) {
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

    if (filters?.month) {
      const [y, m] = filters.month.split('-').map(Number);
      where.submittedAt = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }

    const reports = await this.prisma.activityReport.findMany({
      where,
      include: { employee: { select: { name: true, position: true } }, project: { select: { name: true } } },
      orderBy: { submittedAt: 'desc' },
    });

    // ── 보안 핵심: USER 권한이면 adminEvaluation 필드 제거 ──
    if (!isAdmin) {
      return reports.map(({ adminEvaluation, ...rest }) => rest);
    }
    return reports;
  }

  async findOne(id: number, requesterId: string, isAdmin: boolean) {
    const report = await this.prisma.activityReport.findUnique({
      where: { id },
      include: { employee: { select: { name: true, position: true } } },
    });
    if (!report) throw new ForbiddenException('보고서를 찾을 수 없습니다.');

    // 접근 권한 검증
    if (!isAdmin && report.employeeId !== requesterId) {
      const subs = await this.prisma.user.findMany({ where: { parentEmployeeId: requesterId }, select: { employeeId: true } });
      if (!subs.some((s) => s.employeeId === report.employeeId)) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
    }

    // USER는 관리자 평가 숨김
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
