const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log('관리자 계정 수:', users.length);
  users.forEach(u => console.log(`  - 이름: ${u.name} | 이메일(아이디): ${u.email}`));
  // 비밀번호 확인
  if (users.length > 0) {
    const ok = await bcrypt.compare('lasbook1122', users[0].password);
    console.log('  비밀번호 "lasbook1122" 일치 여부:', ok);
  }
}
main().finally(() => prisma.$disconnect());
