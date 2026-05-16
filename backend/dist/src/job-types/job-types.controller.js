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
exports.JobTypesController = void 0;
const common_1 = require("@nestjs/common");
const job_types_service_1 = require("./job-types.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let JobTypesController = class JobTypesController {
    jobTypesService;
    constructor(jobTypesService) {
        this.jobTypesService = jobTypesService;
    }
    findAll() {
        return this.jobTypesService.findAll();
    }
    create(body) {
        return this.jobTypesService.create({
            name: body.name,
            requiresAttendance: body.requiresAttendance,
            hasInvestmentTiers: body.hasInvestmentTiers ?? false,
            hasCustomFields: body.hasCustomFields ?? false,
            paymentDay: body.paymentDay ?? null,
            baseSalary: body.baseSalary,
            perSessionRate: body.perSessionRate ?? null,
            isPrepaidFirstMonth: body.isPrepaidFirstMonth ?? false,
        });
    }
    updateTier(tierId, body) {
        return this.jobTypesService.updateTier(+tierId, body);
    }
    removeTier(tierId) {
        return this.jobTypesService.removeTier(+tierId);
    }
    updateCustomField(fieldId, body) {
        return this.jobTypesService.updateCustomField(+fieldId, body);
    }
    removeCustomField(fieldId) {
        return this.jobTypesService.removeCustomField(+fieldId);
    }
    update(id, body) {
        return this.jobTypesService.update(+id, body);
    }
    remove(id) {
        return this.jobTypesService.remove(+id);
    }
    addTier(id, body) {
        return this.jobTypesService.addTier(+id, body);
    }
    addCustomField(id, body) {
        return this.jobTypesService.addCustomField(+id, {
            fieldName: body.fieldName,
            fieldType: body.fieldType ?? 'text',
            placeholder: body.placeholder,
            isRequired: body.isRequired ?? false,
            sortOrder: body.sortOrder ?? 0,
        });
    }
};
exports.JobTypesController = JobTypesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('tiers/:tierId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('tierId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "updateTier", null);
__decorate([
    (0, common_1.Delete)('tiers/:tierId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('tierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "removeTier", null);
__decorate([
    (0, common_1.Patch)('custom-fields/:fieldId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('fieldId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "updateCustomField", null);
__decorate([
    (0, common_1.Delete)('custom-fields/:fieldId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('fieldId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "removeCustomField", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/tiers'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "addTier", null);
__decorate([
    (0, common_1.Post)(':id/custom-fields'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobTypesController.prototype, "addCustomField", null);
exports.JobTypesController = JobTypesController = __decorate([
    (0, common_1.Controller)('job-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [job_types_service_1.JobTypesService])
], JobTypesController);
//# sourceMappingURL=job-types.controller.js.map