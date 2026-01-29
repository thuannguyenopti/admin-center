@echo off
setlocal

if "%1"=="install" goto run

echo Usage: axiomplay install
exit /b 1

:run
call "%~dp0install.bat"
exit /b %errorlevel%
