$dir = $PSScriptRoot
$any = $false
foreach ($name in @("api", "web")) {
    $f = Join-Path $dir "$name.pid"
    if (Test-Path $f) {
        $pids = Get-Content $f | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '^\d+$' }
        foreach ($procId in $pids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction Stop
                Write-Host "Encerrado: $name (PID $procId)."
                $any = $true
            } catch {
                Write-Host "$name (PID $procId) ja nao estava rodando."
            }
        }
        Remove-Item $f -Force -ErrorAction SilentlyContinue
    }
}
if (-not $any) {
    Write-Host "Nada para encerrar (nenhum arquivo de PID encontrado)."
}
