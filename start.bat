@echo off
title Qubis is starting...
echo [QUBIS] program is starting, please wait...

:: Docker Desktop'ı başlat
start "" /min "C:\Program Files\Docker\Docker\Docker Desktop.exe"
timeout /t 25 >nul

:: Guacamole docker-compose
cd /d "%~dp0guacamole"
start "" /min cmd /c "docker-compose up -d"

:: Frontend başlat (sessiz)
cd /d "%~dp0frontend"
start "" /min cmd /c "npm start"

:: Backend (app.exe) başlat - gizli pencere ile
powershell -NoProfile -WindowStyle Hidden -Command ^
"Start-Process -FilePath 'app.exe' -WorkingDirectory '%~dp0backend' -WindowStyle Hidden"

exit
