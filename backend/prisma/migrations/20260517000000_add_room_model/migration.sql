-- CreateTable: Room (팀 관리)
CREATE TABLE IF NOT EXISTS "Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Room_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex: Room name unique per project
CREATE UNIQUE INDEX IF NOT EXISTS "Room_projectId_name_key" ON "Room"("projectId", "name");

-- AlterTable: User에 roomId 컬럼 추가
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roomId" INTEGER REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
