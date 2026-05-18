"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ActivityReportsService = class ActivityReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.activityReport.create({
            data,
            include: {
                employee: { select: { name: true, position: true, room: true } },
            },
        });
    }
    async findAll(requesterId, isAdmin, filters) {
        const requester = await this.prisma.user.findUnique({ where: { employeeId: requesterId } });
        if (!requester)
            return [];
        const where = {};
        if (!isAdmin) {
            where.projectId = requester.projectId;
            const subs = await this.prisma.user.findMany({ where: { parentEmployeeId: requesterId }, select: { employeeId: true } });
            where.employeeId = { in: [requesterId, ...subs.map((s) => s.employeeId)] };
        }
        else {
            if (filters?.projectId)
                where.projectId = filters.projectId;
            if (filters?.employeeId)
                where.employeeId = filters.employeeId;
        }
        if (filters?.startDate && filters?.endDate) {
            const s = new Date(filters.startDate);
            const e = new Date(filters.endDate);
            where.submittedAt = {
                gte: new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0),
                lte: new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999),
            };
        }
        else if (filters?.date) {
            const d = new Date(filters.date);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
            const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
            where.submittedAt = { gte: start, lte: end };
        }
        else if (filters?.month) {
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
        if (!isAdmin) {
            return reports.map(({ adminEvaluation, ...rest }) => rest);
        }
        return reports;
    }
    async findOne(id, requesterId, isAdmin) {
        const report = await this.prisma.activityReport.findUnique({
            where: { id },
            include: { employee: { select: { name: true, position: true, room: true } } },
        });
        if (!report)
            throw new common_1.ForbiddenException('보고서를 찾을 수 없습니다.');
        if (!isAdmin && report.employeeId !== requesterId) {
            const subs = await this.prisma.user.findMany({ where: { parentEmployeeId: requesterId }, select: { employeeId: true } });
            if (!subs.some((s) => s.employeeId === report.employeeId)) {
                throw new common_1.ForbiddenException('접근 권한이 없습니다.');
            }
        }
        if (!isAdmin) {
            const { adminEvaluation, ...rest } = report;
            return rest;
        }
        return report;
    }
    async updateEvaluation(id, adminEvaluation) {
        return this.prisma.activityReport.update({
            where: { id },
            data: { adminEvaluation },
        });
    }
    async delete(id) {
        return this.prisma.activityReport.delete({ where: { id } });
    }
};
exports.ActivityReportsService = ActivityReportsService;
exports.ActivityReportsService = ActivityReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityReportsService);
//# sourceMappingURL=activity-reports.service.js.map