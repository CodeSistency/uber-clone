#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Bundle Analysis Script
 * Analyzes the React Native bundle to identify large dependencies and optimization opportunities
 */

console.log("🔍 Analyzing React Native Bundle...\n");

// Read package.json to get dependencies
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"),
);
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

// Common large libraries that should be in separate chunks
const heavyLibraries = {
  // Maps and location
  "react-native-maps": "Heavy mapping library",
  "@react-native-community/geolocation": "Geolocation services",
  "expo-location": "Expo location services",

  // Firebase
  firebase: "Firebase SDK",
  "@react-native-firebase/app": "Firebase RN bridge",

  // Payment
  stripe: "Stripe SDK",
  "@stripe/stripe-react-native": "Stripe RN bridge",

  // UI Libraries
  "react-native-super-grid": "Grid layout library",
  "react-native-gesture-handler": "Gesture handling",
  "react-native-reanimated": "Animation library",

  // WebSocket
  "socket.io-client": "WebSocket client",

  // State management
  zustand: "State management",

  // Navigation
  "expo-router": "File-based routing",

  // Date/Time
  "date-fns": "Date utilities",

  // Forms
  "react-hook-form": "Form management",

  // Icons
  "react-native-vector-icons": "Icon library",
  "@expo/vector-icons": "Expo icons",
};

console.log("📦 Checking for heavy dependencies...\n");

const foundHeavyDeps = [];
const missingHeavyDeps = [];

Object.keys(heavyLibraries).forEach((dep) => {
  if (dependencies[dep]) {
    foundHeavyDeps.push({
      name: dep,
      description: heavyLibraries[dep],
      version: dependencies[dep],
    });
  } else {
    missingHeavyDeps.push({
      name: dep,
      description: heavyLibraries[dep],
    });
  }
});

if (foundHeavyDeps.length > 0) {
  console.log(
    "⚠️  Found heavy dependencies that should be in separate chunks:",
  );
  foundHeavyDeps.forEach((dep) => {
    console.log(`   📦 ${dep.name}@${dep.version} - ${dep.description}`);
  });
  console.log("");
}

if (missingHeavyDeps.length > 0) {
  console.log("ℹ️  Heavy dependencies not found (good for bundle size):");
  missingHeavyDeps.forEach((dep) => {
    console.log(`   ✅ ${dep.name} - ${dep.description}`);
  });
  console.log("");
}

// Analyze bundle size estimation
console.log("📊 Bundle Size Analysis...\n");

// Estimate sizes based on known library sizes
const estimatedSizes = {
  "react-native-maps": 800, // KB
  "socket.io-client": 150,
  firebase: 200,
  "@stripe/stripe-react-native": 300,
  "react-native-super-grid": 50,
  "react-native-reanimated": 200,
  zustand: 20,
  "expo-router": 100,
  "date-fns": 300,
  "react-hook-form": 50,
};

let totalEstimatedSize = 0;
foundHeavyDeps.forEach((dep) => {
  const size = estimatedSizes[dep.name] || 100; // Default 100KB estimate
  totalEstimatedSize += size;
  console.log(`   ${dep.name}: ~${size}KB`);
});

console.log(`\n💾 Estimated heavy dependencies size: ~${totalEstimatedSize}KB`);

if (totalEstimatedSize > 1000) {
  console.log(
    "⚠️  WARNING: Bundle size may be too large. Consider code splitting.",
  );
} else if (totalEstimatedSize > 500) {
  console.log("⚡ Consider optimizing heavy dependencies.");
} else {
  console.log("✅ Bundle size looks good!");
}

console.log("\n🚀 Recommendations:");

// Recommendations for optimization
const recommendations = [
  "Use dynamic imports for heavy components (Map, Payment, etc.)",
  "Implement route-based code splitting with Expo Router groups",
  "Consider lazy loading for complex forms and wizards",
  "Use tree shaking to remove unused code from libraries",
  "Implement service worker caching for better performance",
  "Monitor bundle size with expo-bundle-analyzer",
];

recommendations.forEach((rec, index) => {
  console.log(`   ${index + 1}. ${rec}`);
});

console.log("\n📋 Next Steps:");
console.log("   1. Run: npx expo install expo-bundle-analyzer");
console.log("   2. Add bundle analysis to CI/CD pipeline");
console.log("   3. Monitor bundle size changes over time");
console.log("   4. Implement lazy loading for heavy screens");

console.log("\n✨ Analysis complete!\n");
