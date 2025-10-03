import "dotenv/config";

export default {
  name: "Uber Clone",
  slug: "uber-clone",
  version: process.env.npm_package_version || "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.codesistency_dev.uber",
    buildNumber: process.env.npm_package_version || "1.0.0",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.codesistency_dev.uber",
    versionCode: parseInt(
      (process.env.npm_package_version || "1.0.0").replace(/\./g, ""),
    ),
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: "35.0.0",
        },
        ios: {
          deploymentTarget: "15.1",
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
    environment: "development",
    eas: {
      projectId: "1c52b972-dfcc-4470-91d6-122cb54530cb",
    },
  },
};
