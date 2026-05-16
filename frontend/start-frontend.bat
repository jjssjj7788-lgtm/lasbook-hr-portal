@echo off
echo ========================================
echo  라스북 HR 포털 - 프론트엔드 시작
echo ========================================

cd /d "c:\Users\정상진\OneDrive\바탕 화면\라스북\직원 관리 프로젝트\frontend"

echo.
echo [1/2] date-fns 패키지 확인 (이미 설치됨)...

echo.
echo [2/2] 개발 서버 시작 (http://localhost:5173)...
call npm run dev
