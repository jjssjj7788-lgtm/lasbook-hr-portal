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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.course.findMany({
            include: { project: true },
        });
    }
    async create(data) {
        let project = await this.prisma.project.findUnique({ where: { id: data.projectId } });
        if (!project) {
            project = await this.prisma.project.create({
                data: { id: data.projectId, name: '기본 프로젝트', description: '자동 생성된 프로젝트' },
            });
        }
        return this.prisma.course.create({
            data: {
                title: data.title,
                maxAttendees: data.maxAttendees,
                targetJobTypes: data.targetJobTypes && data.targetJobTypes.length > 0
                    ? JSON.stringify(data.targetJobTypes)
                    : null,
                project: { connect: { id: project.id } },
            },
        });
    }
    async enroll(courseId, userId) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course)
            throw new common_1.ForbiddenException('강의를 찾을 수 없습니다.');
        if (course.targetJobTypes) {
            const allowed = JSON.parse(course.targetJobTypes);
            if (allowed.length > 0) {
                const user = await this.prisma.user.findUnique({ where: { id: userId } });
                const userTypes = user?.types
                    ? (() => { try {
                        return JSON.parse(user.types);
                    }
                    catch {
                        return user.type ? [user.type] : [];
                    } })()
                    : (user?.type ? [user.type] : []);
                const hasPermission = userTypes.some(t => allowed.includes(t));
                if (!hasPermission) {
                    throw new common_1.ForbiddenException('이 강의는 해당 직군만 신청할 수 있습니다: ' + allowed.join(', '));
                }
            }
        }
        const existing = await this.prisma.enrollment.findFirst({ where: { courseId, userId } });
        if (existing)
            throw new common_1.ForbiddenException('이미 신청한 교육과정입니다.');
        return this.prisma.enrollment.create({
            data: { userId, courseId, status: 'ENROLLED' },
        });
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map