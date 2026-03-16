@echo off
chcp 65001 >nul
echo ========================================
echo   VBZappy - Iniciando Backend e Frontend
echo ========================================
echo.

cd /d "%~dp0"

:: Inicia o backend em uma nova janela (porta 3000)
echo [1/2] Iniciando Backend (porta 3000)...
start "Backend - VBZappy" cmd /k "cd /d %~dp0backend && set PORT=3000 && npm run dev:server"
timeout /t 5 /nobreak >nul

:: Inicia o frontend em outra janela (porta 5174)
echo [2/2] Iniciando Frontend (porta 5174)...
start "Frontend - VBZappy" cmd /k "cd /d %~dp0frontend && set PORT=5174 && npm start"

echo.
echo Pronto! Duas janelas foram abertas:
echo   - Backend:  http://localhost:3000
echo   - Frontend: http://localhost:5174
echo.
echo Feche este script quando quiser. As janelas do backend e frontend continuarao abertas.
pause
