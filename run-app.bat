@echo off
echo ========================================================
echo   DEEPSYNC - Launching Application (Offline Ready)
echo ========================================================
echo.

echo [1/2] Starting Spring Boot Backend API on port 8081...
start "DEEPSYNC Backend" cmd /k "mvnw.cmd spring-boot:run"

echo [2/2] Starting Frontend Vite Web Server on port 5173...
cd frontend
start "DEEPSYNC Frontend" cmd /k "npm run dev"

echo.
echo Application launched!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8081/api
echo ========================================================

