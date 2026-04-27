Set shell = CreateObject("WScript.Shell")
shell.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & Replace(WScript.ScriptFullName, "1-click-local-hidden.vbs", "scripts\\reset-website.ps1") & """ -NoShare -Port 3100 -OpenBrowser", 0, False
