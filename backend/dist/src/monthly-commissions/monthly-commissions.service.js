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
exports.MonthlyCommissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const grade_calculator_1 = require("../common/grade-calculator");
let MonthlyCommissionsService = class MonthlyCommissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateAndUpsert(employeeId, settlementMonth) {
        const user = await this.prisma.user.findUnique({
            where: { employeeId },
            include: { project: true },
        });
        if (!user)
            throw new Error('직원을 찾을 수 없습니다.');
        const [y, m] = settlementMonth.split('-').map(Number);
        const sales = await this.prisma.sale.findMany({
            where: {
                employeeId,
                saleDate: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) },
            },
        });
        const netSalesTotal = sales.reduce((a, s) => a + s.netAmount, 0);
        const salesCount = (0, grade_calculator_1.calcSalesCount)(netSalesTotal);
        const gradeResult = (0, grade_calculator_1.calculateGrade)(user.project.name, salesCount);
        let performanceRate = 0;
        let performanceBonus = 0;
        let subsidy = 0;
        let achievementGrade = null;
        if (gradeResult) {
            performanceRate = gradeResult.performanceRate;
            performanceBonus = Math.floor(netSalesTotal * performanceRate);
            subsidy = gradeResult.subsidy;
            achievementGrade = gradeResult.grade;
        }
        const totalGross = performanceBonus + subsidy;
        const netAmount = (0, grade_calculator_1.calcNetAmount)(totalGross);
        const firstPaymentDue = totalGross > 0 ? (0, grade_calculator_1.calcPaymentDueDate)(settlementMonth, user.isStoreOwner) : null;
        return this.prisma.monthlyCommission.upsert({
            where: { employeeId_settlementMonth: { employeeId, settlementMonth } },
            update: {
                salesCount,
                netSalesTotal,
                achievementGrade,
                performanceRate,
                performanceBonus,
                subsidy,
                totalGross,
                netAmount,
                firstPaymentDue,
            },
            create: {
                projectId: user.projectId,
                settlementMonth,
                employeeId,
                salesCount,
                netSalesTotal,
                achievementGrade,
                performanceRate,
                performanceBonus,
                subsidy,
                totalGross,
                netAmount,
                firstPaymentDue,
                paymentStatus: 'PENDING',
            },
            include: { employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true } } },
        });
    }
    async calculateProjectMonth(projectId, settlementMonth) {
        const users = await this.prisma.user.findMany({
            where: { projectId, isActive: true, role: 'USER' },
        });
        const results = await Promise.all(users.map((u) => this.calculateAndUpsert(u.employeeId, settlementMonth).catch((e) => ({ error: e.message, employeeId: u.employeeId }))));
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
            where.settlementMonth = filters.month;
        return this.prisma.monthlyCommission.findMany({
            where,
            include: {
                employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true, isStoreOwner: true } },
                project: { select: { name: true } },
            },
            orderBy: [{ settlementMonth: 'desc' }, { employee: { name: 'asc' } }],
        });
    }
    async updateStatus(id, status) {
        return this.prisma.monthlyCommission.update({
            where: { id },
            data: { paymentStatus: status, paidAt: status === 'PAID' ? new Date() : null },
        });
    }
    async getPayoutList(projectId, month) {
        const commissions = await this.prisma.monthlyCommission.findMany({
            where: { projectId, settlementMonth: month, paymentStatus: 'PENDING', totalGross: { gt: 0 } },
            include: {
                employee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true } },
            },
        });
        const lines = commissions.map((c) => {
            const emp = c.employee;
            const bankInfo = `${emp.bank || '-'} ${emp.accountNumber || '-'} (${emp.accountHolder || emp.name})`;
            return `${emp.name} / ${c.netAmount.toLocaleString('ko-KR')}원 / ${bankInfo}`;
        });
        return { lines, commissions };
    }
};
exports.MonthlyCommissionsService = MonthlyCommissionsService;
exports.MonthlyCommissionsService = MonthlyCommissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MonthlyCommissionsService);
//# sourceMappingURL=monthly-commissions.service.js.map