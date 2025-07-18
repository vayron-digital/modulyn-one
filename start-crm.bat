@echo off
REM Find the first non-localhost IPv4 address and save to temp file
set "LOCAL_IP="
del ip.txt 2>nul
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%a"
    setlocal enabledelayedexpansion
    set "IP=!IP:~1!"
    if not "!IP!"=="127.0.0.1" if not "!IP!"=="" (
        echo !IP!>ip.txt
        endlocal
        goto :foundip
    )
    endlocal
)
:foundip

REM Read the IP from the temp file
if exist ip.txt (
    set /p LOCAL_IP=<ip.txt
    del ip.txt
)

REM Show what we found
echo Detected LOCAL_IP: %LOCAL_IP%

REM Validate LOCAL_IP is not empty and looks like an IPv4
set VALID_IP=0
for /f "tokens=1-4 delims=." %%a in ("%LOCAL_IP%") do (
  if not "%%a"=="" if not "%%b"=="" if not "%%c"=="" if not "%%d"=="" set VALID_IP=1
)
if "%VALID_IP%"=="0" (
  echo ERROR: Could not determine a valid local IP address. .env will NOT be written.
  echo HINT: Check your network connection or run as admin.
  pause
  exit /b 1
)

REM Set backend URL (change port if needed)
set BACKEND_URL=http://%LOCAL_IP%:3000

REM Write .env file for frontend
(echo VITE_API_BASE_URL=%BACKEND_URL%/api> frontend/.env
 echo VITE_SOCKET_URL=%BACKEND_URL%>> frontend/.env)

echo Updated frontend/.env with:
echo VITE_API_BASE_URL=%BACKEND_URL%/api
echo VITE_SOCKET_URL=%BACKEND_URL%

REM Start frontend dev server in a new window
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev -- --host"

REM Start backend dev server in a new window
start "Backend Dev Server" cmd /k "cd backend && npm run dev"

echo Both servers have been started in separate windows.
