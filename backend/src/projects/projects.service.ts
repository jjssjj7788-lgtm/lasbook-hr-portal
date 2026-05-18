import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.project.findMany({ orderBy: { createdAt: 'asc' } }); }
  findOne(id: number) { return this.prisma.project.findUnique({ where: { id }, include: { positions: true, users: { select: { employeeId: true, name: true, role: true } } } }); }
  create(data: { name: string; description?: string }) { return this.prisma.project.create({ data }); }
  update(id: number, data: { name?: string; description?: string; status?: string }) { return this.prisma.project.update({ where: { id }, data }); }
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.product.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }); }
  create(data: { memberType: string; series: string; step?: string; language: string; price: number }) { return this.prisma.product.create({ data }); }
  update(id: number, data: any) { return this.prisma.product.update({ where: { id }, data }); }
  deactivate(id: number) { return this.prisma.product.update({ where: { id }, data: { isActive: false } }); }
  deactivateZeroPriced() {
    return this.prisma.product.updateMany({ where: { price: 0, isActive: true }, data: { isActive: false } });
  }
}

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}
  findAll(projectId?: number) { return this.prisma.position.findMany({ where: projectId ? { projectId } : {}, include: { project: { select: { name: true } } } }); }
  create(data: { projectId: number; name: string; code: string; fee1st: number; fee2nd: number }) { return this.prisma.position.create({ data }); }
  update(id: number, data: { name?: string; fee1st?: number; fee2nd?: number }) { return this.prisma.position.update({ where: { id }, data }); }
}
