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
exports.ActivityReportsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const activity_reports_service_1 = require("./activity-reports.service");
let ActivityReportsController = class ActivityReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    findAll(req, projectId, employeeId, month) {
        const isAdmin = req.user.role === 'ADMIN';
        return this.reportsService.findAll(req.user.employeeId, isAdmin, {
            projectId: projectId ? Number(projectId) : undefined,
            employeeId,
            month,
        });
    }
    findOne(id, req) {
        return this.reportsService.findOne(Number(id), req.user.employeeId, req.user.role === 'ADMIN');
    }
    create(body, req) {
        return this.reportsService.create({
            projectId: Number(body.projectId),
            employeeId: req.user.employeeId,
            prospectCount: Number(body.prospectCount),
            counselContent: body.counselContent,
            specialNotes: body.specialNotes,
        });
    }
    updateEvaluation(id, body, req) {
        if (req.user.role !== 'ADMIN')
            throw new Error('권한이 없습니다.');
        return this.reportsService.updateEvaluation(Number(id), body.adminEvaluation);
    }
    delete(id, req) {
        if (req.user.role !== 'ADMIN')
            throw new Error('권한이 없습니다.');
        return this.reportsService.delete(Number(id));
    }
};
exports.ActivityReportsController = ActivityReportsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('employeeId')),
    __param(3, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ActivityReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivityReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ActivityReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/evaluation'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ActivityReportsController.prototype, "updateEvaluation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivityReportsController.prototype, "delete", null);
exports.ActivityReportsController = ActivityReportsController = __decorate([
    (0, common_1.Controller)('activity-reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [activity_reports_service_1.ActivityReportsService])
], ActivityReportsController);
//# sourceMappingURL=activity-reports.controller.js.map