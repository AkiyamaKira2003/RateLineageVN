param(
  [int]$Port = 3100,
  [switch]$NoShare,
  [int]$TunnelTimeoutSec = 35,
  [switch]$OpenBrowser
)

$ErrorActionPreference = "Stop"

function Decode-Utf8Base64([string]$base64Value) {
  return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64Value))
}

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ServerScript = Join-Path $Root "local-dev-server.js"

$ServerOutLog = Join-Path $Root "dev-server.out.log"
$ServerErrLog = Join-Path $Root "dev-server.err.log"
$ActiveOutLog = $ServerOutLog
$ActiveErrLog = $ServerErrLog

$TunnelOutLog = Join-Path $Root "tunnel.out.log"
$TunnelErrLog = Join-Path $Root "tunnel.err.log"
$PublicUrlFile = Join-Path $Root "public-url.txt"
$ShareMessageFile = Join-Path $Root "share-message.txt"
$ToolsDir = Join-Path $Root "tools"
$CloudflaredLocalPath = Join-Path $ToolsDir "cloudflared.exe"
$CloudflaredDownloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$DefaultTunnelPassword = "14.183.60.157"
$LinkLabel = Decode-Utf8Base64 "TGnDqm4ga+G6v3Q="
$PasswordLabel = Decode-Utf8Base64 "TeG6rXQga2jhuql1"
$ShareHint = Decode-Utf8Base64 "TuG6v3UgbeG7nyBsaW5rIGLhu4sgecOqdSBj4bqndSB4w6FjIG1pbmgsIG5o4bqtcCBN4bqtdCBraOG6qXUg4bufIHRyw6puLg=="

function Stop-ProcessSafe {
  param([int]$ProcessId)
  try {
    Stop-Process -Id $ProcessId -Force -ErrorAction Stop
    Wait-Process -Id $ProcessId -Timeout 5 -ErrorAction SilentlyContinue
  } catch {
    Write-Host "Cannot stop PID $ProcessId (maybe already exited)." -ForegroundColor Yellow
  }
}

function Stop-ListenerByPort {
  param([int]$TargetPort)
  $conn = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue
  if (-not $conn) { return }

  $pidList = $conn | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $pidList) {
    Stop-ProcessSafe -ProcessId $procId
  }
}

function Stop-StaleServerProcess {
  param([string]$ScriptPath)
  $escaped = [Regex]::Escape($ScriptPath)
  $procs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
    Where-Object { $_.CommandLine -match $escaped }

  foreach ($proc in $procs) {
    Stop-ProcessSafe -ProcessId $proc.ProcessId
  }
}

function Stop-TunnelProcesses {
  $tunnelNode = Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
    Where-Object {
      $_.CommandLine -match "localtunnel" -or
      $_.CommandLine -match "npx-cli\.js.*localtunnel"
    }

  foreach ($proc in $tunnelNode) {
    Stop-ProcessSafe -ProcessId $proc.ProcessId
  }

  $tunnelCloudflared = Get-CimInstance Win32_Process -Filter "Name='cloudflared.exe'" -ErrorAction SilentlyContinue
  foreach ($proc in $tunnelCloudflared) {
    if ($proc.CommandLine -match "--url\s+http://127\.0\.0\.1") {
      Stop-ProcessSafe -ProcessId $proc.ProcessId
    }
  }

  $tunnelCmd = Get-CimInstance Win32_Process -Filter "Name='cmd.exe'" |
    Where-Object { $_.CommandLine -match "localtunnel" }

  foreach ($proc in $tunnelCmd) {
    Stop-ProcessSafe -ProcessId $proc.ProcessId
  }
}

function Resolve-CloudflaredPath {
  $cloudflaredCmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cloudflaredCmd -and $cloudflaredCmd.Source) {
    return $cloudflaredCmd.Source
  }

  if (Test-Path $CloudflaredLocalPath) {
    return $CloudflaredLocalPath
  }

  try {
    if (-not (Test-Path $ToolsDir)) {
      New-Item -Path $ToolsDir -ItemType Directory -Force | Out-Null
    }

    Write-Host "Cloudflared not found. Downloading..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $CloudflaredDownloadUrl -OutFile $CloudflaredLocalPath -UseBasicParsing -TimeoutSec 90

    if (Test-Path $CloudflaredLocalPath) {
      $size = (Get-Item $CloudflaredLocalPath).Length
      if ($size -gt 2MB) {
        Write-Host "Cloudflared downloaded: $CloudflaredLocalPath" -ForegroundColor Green
        return $CloudflaredLocalPath
      }
    }
  } catch {
    Write-Host "Cannot download cloudflared automatically: $($_.Exception.Message)" -ForegroundColor Yellow
  }

  return $null
}

