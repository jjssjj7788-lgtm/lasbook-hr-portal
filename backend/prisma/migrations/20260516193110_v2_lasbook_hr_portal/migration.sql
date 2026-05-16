-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Position" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fee1st" INTEGER NOT NULL DEFAULT 0,
    "fee2nd" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Position_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberType" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "step" TEXT,
    "language" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "User" (
    "employeeId" TEXT NOT NULL PRIMARY KEY,
    "projectId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentEmployeeId" TEXT,
    "contractStart" DATETIME NOT NULL,
    "isStoreOwner" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "bank" TEXT,
    "accountNumber" TEXT,
    "accountHolder" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_parentEmployeeId_fkey" FOREIGN KEY ("parentEmployeeId") REFERENCES "User" ("employeeId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "educationDate" DATETIME NOT NULL,
    "branchName" TEXT NOT NULL,
    "branchLabel" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "isPresent" BOOLEAN NOT NULL DEFAULT false,
    "transportFee" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "User" ("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User" ("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "saleDate" DATETIME NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "actualAmount" INTEGER NOT NULL,
    "deductedFee" INTEGER NOT NULL DEFAULT 0,
    "netAmount" INTEGER NOT NULL,
    "salesWeek" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sale_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" TEXT NOT NULL,
    "prospectCount" INTEGER NOT NULL DEFAULT 0,
    "counselContent" TEXT,
    "specialNotes" TEXT,
    "adminEvaluation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityFee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "payMonth" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "paymentRound" INTEGER NOT NULL,
    "grossAmount" INTEGER NOT NULL,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "netAmount" INTEGER NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityFee_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActivityFee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyCommission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "settlementMonth" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "netSalesTotal" INTEGER NOT NULL DEFAULT 0,
    "achievementGrade" TEXT,
    "performanceRate" REAL NOT NULL DEFAULT 0,
    "performanceBonus" INTEGER NOT NULL DEFAULT 0,
    "subsidy" INTEGER NOT NULL DEFAULT 0,
    "totalGross" INTEGER NOT NULL DEFAULT 0,
    "netAmount" INTEGER NOT NULL DEFAULT 0,
    "firstPaymentDue" DATETIME,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyCommission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MonthlyCommission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Position_projectId_code_key" ON "Position"("projectId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityFee_employeeId_paymentRound_payMonth_key" ON "ActivityFee"("employeeId", "paymentRound", "payMonth");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyCommission_employeeId_settlementMonth_key" ON "MonthlyCommission"("employeeId", "settlementMonth");
