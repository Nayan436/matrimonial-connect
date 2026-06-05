import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.matrimonialconnect.app',
  appName: 'Matrimonial Connect',
  webDir: 'dist',

  server: {
    // https scheme lets Firebase auth & Storage work without CORS issues
    androidScheme: 'https',
    cleartext: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: '#C2185B',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#C2185B',
      overlaysWebView: false,
    },
  },

  android: {
    minWebViewVersion: 60,
    // Allow mixed content for Firebase during dev (remove for production)
    allowMixedContent: false,
  },
};

export default config;
