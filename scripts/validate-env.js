#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables are present before build
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredVars = [
  'EXPO_PUBLIC_PLACES_API_KEY',
  'EXPO_PUBLIC_DIRECTIONS_API_KEY',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

// Optional environment variables
const optionalVars = [
  'EXPO_PUBLIC_SERVER_URL',
  'EXPO_PUBLIC_WS_URL',
  'EXPO_PUBLIC_GEOAPIFY_API_KEY',
  'DATABASE_URL',
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'NODE_ENV',
];

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('💡 Please copy .env.example to .env and fill in your values');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');

  const envVars = loadEnvFile();
  const missingRequired = [];
  const warnings = [];

  // Check required variables
  requiredVars.forEach(varName => {
    const value = envVars[varName] || process.env[varName];

    if (!value || value.trim() === '' || value.includes('your_') || value.includes('here')) {
      missingRequired.push(varName);
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  });

  // Check optional variables and provide warnings
  optionalVars.forEach(varName => {
    const value = envVars[varName] || process.env[varName];

    if (!value || value.trim() === '') {
      warnings.push(`${varName}: Not configured (optional)`);
    } else if (value.includes('your_') || value.includes('here')) {
      warnings.push(`${varName}: Has placeholder value`);
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  });

  // Report results
  console.log('\n' + '='.repeat(50));

  if (missingRequired.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    missingRequired.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log('\n💡 Please check your .env file and ensure all required variables are properly configured.');
    console.log('📋 See .env.example for the complete list of required variables.\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
    console.log('');
  }

  console.log('✅ Environment validation passed!');
  console.log('🚀 Build can proceed safely.\n');

  return true;
}

// Run validation if this script is executed directly
if (require.main === module) {
  try {
    validateEnvironment();
  } catch (error) {
    console.error('💥 Environment validation failed:', error.message);
    process.exit(1);
  }
}

module.exports = { validateEnvironment, loadEnvFile };

