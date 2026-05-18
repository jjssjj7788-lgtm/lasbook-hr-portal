@echo off
chcp 65001 > nul
echo ╔══════════════════════════════════════╗
echo ║    상품 데이터 초기화 도구           ║
echo ╚══════════════════════════════════════╝
echo.
echo 실행 중: node fix-products.js
echo.
node fix-products.js
echo.
echo 완료! 아무 키나 누르면 창이 닫힙니다.
pause > nul
