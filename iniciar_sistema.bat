@echo off
echo Iniciando o sistema...

echo Abrindo Backend...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Abrindo Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Sistema iniciando em janelas separadas.
