@echo off
cd /d "%~dp0"

echo ============================================
echo   Aritech Digital - iniciando
echo ============================================
echo.
echo Banco de dados (PostgreSQL) roda como servico do Windows
echo e ja fica sempre disponivel - nao precisa iniciar aqui.
echo.

if not exist "apps\api\dist\main.js" (
  echo [ERRO] apps\api\dist nao existe ainda.
  echo Rode primeiro "atualizar.bat" para instalar e compilar.
  pause
  exit /b 1
)
if not exist "apps\web\.next" (
  echo [ERRO] apps\web\.next nao existe ainda.
  echo Rode primeiro "atualizar.bat" para instalar e compilar.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\iniciar.ps1"

echo.
pause
