import { Injectable, NotFoundException } from '@nestjs/common';
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
    // 팀 멤버들의 roomId를 null로 초기화
    await this.prisma.user.updateMany({ where: { roomId: id }, data: { roomId: null } });
    return this.prisma.room.delete({ where: { id } });
  }

  // 팀에 멤버 추가
  async addMember(roomId: number, employeeId: string) {
    return this.prisma.user.update({
      where: { employeeId },
      data: { roomId },
      include: { position: true, room: true },
    });
  }

  // 팀에서 멤버 제거
  async removeMember(employeeId: string) {
    return this.prisma.user.update({
      where: { employeeId },
      data: { roomId: null },
      include: { position: true },
    });
  }
}
