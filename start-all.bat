@echo off
echo ========================================
echo Starting Tennis Analysis Full Stack App
echo ========================================
echo.
echo This will start both Backend and Frontend servers
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop the servers
echo.

start "Tennis Analysis - Backend" cmd /k "start-backend.bat"
timeout /t 5 /nobreak

start "Tennis Analysis - Frontend" cmd /k "start-frontend.bat"

echo.
echo Both servers are starting in separate windows...
echo Wait a few seconds for them to be ready.
echo.
echo Then open your browser at: http://localhost:3000
echo.
pause
