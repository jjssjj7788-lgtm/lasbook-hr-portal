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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding Lasbook HR Portal DB...');
    const mathDdi = await prisma.project.upsert({
        where: { id: 1 },
        update: {},
        create: { name: '수학의 띠', description: '수학 교육 구독 영업 프로젝트', status: 'ACTIVE' },
    });
    const seniorLas = await prisma.project.upsert({
        where: { id: 2 },
        update: {},
        create: { name: '시니어 라스', description: '시니어 대상 라스북 영업 프로젝트', status: 'ACTIVE' },
    });
    console.log('✅ Projects created:', mathDdi.name, seniorLas.name);
    const positionData = [
        { code: 'TEBA', name: '테바', fee1st: 1000000, fee2nd: 1000000 },
        { code: 'DOJE', name: '도제', fee1st: 500000, fee2nd: 500000 },
        { code: 'TRAINEE', name: '수련생', fee1st: 0, fee2nd: 0 },
        { code: 'MANAGER', name: '띠 매니저', fee1st: 500000, fee2nd: 500000 },
    ];
    for (const project of [mathDdi, seniorLas]) {
        for (const pos of positionData) {
            await prisma.position.upsert({
                where: { projectId_code: { projectId: project.id, code: pos.code } },
                update: { name: pos.name, fee1st: pos.fee1st, fee2nd: pos.fee2nd },
                create: { projectId: project.id, ...pos },
            });
        }
    }
    console.log('✅ Positions created for all projects');
    const products = [
        { memberType: '구독회원', series: 'K', step: null, language: '한글', price: 1600000 },
        { memberType: '구독회원', series: 'K', step: null, language: '영어', price: 3200000 },
        { memberType: '구독회원', series: 'S', step: null, language: '한글', price: 2200000 },
        { memberType: '구독회원', series: 'S', step: null, language: '영어', price: 4400000 },
        { memberType: '구독회원', series: 'G', step: null, language: '한글', price: 3400000 },
        { memberType: '구독회원', series: 'G', step: null, language: '영어', price: 6800000 },
        { memberType: '주인형 점주', series: '-', step: null, language: '-', price: 20000000 },
    ];
    for (const product of products) {
        await prisma.product.create({ data: product }).catch(() => {
        });
    }
    console.log('✅ Products seeded (7 items)');
    const adminPassword = await bcrypt.hash('admin1234!', 10);
    const adminPosition = await prisma.position.findFirst({
        where: { projectId: mathDdi.id, code: 'TEBA' },
    });
    if (adminPosition) {
        await prisma.user.upsert({
            where: { employeeId: 'ADMIN-001' },
            update: {},
            create: {
                employeeId: 'ADMIN-001',
                projectId: mathDdi.id,
                positionId: adminPosition.id,
                password: adminPassword,
                name: '최고관리자',
                contractStart: new Date('2026-01-01'),
                isStoreOwner: false,
                role: 'ADMIN',
            },
        });
    }
    console.log('✅ Admin account created (ID: ADMIN-001 / PW: admin1234!)');
    console.log('🎉 Seeding complete!');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map