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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const grade_calculator_1 = require("../common/grade-calculator");
let SalesService = class SalesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const deductedFee = (0, grade_calculator_1.calcDeductedFee)(data.actualAmount, data.paymentMethod);
        const netAmount = data.actualAmount - deductedFee;
        const user = await this.prisma.user.findUnique({ where: { employeeId: data.employeeId } });
        const salesWeek = user ? (0, grade_calculator_1.calcSalesWeek)(user.contractStart, data.saleDate) : 1;
        return this.prisma.sale.create({
            data: {
                ...data,
                deductedFee,
                netAmount,
                salesWeek,
            },
            include: { product: true, employee: { select: { name: true, employeeId: true } } },
        });
    }
    async findAll(requesterId, filters) {
        const requester = await this.prisma.user.findUnique({ where: { employeeId: requesterId } });
        if (!requester)
            return [];
        const where = {};
        if (requester.role !== 'ADMIN') {
            where.projectId = requester.projectId;
            const subs = await this.prisma.user.findMany({
                where: { parentEmployeeId: requesterId },
                select: { employeeId: true },
            });
            where.employeeId = { in: [requesterId, ...subs.map((s) => s.employeeId)] };
        }
        else {
            if (filters?.projectId)
                where.projectId = filters.projectId;
            if (filters?.employeeId)
                where.employeeId = filters.employeeId;
        }
        if (filters?.month) {
            const [y, m] = filters.month.split('-').map(Number);
            where.saleDate = {
                gte: new Date(y, m - 1, 1),
                lt: new Date(y, m, 1),
            };
        }
        else if (filters?.startDate || filters?.endDate) {
            where.saleDate = {};
            if (filters.startDate)
                where.saleDate.gte = filters.startDate;
            if (filters.endDate)
                where.saleDate.lt = filters.endDate;
        }
        return this.prisma.sale.findMany({
            where,
            include: {
                product: true,
                employee: { select: { name: true, employeeId: true, position: true } },
                project: { select: { name: true } },
            },
            orderBy: { saleDate: 'desc' },
        });
    }
    async update(id, data) {
        const existing = await this.prisma.sale.findUnique({ where: { id } });
        if (!existing)
            throw new Error('실적을 찾을 수 없습니다.');
        const newAmount = data.actualAmount ?? existing.actualAmount;
        const newMethod = (data.paymentMethod ?? existing.paymentMethod);
        const deductedFee = (0, grade_calculator_1.calcDeductedFee)(newAmount, newMethod);
        const netAmount = newAmount - deductedFee;
        return this.prisma.sale.update({
            where: { id },
            data: { ...data, deductedFee, netAmount },
            include: { product: true, employee: { select: { name: true } } },
        });
    }
    async delete(id) {
        return this.prisma.sale.delete({ where: { id } });
    }
    async getMonthSummary(projectId, month) {
        const [y, m] = month.split('-').map(Number);
        const sales = await this.prisma.sale.findMany({
            where: {
                projectId,
                saleDate: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) },
            },
        });
        const totalActual = sales.reduce((a, s) => a + s.actualAmount, 0);
        const totalFee = sales.reduce((a, s) => a + s.deductedFee, 0);
        const totalNet = sales.reduce((a, s) => a + s.netAmount, 0);
        return { count: sales.length, totalActual, totalFee, totalNet };
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map