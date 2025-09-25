import 'dotenv/config';

export default {
  name: 'Uber Clone',
  slug: 'uber-clone',
  version: process.env.npm_package_version || '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.uberclone.app',
    buildNumber: process.env.npm_package_version || '1.0.0',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.uberclone.app',
    versionCode: parseInt((process.env.npm_package_version || '1.0.0').replace(/\./g, '')),
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
        },
        ios: {
          deploymentTarget: '15.1',
        },
      },
    ],
  ],
  extra: {
    serverUrl: process.env.EXPO_PUBLIC_SERVER_URL,
    wsUrl: process.env.EXPO_PUBLIC_WS_URL,
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    environment: 'development',
    eas: {
      projectId: '1c52b972-dfcc-4470-91d6-122cb54530cb',
    },
  },
};
