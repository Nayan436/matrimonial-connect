# Android Setup Guide

## First time (run once)
Double-click `setup-android.bat`

This will:
1. npm install (Capacitor + all packages)
2. Build the React web app
3. Create the android/ folder
4. Sync web assets into Android
5. Open Android Studio

## After any code change
Double-click `sync-android.bat`  
Then in Android Studio: Ctrl+F9 (Rebuild) then Shift+F10 (Run)

## Android Studio steps after first setup
1. Let Gradle sync finish (can take 2-5 min first time)
2. Connect Android phone via USB with Developer Mode ON
   OR use the built-in emulator (AVD Manager)
3. Press Shift+F10 (Run) to launch

## Required before publishing to Play Store
1. Add `google-services.json` to `android/app/`
   - Firebase Console ? Project Settings ? Android app ? Download google-services.json
2. Generate a signing keystore:
   Build ? Generate Signed Bundle / APK ? Android App Bundle
3. App icons: replace files in `android/app/src/main/res/mipmap-*/`
4. Splash screen: Capacitor generates it from config colors automatically

## Workflow summary
Web change ? sync-android.bat ? Android Studio Rebuild + Run
New feature ? git push ? Cloudflare Pages auto-deploys web
