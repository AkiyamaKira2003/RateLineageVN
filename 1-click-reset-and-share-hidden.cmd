@echo off
setlocal
set "ROOT=%~dp0"

if not exist "%ROOT%1-click-reset-and-share-hidden.vbs" (
  echo Missing launcher: 1-click-reset-and-share-hidden.vbs
  exit /b 1
)

start "" wscript.exe //nologo "%ROOT%1-click-reset-and-share-hidden.vbs"
exit /b 0
