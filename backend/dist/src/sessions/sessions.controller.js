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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const sessions_service_1 = require("./sessions.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const posterStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        const dir = (0, path_1.join)(process.cwd(), 'uploads', 'posters');
        if (!(0, fs_1.existsSync)(dir))
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${(0, path_1.extname)(file.originalname)}`;
        cb(null, unique);
    },
});
let SessionsController = class SessionsController {
    sessionsService;
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    async getAll() {
        return this.sessionsService.findAll();
    }
    async getOne(id) {
        return this.sessionsService.findOne(+id);
    }
    async createLecture(body, files) {
        const posterPaths = (files || []).map(f => `/uploads/posters/${f.filename}`);
        const targetJobTypes = body.targetJobTypes
            ? (Array.isArray(body.targetJobTypes) ? body.targetJobTypes : JSON.parse(body.targetJobTypes))
            : [];
        return this.sessionsService.createLecture({
            title: body.title,
            topic: body.topic,
            location: body.location,
            startTime: new Date(body.startTime),
            endTime: new Date(body.endTime),
            maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : undefined,
            posters: posterPaths.length > 0 ? JSON.stringify(posterPaths) : undefined,
            targetJobTypes: targetJobTypes.length > 0 ? targetJobTypes : undefined,
        });
    }
    async update(id, body, files) {
        const posterPaths = (files || []).map(f => `/uploads/posters/${f.filename}`);
        const data = {};
        if (body.title !== undefined)
            data.title = body.title;
        if (body.topic !== undefined)
            data.topic = body.topic;
        if (body.location !== undefined)
            data.location = body.location;
        if (body.startTime)
            data.startTime = new Date(body.startTime);
        if (body.endTime)
            data.endTime = new Date(body.endTime);
        if (body.maxAttendees !== undefined)
            data.maxAttendees = parseInt(body.maxAttendees) || null;
        if (posterPaths.length > 0)
            data.posters = JSON.stringify(posterPaths);
        return this.sessionsService.update(+id, data);
    }
    async remove(id) {
        return this.sessionsService.remove(+id);
    }
    async generateQr(id) {
        return this.sessionsService.generateQr(+id);
    }
    async revokeQr(id) {
        return this.sessionsService.revokeQr(+id);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)('lecture'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('posters', 10, { storage: posterStorage })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "createLecture", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('posters', 10, { storage: posterStorage })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)(':id/qr-generate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "generateQr", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)(':id/qr-revoke'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "revokeQr", null);
exports.SessionsController = SessionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('sessions'),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map