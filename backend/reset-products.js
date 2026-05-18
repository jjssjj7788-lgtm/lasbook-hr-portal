const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  기존 상품 데이터 전체 삭제 중...');

  // 판매 기록의 productId 참조를 해제하기 위해 먼저 확인
  const salesCount = await prisma.sale.count();
  console.log(`⚠️  연결된 판매 기록: ${salesCount}건`);

  // 판매 기록이 없는 상품만 삭제 (외래키 충돌 방지)
  // 기존 상품 ID 중 Sale에서 사용 중인 것 조회
  const usedProductIds = await prisma.sale.findMany({
    select: { productId: true },
    distinct: ['productId'],
  });
  const usedIds = usedProductIds.map((s) => s.productId);
  console.log(`⚠️  판매 기록에서 사용 중인 상품 ID: [${usedIds.join(', ')}]`);

  // 사용 중이지 않은 상품 삭제
  const deleted = await prisma.product.deleteMany({
    where: { id: { notIn: usedIds.length > 0 ? usedIds : [-1] } },
  });
  console.log(`✅ 미사용 상품 ${deleted.count}개 삭제됨`);

  // 사용 중인 상품은 비활성화
  if (usedIds.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: usedIds } },
      data: { isActive: false },
    });
    console.log(`✅ 사용 중인 상품 ${usedIds.length}개 비활성화됨`);
  }

  console.log('\n📦 새 상품 데이터 등록 중...');

  const newProducts = [
    // ── 구독회원 K2 (분권, 48권씩) ──
    { memberType: '구독회원', series: 'K2', step: 'A', language: '한글', price: 450000 },
    { memberType: '구독회원', series: 'K2', step: 'B', language: '한글', price: 450000 },
    { memberType: '구독회원', series: 'K2', step: 'A', language: '영어', price: 900000 },
    { memberType: '구독회원', series: 'K2', step: 'B', language: '영어', price: 900000 },

    // ── 구독회원 S시리즈 (96권) ──
    { memberType: '구독회원', series: 'S',  step: null, language: '한글', price: 2200000 },
    { memberType: '구독회원', series: 'S',  step: null, language: '영어', price: 4400000 },

    // ── 구독회원 G시리즈 (72권) ──
    { memberType: '구독회원', series: 'G',  step: null, language: '한글', price: 3400000 },
    { memberType: '구독회원', series: 'G',  step: null, language: '영어', price: 6800000 },

    // ── 주인형 점주 ──
    { memberType: '주인형 점주', series: '-', step: null, language: '-', price: 20000000 },
  ];

  for (const p of newProducts) {
    const created = await prisma.product.create({ data: p });
    const label = `${p.series}${p.step ? ' '+p.step : ''} ${p.language}`;
    console.log(`  ✅ [ID:${created.id}] ${p.memberType} ${label} → ${p.price.toLocaleString()}원`);
  }

  console.log(`\n🎉 총 ${newProducts.length}개 상품 등록 완료!`);
}

main()
  .catch((e) => { console.error('❌ 오류:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
