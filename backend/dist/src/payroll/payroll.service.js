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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PayrollService = class PayrollService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculatePayroll(periodStart, periodEnd) {
        const jobTypes = await this.prisma.jobType.findMany();
        const jobTypeMap = new Map(jobTypes.map((jt) => [jt.name, jt]));
        const users = await this.prisma.user.findMany({
            where: { role: 'STAFF' },
            include: {
                attendances: {
                    include: { session: true },
                },
            },
        });
        const payrolls = [];
        for (const user of users) {
            let amount = 0;
            let baseAmount = 0;
            let deduction = 0;
            let notes = '';
            const jobType = user.type ? jobTypeMap.get(user.type) : null;
            if (!jobType) {
                amount = user.customSalary || 0;
                baseAmount = amount;
                notes = 'JobType 설정 없음 - customSalary 적용';
            }
            else if (!jobType.requiresAttendance) {
                baseAmount = user.customSalary || jobType.baseSalary;
                amount = baseAmount;
                deduction = 0;
                notes = `고정 지급 (${jobType.name}) - 지급일: 매월 ${jobType.paymentDay || '-'}일`;
            }
            else {
                const sessionRate = user.customSalary
                    ? Math.floor(user.customSalary / 4)
                    : (jobType.perSessionRate ?? Math.floor(jobType.baseSalary / 4));
                baseAmount = user.customSalary || jobType.baseSalary;
                const thisMonthAttendances = user.attendances.filter((a) => a.status === 'PRESENT' &&
                    a.session.startTime >= periodStart &&
                    a.session.startTime <= periodEnd);
                const thisMonthCount = thisMonthAttendances.length;
                if (jobType.isPrepaidFirstMonth) {
                    const prevAttendances = user.attendances.filter((a) => a.status === 'PRESENT' && a.session.startTime < periodStart);
                    const isFirstMonth = prevAttendances.length === 0;
                    if (isFirstMonth && thisMonthCount > 0) {
                        const shortfall = Math.max(0, 4 - thisMonthCount);
                        deduction = shortfall * sessionRate;
                        amount = baseAmount - deduction;
                        notes = `첫 달 선지급 (참석 ${thisMonthCount}/4회) - 부족분 ${shortfall}회 차감`;
                    }
                    else if (isFirstMonth && thisMonthCount === 0) {
                        amount = 0;
                        deduction = 0;
                        notes = '첫 달 미참석 - 0원';
                    }
                    else {
                        const shortfall = Math.max(0, 4 - thisMonthCount);
                        deduction = shortfall * sessionRate;
                        amount = Math.max(0, baseAmount - deduction);
                        notes = `참석 ${thisMonthCount}/4회 - 미달 ${shortfall}회 차감(${(shortfall * sessionRate).toLocaleString()}원)`;
                    }
                }
                else {
                    const effectiveCount = Math.min(thisMonthCount, 4);
                    const shortfall = Math.max(0, 4 - thisMonthCount);
                    deduction = shortfall * sessionRate;
                    amount = Math.max(0, baseAmount - deduction);
                    notes = `참석 ${thisMonthCount}회 x ${sessionRate.toLocaleString()}원 = ${amount.toLocaleString()}원`;
                }
            }
            const record = await this.prisma.payroll.create({
                data: {
                    userId: user.id,
                    amount,
                    baseAmount,
                    deduction,
                    notes,
                    periodStart,
                    periodEnd,
                    status: 'PENDING',
                },
            });
            payrolls.push({ ...record, user });
        }
        return payrolls;
    }
    async getPayrolls() {
        return this.prisma.payroll.findMany({
            include: {
                user: {
                    select: { name: true, type: true, bank: true, accountNumber: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getMyPayrolls(userId) {
        return this.prisma.payroll.findMany({
            where: { userId },
            orderBy: { periodStart: 'desc' },
        });
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map