@echo off
REM Script batch pour lancer tous les services en parallèle
REM Usage: start-all.bat

echo 🚀 Démarrage de tous les services...
echo.

REM Obtenir le chemin du répertoire du script
set "SCRIPT_DIR=%~dp0"

REM Lancer chaque service dans une nouvelle fenêtre
start "BACKEND" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm run dev"
timeout /t 1 /nobreak >nul

start "ADMIN" cmd /k "cd /d "%SCRIPT_DIR%frontend\admin" && npm run dev"
timeout /t 1 /nobreak >nul

start "CLIENT" cmd /k "cd /d "%SCRIPT_DIR%frontend\client" && npm run dev"
timeout /t 1 /nobreak >nul

start "RESTAURANT" cmd /k "cd /d "%SCRIPT_DIR%frontend\restaurant" && npm run dev"
timeout /t 1 /nobreak >nul

start "DELIVERER" cmd /k "cd /d "%SCRIPT_DIR%frontend\deliverer" && npm run dev"
timeout /t 1 /nobreak >nul

echo.
echo ✅ Tous les services ont été lancés dans des fenêtres séparées!
echo 💡 Pour arrêter tous les services, fermez les fenêtres correspondantes.
pause

