@echo off
setlocal
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

start "Aritech API" cmd /k "cd /d "%~dp0apps\api" && node dist\main.js"
timeout /t 3 /nobreak >nul
start "Aritech Web" cmd /k "cd /d "%~dp0apps\web" && node_modules\.bin\next start"
timeout /t 3 /nobreak >nul

start "" "http://localhost:3000"

echo.
echo Duas janelas foram abertas: "Aritech API" e "Aritech Web".
echo Deixe as duas abertas enquanto estiver usando o sistema.
echo Para encerrar, rode "parar.bat" (ou feche as duas janelas).
echo.
pause
