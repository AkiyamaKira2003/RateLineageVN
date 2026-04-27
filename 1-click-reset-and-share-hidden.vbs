Set shell = CreateObject("WScript.Shell")
shell.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & Replace(WScript.ScriptFullName, "1-click-reset-and-share-hidden.vbs", "scripts\\reset-website.ps1") & """ -Port 3100 -OpenBrowser", 0, False
