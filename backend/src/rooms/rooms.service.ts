import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  // 프로젝트별 팀 목록 조회 (멤버 포함)
  async findAll(projectId?: number) {
    return this.prisma.room.findMany({
      where: projectId ? { projectId } : {},
      include: {
        members: {
          include: { position: true },
          orderBy: { createdAt: 'asc' },
        },
        project: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // 팀 생성
  async create(data: { projectId: number; name: string; managerId?: string }) {
    return this.prisma.room.create({
      data,
      include: { members: { include: { position: true } }, project: { select: { name: true } } },
    });
  }

  // 팀 수정 (이름, 담당자 변경)
  async update(id: number, data: { name?: string; managerId?: string; isActive?: boolean }) {
    return this.prisma.room.update({
      where: { id },
      data,
      include: { members: { include: { position: true } }, project: { select: { name: true } } },
    });
  }

  // 팀 삭제
  async remove(id: number) {
    await this.prisma.user.updateMany({ where: { roomId: id }, data: { roomId: null } });
    return this.prisma.room.delete({ where: { id } });
  }

  // ─────────────────────────────────────────────────────────
  // 팀에 멤버 추가 (테바 추가 시 하위 직원 전체 자동 포함)
  // ─────────────────────────────────────────────────────────
  async addMember(roomId: number, employeeId: string) {
    // 추가할 직원 + 직급 정보 조회
    const user = await this.prisma.user.findUnique({
      where: { employeeId },
      include: { position: true },
    });

    // 재귀적으로 모든 하위 직원 ID 수집
    const allEmployeeIds = await this.collectSubordinateIds(employeeId);

    // 수집된 모든 직원을 한 번에 같은 팀으로 업데이트
    await this.prisma.user.updateMany({
      where: { employeeId: { in: allEmployeeIds } },
      data: { roomId },
    });

    return {
      addedCount: allEmployeeIds.length,
      employeeIds: allEmployeeIds,
      rootUser: user,
    };
  }

  // 팀에서 멤버 제거 (해당 직원만 제거)
  async removeMember(employeeId: string) {
    return this.prisma.user.update({
      where: { employeeId },
      data: { roomId: null },
      include: { position: true },
    });
  }

  // 팀에서 멤버 제거 + 하위 직원 전체 제거
  async removeMemberWithSubordinates(employeeId: string) {
    const allIds = await this.collectSubordinateIds(employeeId);
    await this.prisma.user.updateMany({
      where: { employeeId: { in: allIds } },
      data: { roomId: null },
    });
    return { removedCount: allIds.length, employeeIds: allIds };
  }

  // ─────────────────────────────────────────────────────────
  // 하위 직원 ID를 재귀적으로 수집 (본인 포함)
  // ─────────────────────────────────────────────────────────
  private async collectSubordinateIds(employeeId: string): Promise<string[]> {
    const result: string[] = [employeeId];

    const subordinates = await this.prisma.user.findMany({
      where: { parentEmployeeId: employeeId },
      select: { employeeId: true },
    });

    for (const sub of subordinates) {
      const childIds = await this.collectSubordinateIds(sub.employeeId);
      result.push(...childIds);
    }

    return result;
  }
}
