import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcNetAmount } from '../common/grade-calculator';
import { format } from 'date-fns';

const TRANSPORT_FEE = 50000; // 수련생 출석 시 건당 교통비

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    projectId: number;
    educationDate: Date;
    branchName: string;
    traineeId: string;
    mentorId?: string | null;
    isPresent: boolean;
    notes?: string;
  }) {
    // 지점명_날짜 자동 조합 (예: 강동_20260517)
    const dateStr = format(data.educationDate, 'yyyyMMdd');
    const branchLabel = `${data.branchName}_${dateStr}`;
    // 출석 시 교통비 자동 발생
    const transportFee = data.isPresent ? TRANSPORT_FEE : 0;
    // mentorId 미입력 시 traineeId를 대신 사용
    const mentorId = data.mentorId || data.traineeId;

    return this.prisma.attendance.create({
      data: { ...data, mentorId, branchLabel, transportFee },
      include: {
        trainee: { select: { name: true, position: true } },
        mentor: { select: { name: true } },
      },
    });
  }

  async update(id: number, data: Partial<{ isPresent: boolean; notes: string; branchName: string; educationDate: Date }>) {
    const existing = await this.prisma.attendance.findUnique({ where: { id } });
    if (!existing) throw new Error('출석 기록을 찾을 수 없습니다.');

    const isPresent = data.isPresent ?? existing.isPresent;
    const transportFee = isPresent ? TRANSPORT_FEE : 0;

    let branchLabel = existing.branchLabel;
    if (data.branchName || data.educationDate) {
      const name = data.branchName ?? existing.branchName;
      const date = data.educationDate ?? existing.educationDate;
      branchLabel = `${name}_${format(date, 'yyyyMMdd')}`;
    }

    return this.prisma.attendance.update({
      where: { id },
      data: { ...data, branchLabel, transportFee },
      include: { trainee: { select: { name: true, position: true } }, mentor: { select: { name: true } } },
    });
  }

  async findAll(requesterId: string, isAdmin: boolean, filters?: { projectId?: number; traineeId?: string; month?: string; date?: string }) {
    const requester = await this.prisma.user.findUnique({ where: { employeeId: requesterId } });
    if (!requester) return [];

    const where: any = {};
    if (!isAdmin) {
      where.projectId = requester.projectId;
      // 도제는 본인 담당 수련생 출석만 조회
      where.mentorId = requesterId;
    } else {
      if (filters?.projectId) where.projectId = filters.projectId;
      if (filters?.traineeId) where.traineeId = filters.traineeId;
    }

    if (filters?.month) {
      const [y, m] = filters.month.split('-').map(Number);
      where.educationDate = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    if (filters?.date) {
      const d = new Date(filters.date + 'T00:00:00');
      const next = new Date(d); next.setDate(next.getDate() + 1);
      where.educationDate = { gte: d, lt: next };
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        trainee: { select: { name: true, employeeId: true, position: true } },
        mentor: { select: { name: true, employeeId: true } },
        project: { select: { name: true } },
      },
      orderBy: { educationDate: 'desc' },
    });
  }

  async getTransportFeeSummary(projectId: number, month: string) {
    const [y, m] = month.split('-').map(Number);
    const records = await this.prisma.attendance.findMany({
      where: {
        projectId,
        isPresent: true,
        educationDate: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) },
      },
      include: { trainee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true } } },
    });

    // 수련생별 교통비 합산
    const summary = records.reduce<Record<string, { name: string; count: number; gross: number; net: number; bank: string; accountNumber: string; accountHolder: string }>>((acc, r) => {
      const id = r.traineeId;
      if (!acc[id]) {
        acc[id] = {
          name: r.trainee.name,
          count: 0,
          gross: 0,
          net: 0,
          bank: r.trainee.bank || '-',
          accountNumber: r.trainee.accountNumber || '-',
          accountHolder: r.trainee.accountHolder || r.trainee.name,
        };
      }
      acc[id].count += 1;
      acc[id].gross += r.transportFee;
      acc[id].net = calcNetAmount(acc[id].gross);
      return acc;
    }, {});

    const lines = Object.values(summary).map((s) => `${s.name} / ${s.net.toLocaleString('ko-KR')}원 / ${s.bank} ${s.accountNumber} (${s.accountHolder})`);
    return { summary: Object.values(summary), lines };
  }

  async delete(id: number) {
    return this.prisma.attendance.delete({ where: { id } });
  }
}
