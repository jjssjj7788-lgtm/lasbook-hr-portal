import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Lasbook HR Portal DB...');

  // ─────────────────────────────────────────────────
  // 1. 프로젝트 생성
  // ─────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────
  // 2. 직급 생성 (프로젝트별)
  // ─────────────────────────────────────────────────
  const positionData = [
    { code: 'TEBA',    name: '테바',      fee1st: 1000000, fee2nd: 1000000 },
    { code: 'DOJE',    name: '도제',      fee1st: 500000,  fee2nd: 500000  },
    { code: 'TRAINEE', name: '수련생',    fee1st: 0,       fee2nd: 0       }, // 교통비로 별도 정산
    { code: 'MANAGER', name: '띠 매니저', fee1st: 500000,  fee2nd: 500000  },
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

  // ─────────────────────────────────────────────────
  // 3. 상품 (Products) 초기 데이터
  // ─────────────────────────────────────────────────
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
      // 이미 존재하면 skip
    });
  }

  console.log('✅ Products seeded (7 items)');

  // ─────────────────────────────────────────────────
  // 4. 최고 관리자 계정 생성
  // ─────────────────────────────────────────────────
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
