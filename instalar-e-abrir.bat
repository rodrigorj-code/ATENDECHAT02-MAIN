@echo off
chcp 65001 >nul
title VBZappy - Instalar e abrir
echo.
echo ============================================================
echo   IMPORTANTE: Feche o Cursor/VS Code antes de continuar.
echo   (Arquivos em uso impedem a instalacao.)
echo ============================================================
echo.
pause

cd /d "%~dp0"

echo.
echo [1/3] Instalando BACKEND...
cd backend
if exist node_modules (
  echo      Removendo node_modules antigo...
  rmdir /s /q node_modules 2>nul
  if exist node_modules (
    echo      ERRO: Nao foi possivel remover. Feche o Cursor e tente de novo.
    pause
    exit /b 1
  )
)
call npm i
if errorlevel 1 (
  echo      ERRO na instalacao do backend.
  cd ..
  pause
  exit /b 1
)
cd ..
echo      Backend OK.
echo.

echo [2/3] Instalando FRONTEND...
cd frontend
if exist node_modules (
  echo      Removendo node_modules antigo...
  rmdir /s /q node_modules 2>nul
)
call npm i
if errorlevel 1 (
  echo      ERRO na instalacao do frontend.
  cd ..
  pause
  exit /b 1
)
cd ..
echo      Frontend OK.
echo.

echo [3/3] Iniciando Backend e Frontend...
echo.
start "Backend" cmd /k "cd /d %~dp0backend && set PORT=3000 && npm run dev:server"
timeout /t 6 /nobreak >nul
start "Frontend" cmd /k "cd /d %~dp0frontend && set PORT=5174 && npm start"

echo.
echo ============================================================
echo   Pronto.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5174
echo   Abra o navegador em http://localhost:5174
echo ============================================================
pause
