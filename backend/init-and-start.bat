@echo off
echo ========================================
echo  라스북 HR 포털 - DB 초기화 및 서버 시작
echo ========================================

cd /d "c:\Users\정상진\OneDrive\바탕 화면\라스북\직원 관리 프로젝트\backend"

echo.
echo [1/5] date-fns 패키지 설치...
call npm install date-fns

echo.
echo [2/5] 기존 DB 파일 삭제...
if exist "prisma\dev.db" del /f "prisma\dev.db"
if exist "prisma\dev.db-shm" del /f "prisma\dev.db-shm"
if exist "prisma\dev.db-wal" del /f "prisma\dev.db-wal"

echo.
echo [3/5] Prisma 마이그레이션 실행 (신규 스키마 적용)...
call npx prisma migrate dev --name "v2_lasbook_hr_portal" --skip-seed

echo.
echo [4/5] Prisma 클라이언트 생성...
call npx prisma generate

echo.
echo [5/5] Seed 데이터 주입 (프로젝트/직급/상품/Admin 계정)...
call npx ts-node prisma/seed.ts

echo.
echo ========================================
echo  완료! 백엔드 서버를 시작합니다...
echo  Admin 계정: ADMIN-001 / admin1234!
echo ========================================
call npm run start:dev
