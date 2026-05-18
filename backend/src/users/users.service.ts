import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmployeeId(employeeId: string) {
    return this.prisma.user.findUnique({
      where: { employeeId },
      include: { position: true, project: true },
    });
  }

  async findAll(requesterId: string, projectId?: number) {
    const requester = await this.findByEmployeeId(requesterId);
    if (!requester) throw new ForbiddenException();

    // ADMIN은 전체 또는 선택 프로젝트 조회
    if (requester.role === 'ADMIN') {
      return this.prisma.user.findMany({
        where: projectId ? { projectId } : {},
        include: {
          position: true,
          project: true,
          room: { select: { id: true, name: true } },
          parent: { select: { name: true, employeeId: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    // USER는 본인 + 직속 하위 직원만 조회
    return this.prisma.user.findMany({
      where: {
        projectId: requester.projectId,
        OR: [
          { employeeId: requesterId },
          { parentEmployeeId: requesterId },
        ],
      },
      include: { position: true, project: true, parent: { select: { name: true, employeeId: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(employeeId: string, requesterId: string) {
    const requester = await this.findByEmployeeId(requesterId);
    if (!requester) throw new ForbiddenException();

    // 접근 권한 검증
    if (requester.role !== 'ADMIN' && requesterId !== employeeId) {
      const target = await this.prisma.user.findUnique({ where: { employeeId } });
      if (!target || target.parentEmployeeId !== requesterId) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
    }

    return this.prisma.user.findUnique({
      where: { employeeId },
      include: {
        position: true,
        project: true,
        parent: { select: { name: true, employeeId: true } },
        subordinates: { include: { position: true } },
        sales: { include: { product: true }, orderBy: { saleDate: 'desc' } },
        activityReports: { orderBy: { submittedAt: 'desc' } },
        activityFees: { orderBy: { payMonth: 'desc' } },
        commissions: { orderBy: { settlementMonth: 'desc' } },
        traineeAttendances: { include: { mentor: { select: { name: true } } }, orderBy: { educationDate: 'desc' } },
      },
    });
  }

  async create(data: {
    employeeId: string;
    projectId: number;
    positionId: number;
    name: string;
    password: string;
    parentEmployeeId?: string;
    contractStart: Date;
    isStoreOwner?: boolean;
    phone?: string;
    bank?: string;
    accountNumber?: string;
    accountHolder?: string;
    role?: string;
    notes?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
      include: { position: true, project: true },
    });
  }

  async update(employeeId: string, data: Partial<{
    name: string;
    positionId: number;
    parentEmployeeId: string;
    contractStart: Date;
    isStoreOwner: boolean;
    phone: string;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    role: string;
    notes: string;
    isActive: boolean;
  }>) {
    return this.prisma.user.update({
      where: { employeeId },
      data,
      include: { position: true, project: true },
    });
  }

  async resetPassword(employeeId: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { employeeId },
      data: { password: hashed },
    });
  }

  async changePassword(employeeId: string, oldPassword: string, newPassword: string) {
    const user = await this.findByEmployeeId(employeeId);
    if (!user) throw new ForbiddenException('사용자를 찾을 수 없습니다.');
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) throw new ForbiddenException('현재 비밀번호가 올바르지 않습니다.');
    const hashed = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({ where: { employeeId }, data: { password: hashed } });
  }
}
