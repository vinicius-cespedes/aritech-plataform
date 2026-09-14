$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $root "apps\api"
$webDir = Join-Path $root "apps\web"
$apiPidFile = Join-Path $PSScriptRoot "api.pid"
$webPidFile = Join-Path $PSScriptRoot "web.pid"

Write-Host "Iniciando API..."
$api = Start-Process -FilePath "node" -ArgumentList "dist\main.js" -WorkingDirectory $apiDir -PassThru
Set-Content -Path $apiPidFile -Value $api.Id -Encoding ascii

Start-Sleep -Seconds 3

Write-Host "Iniciando site..."
# node_modules\.bin\next.cmd é só um wrapper batch que por sua vez lança um
# node.exe filho — precisamos registrar os dois PIDs (wrapper + node real),
# senão parar.bat mata só o wrapper e deixa o node.exe (com o site rodando
# de verdade) orfao.
$webWrapper = Start-Process -FilePath (Join-Path $webDir "node_modules\.bin\next.cmd") -ArgumentList "start" -WorkingDirectory $webDir -PassThru
Start-Sleep -Seconds 2
$webChild = Get-CimInstance Win32_Process -Filter "ParentProcessId=$($webWrapper.Id)" |
    Where-Object { $_.Name -eq "node.exe" } | Select-Object -First 1
$webPids = @($webWrapper.Id)
if ($webChild) { $webPids += $webChild.ProcessId }
Set-Content -Path $webPidFile -Value $webPids -Encoding ascii

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Aritech Digital iniciado (API PID $($api.Id), Web PID(s) $($webPids -join ', '))."
Write-Host "Duas novas janelas de console foram abertas - deixe-as abertas enquanto usar o sistema."
Write-Host "Para encerrar, rode parar.bat."
