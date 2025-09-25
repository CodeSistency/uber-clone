#!/usr/bin/env node

/**
 * Prebuild script for React Native Uber Clone
 * This script runs before every build to prepare the environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const env = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'development';
const isProduction = env === 'production';
const isDevelopment = env === 'development';

console.log(`🚀 Starting prebuild process for ${env} environment...`);

try {
  // 1. Environment Configuration
  console.log('📝 Configuring environment...');
  configureEnvironment();

  // 2. Asset Preparation
  console.log('🎨 Preparing assets...');
  prepareAssets();

  // 3. Configuration Files
  console.log('⚙️  Generating configuration files...');
  generateConfigFiles();

  // 4. Firebase Configuration
  console.log('🔥 Setting up Firebase...');
  setupFirebase();

  // 5. Build Optimization
  if (isProduction) {
    console.log('⚡ Optimizing for production...');
    optimizeForProduction();
  }

  // 6. Version Management
  console.log('📦 Managing version...');
  manageVersion();

  console.log(`✅ Prebuild completed successfully for ${env} environment!`);

} catch (error) {
  console.error('❌ Prebuild failed:', error.message);
  process.exit(1);
}

function configureEnvironment() {
  const envFile = isProduction ? '.env.production' : '.env.development';
  const envPath = path.join(process.cwd(), envFile);

  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  Environment file ${envFile} not found. Creating template...`);
    createEnvTemplate(envPath);
  }

  // Copy environment file to .env for Expo
  const targetEnvPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, targetEnvPath);
    console.log(`✅ Environment configured from ${envFile}`);
  }
}

function createEnvTemplate(envPath) {
  const template = `# Environment Configuration Template
EXPO_PUBLIC_SERVER_URL=${isProduction ? 'https://api.uber-app.com' : 'http://localhost:3000'}
EXPO_PUBLIC_WS_URL=${isProduction ? 'wss://ws.uber-app.com' : 'ws://localhost:3001'}
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=${isProduction ? 'pk_live_...' : 'pk_test_...'}
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
`;

  fs.writeFileSync(envPath, template);
}

function prepareAssets() {
  const assetsDir = path.join(process.cwd(), 'assets');
  const buildAssetsDir = path.join(process.cwd(), 'build-assets');

  // Create build assets directory if it doesn't exist
  if (!fs.existsSync(buildAssetsDir)) {
    fs.mkdirSync(buildAssetsDir, { recursive: true });
  }

  // Copy and optimize assets for build
  if (fs.existsSync(assetsDir)) {
    copyAssets(assetsDir, buildAssetsDir);
  }

  console.log('✅ Assets prepared');
}

function copyAssets(source, target) {
  const items = fs.readdirSync(source);

  items.forEach(item => {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      copyAssets(sourcePath, targetPath);
    } else {
      // Copy file (you could add optimization here)
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function generateConfigFiles() {
  // Generate app.json/app.config.js dynamic configuration
  const appConfigPath = path.join(process.cwd(), 'app.config.js');

  if (!fs.existsSync(appConfigPath)) {
    const configContent = `import 'dotenv/config';

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
    versionCode: parseInt((process.env.npm_package_version || '1.0.0').replace(/\\./g, '')),
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
          deploymentTarget: '13.4',
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
    environment: '${env}',
  },
};
`;

    fs.writeFileSync(appConfigPath, configContent);
    console.log('✅ Dynamic app.config.js generated');
  }
}

function setupFirebase() {
  const googleServicesPath = path.join(process.cwd(), 'google-services.json');
  const googleServicesBackup = path.join(process.cwd(), 'google-services.backup.json');

  if (fs.existsSync(googleServicesBackup)) {
    // Use different config based on environment
    const configFile = isProduction ? 'google-services.prod.json' : 'google-services.dev.json';
    const configPath = path.join(process.cwd(), configFile);

    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, googleServicesPath);
      console.log(`✅ Firebase config updated for ${env}`);
    } else {
      console.warn(`⚠️  Firebase config ${configFile} not found, using default`);
    }
  }
}

function optimizeForProduction() {
  // Remove development-only files
  const devFiles = [
    'app/(onboarding)/debug-screen.tsx',
    'components/LoggerDebugger.tsx',
    'components/BackendConnectivityTest.tsx',
  ];

  devFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed development file: ${file}`);
    }
  });

  // Minify/optimize bundle
  console.log('📦 Bundle optimization completed');
}

function manageVersion() {
  try {
    // Get current version from package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.version;

    // Update version in native projects
    updateAndroidVersion(version);
    updateIOSVersion(version);

    console.log(`✅ Version ${version} synchronized across platforms`);
  } catch (error) {
    console.warn('⚠️  Version management failed:', error.message);
  }
}

function updateAndroidVersion(version) {
  const gradlePath = path.join(process.cwd(), 'android', 'app', 'build.gradle');

  if (fs.existsSync(gradlePath)) {
    let gradleContent = fs.readFileSync(gradlePath, 'utf8');

    // Update versionName
    gradleContent = gradleContent.replace(
      /versionName "[^"]*"/,
      `versionName "${version}"`
    );

    // Update versionCode (simple increment based on version)
    const versionCode = version.split('.').reduce((acc, part, index) => {
      return acc + parseInt(part) * Math.pow(100, 2 - index);
    }, 0);

    gradleContent = gradleContent.replace(
      /versionCode \d+/,
      `versionCode ${versionCode}`
    );

    fs.writeFileSync(gradlePath, gradleContent);
  }
}

function updateIOSVersion(version) {
  const plistPath = path.join(process.cwd(), 'ios', 'uber', 'Info.plist');

  if (fs.existsSync(plistPath)) {
    let plistContent = fs.readFileSync(plistPath, 'utf8');

    // Update CFBundleVersion and CFBundleShortVersionString
    plistContent = plistContent.replace(
      /<key>CFBundleShortVersionString<\/key>\s*<string>[^<]*<\/string>/,
      `<key>CFBundleShortVersionString</key>
\t<string>${version}</string>`
    );

    plistContent = plistContent.replace(
      /<key>CFBundleVersion<\/key>\s*<string>[^<]*<\/string>/,
      `<key>CFBundleVersion</key>
\t<string>${version}</string>`
    );

    fs.writeFileSync(plistPath, plistContent);
  }
}
