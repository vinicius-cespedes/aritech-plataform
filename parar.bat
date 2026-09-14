@echo off
cd /d "%~dp0"
echo Encerrando Aritech Digital (API e Web)...
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\parar.ps1"
echo O banco de dados continua rodando normalmente (servico do Windows).
pause
