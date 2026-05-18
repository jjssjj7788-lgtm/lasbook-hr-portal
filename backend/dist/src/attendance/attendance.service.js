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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const grade_calculator_1 = require("../common/grade-calculator");
const date_fns_1 = require("date-fns");
const TRANSPORT_FEE = 50000;
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const dateStr = (0, date_fns_1.format)(data.educationDate, 'yyyyMMdd');
        const branchLabel = `${data.branchName}_${dateStr}`;
        const transportFee = data.isPresent ? TRANSPORT_FEE : 0;
        const mentorId = data.mentorId || data.traineeId;
        return this.prisma.attendance.create({
            data: { ...data, mentorId, branchLabel, transportFee },
            include: {
                trainee: { select: { name: true, position: true } },
                mentor: { select: { name: true } },
            },
        });
    }
    async update(id, data) {
        const existing = await this.prisma.attendance.findUnique({ where: { id } });
        if (!existing)
            throw new Error('출석 기록을 찾을 수 없습니다.');
        const isPresent = data.isPresent ?? existing.isPresent;
        const transportFee = isPresent ? TRANSPORT_FEE : 0;
        let branchLabel = existing.branchLabel;
        if (data.branchName || data.educationDate) {
            const name = data.branchName ?? existing.branchName;
            const date = data.educationDate ?? existing.educationDate;
            branchLabel = `${name}_${(0, date_fns_1.format)(date, 'yyyyMMdd')}`;
        }
        return this.prisma.attendance.update({
            where: { id },
            data: { ...data, branchLabel, transportFee },
            include: { trainee: { select: { name: true, position: true } }, mentor: { select: { name: true } } },
        });
    }
    async findAll(requesterId, isAdmin, filters) {
        const requester = await this.prisma.user.findUnique({ where: { employeeId: requesterId } });
        if (!requester)
            return [];
        const where = {};
        if (!isAdmin) {
            where.projectId = requester.projectId;
            where.mentorId = requesterId;
        }
        else {
            if (filters?.projectId)
                where.projectId = filters.projectId;
            if (filters?.traineeId)
                where.traineeId = filters.traineeId;
        }
        if (filters?.month) {
            const [y, m] = filters.month.split('-').map(Number);
            where.educationDate = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
        }
        if (filters?.date) {
            const d = new Date(filters.date + 'T00:00:00');
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
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
    async getTransportFeeSummary(projectId, month) {
        const [y, m] = month.split('-').map(Number);
        const records = await this.prisma.attendance.findMany({
            where: {
                projectId,
                isPresent: true,
                educationDate: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) },
            },
            include: { trainee: { select: { name: true, bank: true, accountNumber: true, accountHolder: true } } },
        });
        const summary = records.reduce((acc, r) => {
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
            acc[id].net = (0, grade_calculator_1.calcNetAmount)(acc[id].gross);
            return acc;
        }, {});
        const lines = Object.values(summary).map((s) => `${s.name} / ${s.net.toLocaleString('ko-KR')}원 / ${s.bank} ${s.accountNumber} (${s.accountHolder})`);
        return { summary: Object.values(summary), lines };
    }
    async delete(id) {
        return this.prisma.attendance.delete({ where: { id } });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map