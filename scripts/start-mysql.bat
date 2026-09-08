@echo off
:: Batch script to start MySQL80 service with Administrator elevation
echo ========================================================
echo Starting MySQL80 Service with Administrator Privileges
echo ========================================================
powershell -Command "Start-Process cmd -ArgumentList '/c net start MySQL80 && echo MySQL started successfully! && timeout /t 2' -Verb RunAs -Wait"

echo.
echo Restarting PM2 processes (newsfree365-api, newsfree365-worker)...
pm2 restart newsfree365-api newsfree365-worker
echo.
pm2 status
pause
