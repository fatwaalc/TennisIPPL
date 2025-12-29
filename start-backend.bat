@echo off
echo ========================================
echo Starting Tennis Analysis Backend Server
echo ========================================
echo.

cd backend

echo Checking Python installation...
python --version
echo.

echo Installing/Updating dependencies...
pip install -r requirements.txt
echo.

echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python app.py
