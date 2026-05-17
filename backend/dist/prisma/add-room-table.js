"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔧 Room 테이블 추가 시작...');
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Room" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "projectId" INTEGER NOT NULL,
      "name" TEXT NOT NULL,
      "managerId" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
    console.log('✅ Room 테이블 생성 완료');
    await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Room_projectId_name_key" ON "Room"("projectId", "name")
  `);
    console.log('✅ Room 유니크 인덱스 생성 완료');
    try {
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN "roomId" INTEGER REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);
        console.log('✅ User.roomId 컬럼 추가 완료');
    }
    catch (e) {
        if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
            console.log('ℹ️  User.roomId 컬럼이 이미 존재합니다 (건너뜀)');
        }
        else {
            console.error('⚠️  roomId 추가 중 오류:', e.message);
        }
    }
    console.log('\n🎉 DB 업데이트 완료!');
    console.log('📌 다음 명령어로 Prisma 클라이언트를 재생성하세요:');
    console.log('   npx prisma generate');
    console.log('\n📌 그리고 백엔드를 재시작하세요:');
    console.log('   npm run start:dev');
}
main()
    .catch((e) => {
    console.error('❌ 오류:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=add-room-table.js.map