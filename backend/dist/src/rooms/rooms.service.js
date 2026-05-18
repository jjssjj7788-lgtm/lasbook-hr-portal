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
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RoomsService = class RoomsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(projectId) {
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
    async create(data) {
        return this.prisma.room.create({
            data,
            include: { members: { include: { position: true } }, project: { select: { name: true } } },
        });
    }
    async update(id, data) {
        return this.prisma.room.update({
            where: { id },
            data,
            include: { members: { include: { position: true } }, project: { select: { name: true } } },
        });
    }
    async remove(id) {
        await this.prisma.user.updateMany({ where: { roomId: id }, data: { roomId: null } });
        return this.prisma.room.delete({ where: { id } });
    }
    async addMember(roomId, employeeId) {
        const user = await this.prisma.user.findUnique({
            where: { employeeId },
            include: { position: true },
        });
        const allEmployeeIds = await this.collectSubordinateIds(employeeId);
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
    async removeMember(employeeId) {
        return this.prisma.user.update({
            where: { employeeId },
            data: { roomId: null },
            include: { position: true },
        });
    }
    async removeMemberWithSubordinates(employeeId) {
        const allIds = await this.collectSubordinateIds(employeeId);
        await this.prisma.user.updateMany({
            where: { employeeId: { in: allIds } },
            data: { roomId: null },
        });
        return { removedCount: allIds.length, employeeIds: allIds };
    }
    async collectSubordinateIds(employeeId) {
        const result = [employeeId];
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
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map