function Resolve-LogPath {
  param(
    [string]$PreferredPath,
    [string]$Prefix,
    [string]$Suffix
  )

  try {
    Set-Content -Path $PreferredPath -Value "" -Encoding UTF8 -ErrorAction Stop
    return $PreferredPath
  } catch {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $fallback = Join-Path $Root ("{0}.{1}.{2}.log" -f $Prefix, $stamp, $Suffix)
    New-Item -Path $fallback -ItemType File -Force | Out-Null
    return $fallback
  }
}

function Wait-ServerReady {
  param([int]$TargetPort, [int]$TimeoutSec = 12)
  $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
  while ($stopwatch.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try {
      $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$TargetPort/" -UseBasicParsing -TimeoutSec 2
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Milliseconds 300
    }
  }
  return $false
}

function Wait-TunnelUrl {
  param(
    [string]$OutLog,
    [string]$ErrLog,
    [string[]]$Patterns,
    [int]$TimeoutSec
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    $combined = ""
    if (Test-Path $OutLog) {
      $combined += (Get-Content $OutLog -Raw -ErrorAction SilentlyContinue)
    }
    if (Test-Path $ErrLog) {
      $combined += "`n"
      $combined += (Get-Content $ErrLog -Raw -ErrorAction SilentlyContinue)
    }

    foreach ($pattern in $Patterns) {
      if ($combined -match $pattern) {
        return $matches[0]
      }
    }

    Start-Sleep -Milliseconds 600
  }

  return $null
}

function Start-TunnelAndGetUrl {
  param([int]$TargetPort, [int]$TimeoutSec)

  Stop-TunnelProcesses

  $activeTunnelOutLog = Resolve-LogPath -PreferredPath $TunnelOutLog -Prefix "tunnel" -Suffix "out"
  $activeTunnelErrLog = Resolve-LogPath -PreferredPath $TunnelErrLog -Prefix "tunnel" -Suffix "err"

  $provider = ""
  $proc = $null
  $patterns = @()
  $cloudflaredPath = Resolve-CloudflaredPath

  if ($cloudflaredPath) {
    $provider = "cloudflared"
    $proc = Start-Process `
      -FilePath $cloudflaredPath `
      -ArgumentList @("tunnel", "--url", "http://127.0.0.1:$TargetPort") `
      -WorkingDirectory $Root `
      -PassThru `
      -WindowStyle Hidden `
      -RedirectStandardOutput $activeTunnelOutLog `
      -RedirectStandardError $activeTunnelErrLog
    $patterns = @("https://[a-z0-9-]+\.trycloudflare\.com")
  } else {
    $provider = "localtunnel"
    $proc = Start-Process `
      -FilePath "cmd.exe" `
      -ArgumentList @("/c", "npx --yes localtunnel --port $TargetPort") `
      -WorkingDirectory $Root `
      -PassThru `
      -WindowStyle Hidden `
      -RedirectStandardOutput $activeTunnelOutLog `
      -RedirectStandardError $activeTunnelErrLog
    $patterns = @("https://[a-z0-9-]+\.loca\.lt")
  }

  $url = Wait-TunnelUrl -OutLog $activeTunnelOutLog -ErrLog $activeTunnelErrLog -Patterns $patterns -TimeoutSec $TimeoutSec
  if (-not $url) {
    throw "Cannot get public URL. Check: $activeTunnelOutLog / $activeTunnelErrLog"
  }

  return @{
    Provider = $provider
    Url = $url
    ProcessId = $proc.Id
    OutLog = $activeTunnelOutLog
    ErrLog = $activeTunnelErrLog
  }
}

if (-not (Test-Path $ServerScript)) {
  throw "Cannot find server file: $ServerScript"
}

Write-Host "1) Reset local server..." -ForegroundColor Cyan
Stop-ListenerByPort -TargetPort $Port
Stop-StaleServerProcess -ScriptPath $ServerScript

$ActiveOutLog = Resolve-LogPath -PreferredPath $ServerOutLog -Prefix "dev-server" -Suffix "out"
$ActiveErrLog = Resolve-LogPath -PreferredPath $ServerErrLog -Prefix "dev-server" -Suffix "err"

Write-Host "2) Start website..." -ForegroundColor Cyan
$serverProc = Start-Process `
  -FilePath "node" `
  -ArgumentList "`"$ServerScript`" --port $Port" `
  -WorkingDirectory $Root `
  -PassThru `
  -WindowStyle Hidden `
  -RedirectStandardOutput $ActiveOutLog `
  -RedirectStandardError $ActiveErrLog

