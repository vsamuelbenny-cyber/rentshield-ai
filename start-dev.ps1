# RentShield AI Development Launcher for Windows PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       RentShield AI - Development Environment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "`n[1/2] Starting Backend (FastAPI on http://127.0.0.1:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; & '.\.venv\Scripts\Activate.ps1'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Starting Frontend (Vite on http://localhost:5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm.cmd run dev"

Write-Host "`nServices launched in separate windows!" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
