@echo off
echo Encerrando Aritech Digital (API e Web)...
taskkill /F /FI "WINDOWTITLE eq Aritech API*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Aritech Web*" >nul 2>&1
echo Encerrado. O banco de dados continua rodando normalmente (servico do Windows).
pause
