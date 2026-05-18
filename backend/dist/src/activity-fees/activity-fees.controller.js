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
exports.ActivityFeesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const activity_fees_service_1 = require("./activity-fees.service");
let ActivityFeesController = class ActivityFeesController {
    activityFeesService;
    constructor(activityFeesService) {
        this.activityFeesService = activityFeesService;
    }
    findAll(req, projectId, month, employeeId) {
        return this.activityFeesService.findAll(req.user.employeeId, {
            projectId: projectId ? Number(projectId) : undefined,
            month,
            employeeId,
        });
    }
    getPayoutList(projectId, month) {
        return this.activityFeesService.getPayoutList(Number(projectId), month);
    }
    checkEligibility(projectId) {
        return this.activityFeesService.checkEligibility2nd(Number(projectId));
    }
    checkMyEligibility(req) {
        return this.activityFeesService.checkMyEligibility(req.user.employeeId);
    }
    create(body) {
        return this.activityFeesService.createFee(body);
    }
    bulkCreate(body, req) {
        if (req.user.role !== 'ADMIN')
            throw new Error('권한이 없습니다.');
        return this.activityFeesService.bulkCreateForProject(body.projectId, body.payMonth, body.paymentRound);
    }
    updateStatus(id, body, req) {
        if (req.user.role !== 'ADMIN')
            throw new Error('권한이 없습니다.');
        return this.activityFeesService.updateStatus(Number(id), body.status);
    }
    updateEligibility(id, body, req) {
        if (req.user.role !== 'ADMIN')
            throw new Error('권한이 없습니다.');
        return this.activityFeesService.updateEligibility(Number(id), body.isEligible);
    }
};
exports.ActivityFeesController = ActivityFeesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ActivityFeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('payout'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ActivityFeesController.prototype, "getPayoutList", null);
__decorate([
    (0, common_1.Get)('check-eligibility'),
    __param(0, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActivityFeesController.prototype, "checkEligibility", null);
__decorate([
    (0, common_1.Get)('my-eligibility'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ActivityFeesController.prototype, "checkMyEligibility", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ActivityFeesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ActivityFeesController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ActivityFeesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/eligibility'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ActivityFeesController.prototype, "updateEligibility", null);
exports.ActivityFeesController = ActivityFeesController = __decorate([
    (0, common_1.Controller)('activity-fees'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [activity_fees_service_1.ActivityFeesService])
], ActivityFeesController);
//# sourceMappingURL=activity-fees.controller.js.map