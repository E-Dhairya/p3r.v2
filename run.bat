@echo off
title Persona 3 Reload Portfolio Launcher
cd /d "%~dp0"

echo [S.E.E.S. TERMINAL] Checking Persona 3 Reload Server...
powershell -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 8090); exit 0 } catch { exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo [S.E.E.S. TERMINAL] Starting background server on port 8090...
    start /b powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File .\server.ps1
    timeout /t 2 /nobreak >nul
)

echo [S.E.E.S. TERMINAL] Launching in browser...
start http://localhost:8090/
