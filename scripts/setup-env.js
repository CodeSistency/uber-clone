#!/usr/bin/env node

/**
 * Environment setup script for different deployment environments
 * This script helps configure the project for different environments
 */

const fs = require('fs');
const path = require('path');

const environments = ['development', 'staging', 'production'];

console.log('🌍 Setting up environment configurations...');

environments.forEach(env => {
  console.log(`\n📝 Configuring ${env} environment...`);

  // Create environment-specific directories
  const envDir = path.join(process.cwd(), 'environments', env);
  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }

  // Create environment-specific .env file
  const envFile = path.join(envDir, '.env');
  if (!fs.existsSync(envFile)) {
    const envContent = getEnvTemplate(env);
    fs.writeFileSync(envFile, envContent);
    console.log(`✅ Created ${env}/.env`);
  }

  // Create Firebase config for environment
  const firebaseConfig = path.join(envDir, 'google-services.json');
  if (!fs.existsSync(firebaseConfig)) {
    const firebaseTemplate = getFirebaseTemplate(env);
    fs.writeFileSync(firebaseConfig, JSON.stringify(firebaseTemplate, null, 2));
    console.log(`✅ Created ${env}/google-services.json`);
  }
});

console.log('\n🎉 Environment setup completed!');
console.log('\nNext steps:');
console.log('1. Update the .env files with your actual API keys');
console.log('2. Update google-services.json files with your Firebase configurations');
console.log('3. Run "npm run prebuild" to test the prebuild process');

function getEnvTemplate(env) {
  const isProd = env === 'production';
  const isStaging = env === 'staging';

  return `# ${env.toUpperCase()} Environment Configuration

# Server Configuration
EXPO_PUBLIC_SERVER_URL=${isProd ? 'https://api.uber-app.com' : isStaging ? 'https://staging-api.uber-app.com' : 'http://localhost:3000'}
EXPO_PUBLIC_WS_URL=${isProd ? 'wss://ws.uber-app.com' : isStaging ? 'wss://staging-ws.uber-app.com' : 'ws://localhost:3001'}

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=${isProd ? 'your_prod_firebase_api_key' : isStaging ? 'your_staging_firebase_api_key' : 'your_dev_firebase_api_key'}
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=${isProd ? 'uber-prod.firebaseapp.com' : isStaging ? 'uber-staging.firebaseapp.com' : 'uber-dev.firebaseapp.com'}
EXPO_PUBLIC_FIREBASE_PROJECT_ID=${isProd ? 'uber-prod-project' : isStaging ? 'uber-staging-project' : 'uber-dev-project'}

# Payment Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=${isProd ? 'pk_live_your_stripe_key' : 'pk_test_your_stripe_key'}

# Maps Configuration
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=${isProd ? 'your_prod_maps_api_key' : 'your_dev_maps_api_key'}

# App Configuration
EXPO_PUBLIC_APP_ENV=${env}
EXPO_PUBLIC_ENABLE_DEBUG=${!isProd}
EXPO_PUBLIC_ENABLE_ANALYTICS=${isProd}
`;
}

function getFirebaseTemplate(env) {
  const projectId = env === 'production' ? 'uber-prod-project' :
                   env === 'staging' ? 'uber-staging-project' : 'uber-dev-project';

  return {
    "project_info": {
      "project_number": "123456789012",
      "project_id": projectId,
      "storage_bucket": `${projectId}.appspot.com`
    },
    "client": [
      {
        "client_info": {
          "mobilesdk_app_id": "1:123456789012:android:abc123def456",
          "android_client_info": {
            "package_name": "com.uberclone.app"
          }
        },
        "oauth_client": [],
        "api_key": [
          {
            "current_key": "your_firebase_api_key_here"
          }
        ],
        "services": {
          "appinvite_service": {
            "other_platform_oauth_client": []
          }
        }
      }
    ],
    "configuration_version": "1"
  };
}
