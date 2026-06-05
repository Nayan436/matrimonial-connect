@echo off
echo [Sync] Building and syncing to Android...
cd /d "%~dp0"
call npm run build && npx cap sync android
echo [Sync] Done. Rebuild in Android Studio (Ctrl+F9) to see changes.
pause
