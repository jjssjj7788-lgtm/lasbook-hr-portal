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
exports.MonthlyCommissionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const monthly_commissions_service_1 = require("./monthly-commissions.service");
let MonthlyCommissionsController = class MonthlyCommissionsController {
    commissionsService;
    constructor(commissionsService) {
        this.commissionsService = commissionsService;
    }
    findAll(req, projectId, month, employeeId) {
        return this.commissionsService.findAll(req.user.employeeId, {
            projectId: projectId ? Number(projectId) : undefined,
            month,
            employeeId,
        });
    }
    getPayoutList(projectId, month) {
        return this.commissionsService.getPayoutList(Number(projectId), month);
    }
    calculateOne(body, req) {
        if (req.user.role !== 'ADMIN')
            throw new Error('권한이 없습니다.');
        return this.commissionsService.calculateAndUpsert(body.employeeId, body.settlementMonth);
    }
    calculateProject(body, req) {
        if (req.user.role !== 'ADMIN')
            throw new Error('권한이 없습니다.');
        return this.commissionsService.calculateProjectMonth(body.projectId, body.settlementMonth);
    }
    updateStatus(id, body, req) {
        if (req.user.role !== 'ADMIN')
            throw new Error('권한이 없습니다.');
        return this.commissionsService.updateStatus(Number(id), body.status);
    }
};
exports.MonthlyCommissionsController = MonthlyCommissionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], MonthlyCommissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('payout'),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MonthlyCommissionsController.prototype, "getPayoutList", null);
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MonthlyCommissionsController.prototype, "calculateOne", null);
__decorate([
    (0, common_1.Post)('calculate-project'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MonthlyCommissionsController.prototype, "calculateProject", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], MonthlyCommissionsController.prototype, "updateStatus", null);
exports.MonthlyCommissionsController = MonthlyCommissionsController = __decorate([
    (0, common_1.Controller)('monthly-commissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [monthly_commissions_service_1.MonthlyCommissionsService])
], MonthlyCommissionsController);
//# sourceMappingURL=monthly-commissions.controller.js.map