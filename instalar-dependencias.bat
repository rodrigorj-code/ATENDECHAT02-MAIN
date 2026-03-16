@echo off
chcp 65001 >nul
echo ========================================
echo   VBZappy - Instalando dependencias
echo ========================================
echo   Use o CMD (Prompt de Comando), nao o PowerShell,
echo   para evitar erro de politica de execucao.
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Instalando dependencias do BACKEND...
cd backend
if exist node_modules (
  echo Removendo node_modules antigo do backend...
  rmdir /s /q node_modules
)
call npm i
if errorlevel 1 (
  echo ERRO na instalacao do backend.
  pause
  exit /b 1
)
cd ..
echo Backend OK.
echo.

echo [2/2] Instalando dependencias do FRONTEND...
cd frontend
if exist node_modules (
  echo Removendo node_modules antigo do frontend...
  rmdir /s /q node_modules
)
call npm i
if errorlevel 1 (
  echo ERRO na instalacao do frontend.
  pause
  exit /b 1
)
cd ..
echo Frontend OK.
echo.

echo ========================================
echo   Instalacao concluida.
echo   Execute "iniciar-sistema.bat" para subir backend e frontend.
echo ========================================
pause
