@echo off
setlocal enabledelayedexpansion

set REPO_ROOT=%~dp0
set MIN_NODE_MAJOR=18

echo [axiom-play] Starting Windows installer...

:: Check Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo [axiom-play] Node.js not found. Please install Node.js 20 LTS with: winget install OpenJS.NodeJS.LTS
  pause
  exit /b 1
)

for /f "tokens=1 delims=Vv" %%a in ('node -v') do set NODE_VER=%%a
for /f "tokens=1 delims=." %%a in ("%NODE_VER%") do set NODE_MAJOR=%%a
if %NODE_MAJOR% lss %MIN_NODE_MAJOR% (
  echo [axiom-play] Node.js version is too old. Please install Node.js 20 LTS with: winget install OpenJS.NodeJS.LTS
  pause
  exit /b 1
)

echo [axiom-play] Enabling Corepack (if this fails, re-run from an admin PowerShell window)...
corepack enable 2>nul

if not exist "%REPO_ROOT%.env" (
  echo [axiom-play] Creating .env (stored locally only)...
  set /p OPENAI_API_KEY=Enter OPENAI_API_KEY: 
  set /p OPTIMIZELY_AUTH_IDENT=Enter OPTIMIZELY_AUTH_IDENT: 
  set /p OPTIMIZELY_USERNAME=Enter OPTIMIZELY_USERNAME: 
  set /p OPTIMIZELY_PASSWORD=Enter OPTIMIZELY_PASSWORD: 
  > "%REPO_ROOT%.env" echo OPENAI_API_KEY=%OPENAI_API_KEY%
  >> "%REPO_ROOT%.env" echo OPTIMIZELY_AUTH_IDENT=%OPTIMIZELY_AUTH_IDENT%
  >> "%REPO_ROOT%.env" echo OPTIMIZELY_USERNAME=%OPTIMIZELY_USERNAME%
  >> "%REPO_ROOT%.env" echo OPTIMIZELY_PASSWORD=%OPTIMIZELY_PASSWORD%
)

for /f "usebackq tokens=1 delims=" %%a in ("%REPO_ROOT%.env") do set %%a

echo [axiom-play] Installing dependencies with Yarn...
yarn install

choice /m "Start the dev server now"
if errorlevel 2 goto done

start "" http://localhost:3000
yarn dev
goto end

:done
echo [axiom-play] Skipped starting dev server. Run "yarn dev" when ready.

:end
endlocal
