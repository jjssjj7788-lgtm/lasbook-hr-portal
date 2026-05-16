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
exports.JobTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let JobTypesService = class JobTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.jobType.findMany({
            include: {
                investmentTiers: { orderBy: [{ investmentAmount: 'asc' }, { worksInStore: 'desc' }] },
                customFields: { orderBy: { sortOrder: 'asc' } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(id) {
        const jt = await this.prisma.jobType.findUnique({
            where: { id },
            include: { investmentTiers: true },
        });
        if (!jt)
            throw new common_1.NotFoundException('직군을 찾을 수 없습니다.');
        return jt;
    }
    async create(data) {
        try {
            return await this.prisma.jobType.create({ data });
        }
        catch (e) {
            if (e.code === 'P2002')
                throw new common_1.ConflictException('이미 존재하는 직군명입니다.');
            throw e;
        }
    }
    async update(id, data) {
        await this.findOne(id);
        const { investmentTiers, ...rest } = data;
        return this.prisma.jobType.update({ where: { id }, data: rest });
    }
    async remove(id) {
        await this.findOne(id);
        const jt = await this.prisma.jobType.findUnique({ where: { id } });
        const usersCount = await this.prisma.user.count({
            where: {
                OR: [
                    { type: jt.name },
                    { types: { contains: jt.name } },
                ],
            },
        });
        if (usersCount > 0) {
            throw new common_1.ConflictException(`이 직군을 사용 중인 직원이 ${usersCount}명 있습니다. 먼저 해당 직원의 직군을 변경해 주세요.`);
        }
        await this.prisma.jobType.delete({ where: { id } });
        return { message: '삭제되었습니다.' };
    }
    async addTier(jobTypeId, data) {
        await this.findOne(jobTypeId);
        try {
            return await this.prisma.jobTypeInvestmentTier.create({ data: { ...data, jobTypeId } });
        }
        catch (e) {
            if (e.code === 'P2002')
                throw new common_1.ConflictException('동일한 투자금/근무 조건의 티어가 이미 있습니다.');
            throw e;
        }
    }
    async updateTier(tierId, data) {
        const tier = await this.prisma.jobTypeInvestmentTier.findUnique({ where: { id: tierId } });
        if (!tier)
            throw new common_1.NotFoundException('티어를 찾을 수 없습니다.');
        return this.prisma.jobTypeInvestmentTier.update({ where: { id: tierId }, data });
    }
    async removeTier(tierId) {
        const tier = await this.prisma.jobTypeInvestmentTier.findUnique({ where: { id: tierId } });
        if (!tier)
            throw new common_1.NotFoundException('티어를 찾을 수 없습니다.');
        await this.prisma.jobTypeInvestmentTier.delete({ where: { id: tierId } });
        return { message: '티어가 삭제되었습니다.' };
    }
    async addCustomField(jobTypeId, data) {
        await this.findOne(jobTypeId);
        return this.prisma.jobTypeCustomField.create({ data: { ...data, jobTypeId } });
    }
    async updateCustomField(fieldId, data) {
        const field = await this.prisma.jobTypeCustomField.findUnique({ where: { id: fieldId } });
        if (!field)
            throw new common_1.NotFoundException('필드를 찾을 수 없습니다.');
        return this.prisma.jobTypeCustomField.update({ where: { id: fieldId }, data });
    }
    async removeCustomField(fieldId) {
        const field = await this.prisma.jobTypeCustomField.findUnique({ where: { id: fieldId } });
        if (!field)
            throw new common_1.NotFoundException('필드를 찾을 수 없습니다.');
        await this.prisma.jobTypeCustomField.delete({ where: { id: fieldId } });
        return { message: '필드가 삭제되었습니다.' };
    }
};
exports.JobTypesService = JobTypesService;
exports.JobTypesService = JobTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JobTypesService);
//# sourceMappingURL=job-types.service.js.map