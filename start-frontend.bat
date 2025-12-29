@echo off
echo ========================================
echo Starting Tennis Analysis Frontend (Next.js)
echo ========================================
echo.

cd front-end

echo Checking Node.js installation...
node --version
echo.

echo Installing/Updating dependencies...
call npm install
echo.

echo Starting Next.js development server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm run dev
