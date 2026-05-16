"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmployeeId(employeeId) {
        return this.prisma.user.findUnique({
            where: { employeeId },
            include: { position: true, project: true },
        });
    }
    async findAll(requesterId, projectId) {
        const requester = await this.findByEmployeeId(requesterId);
        if (!requester)
            throw new common_1.ForbiddenException();
        if (requester.role === 'ADMIN') {
            return this.prisma.user.findMany({
                where: projectId ? { projectId } : {},
                include: { position: true, project: true, parent: { select: { name: true, employeeId: true } } },
                orderBy: { createdAt: 'asc' },
            });
        }
        return this.prisma.user.findMany({
            where: {
                projectId: requester.projectId,
                OR: [
                    { employeeId: requesterId },
                    { parentEmployeeId: requesterId },
                ],
            },
            include: { position: true, project: true, parent: { select: { name: true, employeeId: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(employeeId, requesterId) {
        const requester = await this.findByEmployeeId(requesterId);
        if (!requester)
            throw new common_1.ForbiddenException();
        if (requester.role !== 'ADMIN' && requesterId !== employeeId) {
            const target = await this.prisma.user.findUnique({ where: { employeeId } });
            if (!target || target.parentEmployeeId !== requesterId) {
                throw new common_1.ForbiddenException('접근 권한이 없습니다.');
            }
        }
        return this.prisma.user.findUnique({
            where: { employeeId },
            include: {
                position: true,
                project: true,
                parent: { select: { name: true, employeeId: true } },
                subordinates: { include: { position: true } },
                sales: { include: { product: true }, orderBy: { saleDate: 'desc' } },
                activityReports: { orderBy: { submittedAt: 'desc' } },
                activityFees: { orderBy: { payMonth: 'desc' } },
                commissions: { orderBy: { settlementMonth: 'desc' } },
                traineeAttendances: { include: { mentor: { select: { name: true } } }, orderBy: { educationDate: 'desc' } },
            },
        });
    }
    async create(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: { ...data, password: hashedPassword },
            include: { position: true, project: true },
        });
    }
    async update(employeeId, data) {
        return this.prisma.user.update({
            where: { employeeId },
            data,
            include: { position: true, project: true },
        });
    }
    async resetPassword(employeeId, newPassword) {
        const hashed = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({
            where: { employeeId },
            data: { password: hashed },
        });
    }
    async changePassword(employeeId, oldPassword, newPassword) {
        const user = await this.findByEmployeeId(employeeId);
        if (!user)
            throw new common_1.ForbiddenException('사용자를 찾을 수 없습니다.');
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid)
            throw new common_1.ForbiddenException('현재 비밀번호가 올바르지 않습니다.');
        const hashed = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({ where: { employeeId }, data: { password: hashed } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map