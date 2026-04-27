@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"

echo =========================================
echo   RateLineageVN - 1 Click Reset + Share
echo =========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\reset-website.ps1"
set "EXITCODE=%ERRORLEVEL%"

set "PUBLIC_URL="
set "PUBLIC_PASSWORD="
if exist ".\public-url.txt" (
  for /f "usebackq tokens=1,* delims==" %%A in (".\public-url.txt") do (
    if /I "%%A"=="PublicUrl" set "PUBLIC_URL=%%B"
    if /I "%%A"=="Password" set "PUBLIC_PASSWORD=%%B"
  )
)

echo.
if "%EXITCODE%"=="0" (
  echo Done.
  echo -----------------------------------------
  echo SHARE INFO
  echo -----------------------------------------
  if defined PUBLIC_URL (
    echo Public URL: !PUBLIC_URL!
    if defined PUBLIC_PASSWORD (
      echo Password: !PUBLIC_PASSWORD!
    )
  ) else (
    echo Public URL was not found in public-url.txt
  )
  if exist ".\share-message.txt" (
    echo.
    echo Share message file: .\share-message.txt
    echo -----------------------------------------
    for /f "usebackq delims=" %%L in (".\share-message.txt") do (
      echo %%L
    )
    echo -----------------------------------------
  )
) else (
  echo Failed with exit code %EXITCODE%.
  echo Check dev-server.err.log and tunnel.err.log
)
echo.
pause
exit /b %EXITCODE%
