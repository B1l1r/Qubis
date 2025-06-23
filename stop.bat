@echo off
title Qubis is stopping...
echo.
echo [QUBIS] closing. Please wait...
echo.

:: PowerShell ile loglu işlem durdurma
powershell -NoProfile -Command "try { Write-Host '[+] Frontend (node.exe) durduruluyor...'; Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Write-Host '[✓] Frontend durduruldu.' } catch { Write-Host '[!] Frontend kapatılamadı.' }; try { Write-Host '[+] Backend (python.exe) durduruluyor...'; Stop-Process -Name python -Force -ErrorAction SilentlyContinue; Write-Host '[✓] Backend durduruldu.' } catch { Write-Host '[!] Backend kapatılamadı.' }"


:: Guacamole docker-compose'ı durdur
echo.
echo [QUBIS] Guacamole is stopping...
cd /d "%~dp0guacamole"
docker-compose down

:: İsteğe bağlı olarak Docker Desktop'ı kapat
:: powershell -Command "Stop-Process -Name 'Docker Desktop' -Force -ErrorAction SilentlyContinue"

:: app.exe işlemini sonlandır
taskkill /IM app.exe /F >nul 2>&1

echo [QUBIS] app.exe durduruldu.
echo.
echo [QUBIS] All process stopped.
echo Please enter to close the window
pause >nul
exit
