"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobTypesModule = void 0;
const common_1 = require("@nestjs/common");
const job_types_service_1 = require("./job-types.service");
const job_types_controller_1 = require("./job-types.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let JobTypesModule = class JobTypesModule {
};
exports.JobTypesModule = JobTypesModule;
exports.JobTypesModule = JobTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [job_types_controller_1.JobTypesController],
        providers: [job_types_service_1.JobTypesService],
        exports: [job_types_service_1.JobTypesService],
    })
], JobTypesModule);
//# sourceMappingURL=job-types.module.js.map