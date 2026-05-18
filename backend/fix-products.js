const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 상품 데이터 정리 시작 ===\n');

  // 1. 현재 모든 상품 조회
  const allProducts = await prisma.product.findMany();
  console.log(`현재 등록된 상품 수: ${allProducts.length}개`);
  allProducts.forEach(p => {
    console.log(`  [ID:${p.id}] ${p.memberType} | series:${p.series} | step:${p.step} | lang:${p.language} | price:${p.price} | active:${p.isActive}`);
  });

  // 2. 판매 기록에서 사용 중인 상품 ID 조회
  const usedSales = await prisma.sale.findMany({ select: { productId: true }, distinct: ['productId'] });
  const usedIds = usedSales.map(s => s.productId);
  console.log(`\n판매 기록에 연결된 상품 ID: [${usedIds.join(', ') || '없음'}]`);

  // 3. 사용 중이지 않은 모든 상품 삭제
  const unusedIds = allProducts.filter(p => !usedIds.includes(p.id)).map(p => p.id);
  if (unusedIds.length > 0) {
    const del = await prisma.product.deleteMany({ where: { id: { in: unusedIds } } });
    console.log(`\n기존 미사용 상품 ${del.count}개 삭제 완료`);
  }

  // 4. 사용 중인 상품은 비활성화
  if (usedIds.length > 0) {
    await prisma.product.updateMany({ where: { id: { in: usedIds } }, data: { isActive: false } });
    console.log(`판매 연결된 ${usedIds.length}개 상품 → 비활성화`);
  }

  // 5. 올바른 상품 데이터 등록
  console.log('\n=== 새 상품 등록 ===');
  const newProducts = [
    { memberType: '구독회원', series: 'K2', step: 'A', language: '한글', price: 450000,    isActive: true },
    { memberType: '구독회원', series: 'K2', step: 'B', language: '한글', price: 450000,    isActive: true },
    { memberType: '구독회원', series: 'K2', step: 'A', language: '영어', price: 900000,    isActive: true },
    { memberType: '구독회원', series: 'K2', step: 'B', language: '영어', price: 900000,    isActive: true },
    { memberType: '구독회원', series: 'S',  step: null, language: '한글', price: 2200000,  isActive: true },
    { memberType: '구독회원', series: 'S',  step: null, language: '영어', price: 4400000,  isActive: true },
    { memberType: '구독회원', series: 'G',  step: null, language: '한글', price: 3400000,  isActive: true },
    { memberType: '구독회원', series: 'G',  step: null, language: '영어', price: 6800000,  isActive: true },
    { memberType: '주인형 점주', series: '-', step: null, language: '-',  price: 20000000, isActive: true },
  ];

  for (const p of newProducts) {
    const created = await prisma.product.create({ data: p });
    const name = `${p.series}${p.step ? ' '+p.step+'(48권)' : ''} ${p.language}`;
    console.log(`  [ID:${created.id}] ${p.memberType} | ${name} → ${p.price.toLocaleString()}원`);
  }

  console.log(`\n=== 완료: ${newProducts.length}개 상품 등록됨 ===`);
}

main()
  .catch(e => { console.error('\n오류 발생:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
