# Start Slot Observation Application for Remote Access
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Slot Observation Application" -ForegroundColor Cyan
Write-Host "Server IP: 172.16.5.200" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Get the script directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "`nStarting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; npm run start:dev"
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; npm run dev -- -H 0.0.0.0"
Start-Sleep -Seconds 3

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Application Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend: http://172.16.5.200:3000" -ForegroundColor Green
Write-Host "Backend:  http://172.16.5.200:3001" -ForegroundColor Green
Write-Host "`nAccess from any computer on the network using:" -ForegroundColor Yellow
Write-Host "http://172.16.5.200:3000" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
