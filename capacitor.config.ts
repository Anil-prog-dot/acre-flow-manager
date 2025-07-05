import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.301e610228b34abc854e2cc816813272',
  appName: 'acre-flow-manager',
  webDir: 'dist',
  server: {
    url: 'https://301e6102-28b3-4abc-854e-2cc816813272.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#220 35% 96%',
      showSpinner: true,
      spinnerColor: '#260 60% 75%'
    }
  }
};

export default config;