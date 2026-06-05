import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AppProvider } from './context/AppContext.tsx'
import './index.css'

// -- Capacitor Android back-button handler -------------------------------------
// Only runs inside the Android WebView — no effect on web browser
async function setupAndroid() {
  try {
    const { App: CapApp } = await import('@capacitor/app');
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    const { SplashScreen } = await import('@capacitor/splash-screen');

    // Style status bar to match brand colour
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#C2185B' });

    // Back button: go back in history, or exit app if nothing to go back to
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else CapApp.exitApp();
    });

    // Hide splash after app mounts
    await SplashScreen.hide();
  } catch {
    // Not running inside Capacitor (web browser) — silently ignore
  }
}

setupAndroid();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
