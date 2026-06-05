@echo off
echo ============================================
echo  Matrimonial Connect - Android Setup
echo ============================================
echo.

cd /d "%~dp0"

echo [1/5] Installing packages (including Capacitor)...
call npm install
if errorlevel 1 ( echo ERROR: npm install failed & pause & exit /b 1 )

echo.
echo [2/5] Building web app...
call npm run build
if errorlevel 1 ( echo ERROR: Build failed & pause & exit /b 1 )

echo.
echo [3/5] Adding Android platform...
call npx cap add android
if errorlevel 1 ( echo NOTE: Android platform may already exist, continuing... )

echo.
echo [4/5] Syncing web build to Android...
call npx cap sync android
if errorlevel 1 ( echo ERROR: Sync failed & pause & exit /b 1 )

echo.
echo [5/5] Opening Android Studio...
call npx cap open android

echo.
echo ============================================
echo  Done! Android Studio should now be open.
echo  Press Run (Shift+F10) to launch on device
echo  or emulator.
echo ============================================
pause
