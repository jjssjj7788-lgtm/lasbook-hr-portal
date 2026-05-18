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
exports.PositionsService = exports.ProductsService = exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() { return this.prisma.project.findMany({ orderBy: { createdAt: 'asc' } }); }
    findOne(id) { return this.prisma.project.findUnique({ where: { id }, include: { positions: true, users: { select: { employeeId: true, name: true, role: true } } } }); }
    create(data) { return this.prisma.project.create({ data }); }
    update(id, data) { return this.prisma.project.update({ where: { id }, data }); }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() { return this.prisma.product.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }); }
    create(data) { return this.prisma.product.create({ data }); }
    update(id, data) { return this.prisma.product.update({ where: { id }, data }); }
    deactivate(id) { return this.prisma.product.update({ where: { id }, data: { isActive: false } }); }
    deactivateZeroPriced() {
        return this.prisma.product.updateMany({ where: { price: 0, isActive: true }, data: { isActive: false } });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
let PositionsService = class PositionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(projectId) { return this.prisma.position.findMany({ where: projectId ? { projectId } : {}, include: { project: { select: { name: true } } } }); }
    create(data) { return this.prisma.position.create({ data }); }
    update(id, data) { return this.prisma.position.update({ where: { id }, data }); }
};
exports.PositionsService = PositionsService;
exports.PositionsService = PositionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PositionsService);
//# sourceMappingURL=projects.service.js.map