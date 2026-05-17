@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   라스북 DB Room 테이블 추가
echo ========================================
echo.

cd /d "c:\Users\정상진\OneDrive\바탕 화면\라스북\직원 관리 프로젝트\backend"

echo [1/3] Room 테이블 DB에 추가 중...
npx ts-node prisma/add-room-table.ts
if %errorlevel% neq 0 (
    echo.
    echo ❌ 실패! 다음을 시도합니다...
    npx prisma db push --accept-data-loss
)

echo.
echo [2/3] Prisma 클라이언트 재생성...
npx prisma generate

echo.
echo [3/3] Seed 데이터 적용...
npx ts-node prisma/seed.ts

echo.
echo ========================================
echo ✅ 완료! 백엔드를 재시작하세요.
echo    백엔드 터미널에서: Ctrl+C 후 npm run start:dev
echo ========================================
echo.
pause