if (-not (Wait-ServerReady -TargetPort $Port)) {
  throw "Server cannot start on port $Port. Check: $ActiveErrLog"
}

Write-Host "Local URL: http://127.0.0.1:$Port" -ForegroundColor Green
Write-Host "Server PID: $($serverProc.Id)" -ForegroundColor DarkGray
Write-Host "OUT LOG: $ActiveOutLog" -ForegroundColor DarkGray
Write-Host "ERR LOG: $ActiveErrLog" -ForegroundColor DarkGray

if ($NoShare) {
  $contentLines = @(
    "PublicUrl=http://127.0.0.1:$Port",
    "Password=$DefaultTunnelPassword"
  )
  Set-Content -Path $PublicUrlFile -Value ($contentLines -join [Environment]::NewLine) -Encoding UTF8

  $localShareLines = @(
    "Kira Rate Adena VN Lineage Classic",
    ("{0}: http://127.0.0.1:{1}" -f $LinkLabel, $Port),
    ("{0}: {1}" -f $PasswordLabel, $DefaultTunnelPassword)
  )
  $localShareText = $localShareLines -join [Environment]::NewLine
  Set-Content -Path $ShareMessageFile -Value $localShareText -Encoding UTF8

  Write-Host "Skip public tunnel (-NoShare)." -ForegroundColor Yellow
  Write-Host "PUBLIC_URL=http://127.0.0.1:$Port" -ForegroundColor Yellow
  exit 0
}

Write-Host "3) Start tunnel + wait URL..." -ForegroundColor Cyan
$tunnel = Start-TunnelAndGetUrl -TargetPort $Port -TimeoutSec $TunnelTimeoutSec

$publicUrl = $tunnel.Url

# Simple health-check for returned public URL.
try {
  $resp = Invoke-WebRequest -Uri $publicUrl -UseBasicParsing -TimeoutSec 12
  Write-Host "Public check: HTTP $($resp.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "Public check warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

$passwordValue = $DefaultTunnelPassword
if ($tunnel.Provider -eq "localtunnel") {
  try {
    $pwResp = Invoke-WebRequest -Uri "https://loca.lt/mytunnelpassword" -UseBasicParsing -TimeoutSec 8
    $pw = ($pwResp.Content | Out-String).Trim()
    if ($pw) {
      $passwordValue = $pw
      Write-Host "Tunnel password: $pw" -ForegroundColor Yellow
    }
  } catch {
    Write-Host "Cannot fetch tunnel password now." -ForegroundColor Yellow
  }
}

$contentLines = @(
  "PublicUrl=$publicUrl",
  "Password=$passwordValue"
)

Set-Content -Path $PublicUrlFile -Value ($contentLines -join [Environment]::NewLine) -Encoding UTF8

$shareLines = @(
  "Kira Rate Adena VN Lineage Classic",
  ("{0}: {1}" -f $LinkLabel, $publicUrl),
  ("{0}: {1}" -f $PasswordLabel, $passwordValue),
  "",
  $ShareHint
)
$shareText = $shareLines -join [Environment]::NewLine
Set-Content -Path $ShareMessageFile -Value $shareText -Encoding UTF8

try {
  if (Get-Command Set-Clipboard -ErrorAction SilentlyContinue) {
    Set-Clipboard -Value $shareText
  }
} catch {}

if ($OpenBrowser) {
  Start-Process $publicUrl | Out-Null
}

Write-Host "Tunnel provider: $($tunnel.Provider)" -ForegroundColor Green
if ($tunnel.Provider -eq "localtunnel") {
  Write-Host "Warning: localtunnel may hide OG preview on Zalo/Discord due gateway verification." -ForegroundColor Yellow
}
Write-Host "Tunnel PID: $($tunnel.ProcessId)" -ForegroundColor DarkGray
Write-Host "Tunnel OUT: $($tunnel.OutLog)" -ForegroundColor DarkGray
Write-Host "Tunnel ERR: $($tunnel.ErrLog)" -ForegroundColor DarkGray
Write-Host "Public URL saved: $PublicUrlFile" -ForegroundColor Green
Write-Host "Share message saved: $ShareMessageFile" -ForegroundColor Green
Write-Host "PUBLIC_URL=$publicUrl" -ForegroundColor Green
Write-Host ""
Write-Host "===== COPY THIS TO ZALO / DISCORD =====" -ForegroundColor Cyan
Write-Host $shareText -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Cyan
