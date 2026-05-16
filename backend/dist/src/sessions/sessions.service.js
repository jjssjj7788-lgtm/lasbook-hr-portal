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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const uuid_1 = require("uuid");
let SessionsService = class SessionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.session.findMany({
            include: {
                course: true,
                attendances: { select: { id: true } },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.session.findUnique({
            where: { id },
            include: {
                course: { select: { id: true, title: true, maxAttendees: true } },
                attendances: { include: { user: { select: { id: true, name: true } } } },
            },
        });
    }
    async createLecture(data) {
        const project = await this.ensureDefaultProject();
        const course = await this.prisma.course.create({
            data: {
                title: data.title,
                maxAttendees: data.maxAttendees,
                targetJobTypes: data.targetJobTypes && data.targetJobTypes.length > 0
                    ? JSON.stringify(data.targetJobTypes)
                    : null,
                project: { connect: { id: project.id } },
            },
        });
        return this.prisma.session.create({
            data: {
                title: data.title,
                topic: data.topic,
                location: data.location,
                startTime: data.startTime,
                endTime: data.endTime,
                maxAttendees: data.maxAttendees,
                posters: data.posters,
                course: { connect: { id: course.id } },
            },
            include: {
                course: { select: { id: true, title: true, maxAttendees: true } },
            },
        });
    }
    async update(id, data) {
        return this.prisma.session.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.session.delete({ where: { id } });
    }
    async generateQr(sessionId) {
        const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException('세션을 찾을 수 없습니다.');
        const token = (0, uuid_1.v4)();
        const updated = await this.prisma.session.update({
            where: { id: sessionId },
            data: { qrToken: token },
        });
        return { qrToken: updated.qrToken };
    }
    async revokeQr(sessionId) {
        const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException('세션을 찾을 수 없습니다.');
        await this.prisma.session.update({ where: { id: sessionId }, data: { qrToken: null } });
        return { message: 'QR이 비활성화되었습니다.' };
    }
    async ensureDefaultProject() {
        let project = await this.prisma.project.findFirst();
        if (!project) {
            project = await this.prisma.project.create({
                data: { name: '라스북 교육 프로젝트' },
            });
        }
        return project;
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map