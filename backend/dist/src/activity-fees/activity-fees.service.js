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
exports.ActivityFeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const grade_calculator_1 = require("../common/grade-calculator");
let ActivityFeesService = class ActivityFeesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createFee(data) {
        const user = await this.prisma.user.findUnique({
            where: { employeeId: data.employeeId },
            include: { position: true },
        });
        if (!user)
            throw new Error('직원을 찾을 수 없습니다.');
        if (user.position.code === 'TRAINEE')
            throw new Error('수련생은 활동비 대상이 아닙니다. 교통비로 정산하세요.');
        const grossAmount = data.paymentRound === 1 ? user.position.fee1st : user.position.fee2nd;
        const netAmount = (0, grade_calculator_1.calcNetAmount)(grossAmount);
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
    async bulkCreateForProject(projectId, payMonth, paymentRound) {
        const users = await this.prisma.user.findMany({
            where: { projectId, isActive: true, role: 'USER', position: { code: { not: 'TRAINEE' } } },
            include: { position: true },
        });
        const results = await Promise.all(users.map((u) => this.createFee({ employeeId: u.employeeId, projectId, payMonth, paymentRound }).catch((e) => ({
            error: e.message,
            employeeId: u.employeeId,
        }))));
        return results;
    }
    async findAll(requesterId, filters) {
        const requester = await this.prisma.user.findUnique({ where: { employeeId: requesterId } });
        if (!requester)
            return [];
        const where = {};
        if (requester.role !== 'ADMIN') {
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
        if (filters?.month)
            where.payMonth = filters.month;
        return this.prisma.activityFee.findMany({
            where,
            include: {
                employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true, position: true } },
                project: { select: { name: true } },
            },
            orderBy: [{ payMonth: 'desc' }, { paymentRound: 'asc' }],
        });
    }
    async updateStatus(id, status) {
        return this.prisma.activityFee.update({
            where: { id },
            data: { paymentStatus: status, paidAt: status === 'PAID' ? new Date() : null },
        });
    }
    async updateEligibility(id, isEligible) {
        const fee = await this.prisma.activityFee.findUnique({ where: { id } });
        if (!fee)
            throw new Error('정산 항목을 찾을 수 없습니다.');
        const netAmount = isEligible ? (0, grade_calculator_1.calcNetAmount)(fee.grossAmount) : 0;
        return this.prisma.activityFee.update({
            where: { id },
            data: { isEligible, netAmount },
        });
    }
    async checkEligibility2nd(projectId) {
        const users = await this.prisma.user.findMany({
            where: { projectId, isActive: true, position: { code: { not: 'TRAINEE' } } },
            include: {
                position: true,
                sales: { where: { projectId } },
                activityReports: { where: { projectId } },
            },
        });
        return users.map((u) => {
            const hasSale = u.sales.length > 0;
            const saleCount = u.sales.length;
            const circleReports = u.activityReports.filter((r) => r.adminEvaluation === '\u25cb');
            const hasCircle = circleReports.length > 0;
            const eligible2nd = hasSale && hasCircle;
            return {
                employeeId: u.employeeId,
                name: u.name,
                position: u.position?.name,
                contractStart: u.contractStart,
                eligible1st: true,
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
    async getPayoutList(projectId, month) {
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
};
exports.ActivityFeesService = ActivityFeesService;
exports.ActivityFeesService = ActivityFeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityFeesService);
//# sourceMappingURL=activity-fees.service.js.map