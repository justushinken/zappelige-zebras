@echo off
rem Startet die lokale Vorschau der Website unter http://localhost:8080/
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\server.ps1" %*
pause
