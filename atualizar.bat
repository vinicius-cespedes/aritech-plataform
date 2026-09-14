@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Aritech Digital - atualizando
echo ============================================
echo Isso reinstala dependencias, aplica migracoes pendentes do banco
echo e recompila a API e o site. Use sempre que houver uma novidade.
echo.

echo Encerrando API/Web, se estiverem rodando...
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\parar.ps1" >nul 2>&1

call pnpm install
if errorlevel 1 goto :erro

call pnpm --filter @aritech/database exec prisma migrate deploy
if errorlevel 1 goto :erro

call pnpm build
if errorlevel 1 goto :erro

echo.
echo Atualizado com sucesso. Rode "iniciar.bat" para usar o sistema.
pause
exit /b 0

:erro
echo.
echo [ERRO] Algo falhou durante a atualizacao - veja a mensagem acima.
pause
exit /b 1
