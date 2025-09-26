#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Advanced Import Analysis Script
 * Analyzes import patterns to identify optimization opportunities
 */

console.log('🔍 Analyzing Import Patterns...\n');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Analyze imports in files
function analyzeImports(files) {
  const importStats = {
    totalFiles: files.length,
    importsByPackage: new Map(),
    fullImports: new Map(),
    dynamicImports: [],
    largeLibraries: new Map(),
  };

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip comments and empty lines
        if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
          continue;
        }

        // Check for import statements
        const importMatch = line.match(/^import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          const packageName = importMatch[1];

          // Track package usage
          const current = importStats.importsByPackage.get(packageName) || 0;
          importStats.importsByPackage.set(packageName, current + 1);

          // Check for full imports (not tree-shaken)
          if (line.includes(`import {`) && !line.includes(`import type`)) {
            const currentFull = importStats.fullImports.get(packageName) || 0;
            importStats.fullImports.set(packageName, currentFull + 1);
          }
        }

        // Check for dynamic imports
        const dynamicImportMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (dynamicImportMatch) {
          importStats.dynamicImports.push({
            file: path.relative(process.cwd(), file),
            package: dynamicImportMatch[1],
            line: i + 1,
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not analyze ${file}:`, error.message);
    }
  }

  return importStats;
}

// Analyze bundle impact
function analyzeBundleImpact(importStats) {
  const heavyPackages = [
    'react-native-maps',
    'expo-location',
    '@stripe/stripe-react-native',
    '@stripe/stripe-js',
    'firebase',
    'socket.io-client',
    'react-native-reanimated',
    'react-native-gesture-handler',
    'expo-router',
    'zustand',
    'date-fns',
    'lodash',
    'moment',
  ];

  const impact = new Map();

  for (const [pkg, count] of importStats.importsByPackage) {
    const isHeavy = heavyPackages.some(heavy => pkg.includes(heavy));
    const fullImports = importStats.fullImports.get(pkg) || 0;
    const efficiency = count > 0 ? ((count - fullImports) / count) * 100 : 100;

    impact.set(pkg, {
      usageCount: count,
      fullImports,
      efficiency: Math.round(efficiency),
      isHeavy,
      recommendation: getRecommendation(pkg, efficiency, isHeavy),
    });
  }

  return impact;
}

function getRecommendation(packageName, efficiency, isHeavy) {
  if (efficiency < 50 && isHeavy) {
    return 'HIGH: Consider tree-shaking or lazy loading';
  } else if (efficiency < 70) {
    return 'MEDIUM: Review imports for optimization';
  } else if (isHeavy) {
    return 'LOW: Monitor for future optimizations';
  }
  return 'GOOD: No action needed';
}

// Main analysis
const files = findFiles('./app');
const importStats = analyzeImports(files);
const bundleImpact = analyzeBundleImpact(importStats);

console.log(`📊 Import Analysis Results`);
console.log(`==========================`);
console.log(`Total files analyzed: ${importStats.totalFiles}`);
console.log(`Unique packages imported: ${importStats.importsByPackage.size}`);
console.log(`Dynamic imports found: ${importStats.dynamicImports.length}`);
console.log('');

console.log('📦 Top 10 Most Imported Packages:');
console.log('==================================');

const sortedPackages = Array.from(importStats.importsByPackage.entries())
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10);

sortedPackages.forEach(([pkg, count], index) => {
  const impact = bundleImpact.get(pkg);
  const marker = impact?.isHeavy ? '⚠️' : '✅';
  console.log(`${index + 1}. ${marker} ${pkg} (${count} imports)`);
  if (impact) {
    console.log(`   Efficiency: ${impact.efficiency}% | ${impact.recommendation}`);
  }
});

console.log('');
console.log('🚨 Heavy Packages Analysis:');
console.log('===========================');

const heavyPackages = Array.from(bundleImpact.entries())
  .filter(([, impact]) => impact.isHeavy)
  .sort(([, a], [, b]) => a.efficiency - b.efficiency); // Sort by lowest efficiency first

if (heavyPackages.length === 0) {
  console.log('✅ No heavy packages detected');
} else {
  heavyPackages.forEach(([pkg, impact]) => {
    console.log(`🔴 ${pkg}`);
    console.log(`   Usage: ${impact.usageCount} files`);
    console.log(`   Full imports: ${impact.fullImports}`);
    console.log(`   Efficiency: ${impact.efficiency}%`);
    console.log(`   Recommendation: ${impact.recommendation}`);
    console.log('');
  });
}

console.log('💡 Optimization Suggestions:');
console.log('============================');

// Specific suggestions based on findings
const suggestions = [];

if (importStats.dynamicImports.length === 0) {
  suggestions.push('Consider using dynamic imports for heavy components (Map, Payment, etc.)');
}

const lowEfficiencyPackages = Array.from(bundleImpact.entries())
  .filter(([, impact]) => impact.efficiency < 70)
  .map(([pkg]) => pkg);

if (lowEfficiencyPackages.length > 0) {
  suggestions.push(`Review imports for: ${lowEfficiencyPackages.slice(0, 3).join(', ')}`);
}

suggestions.forEach((suggestion, index) => {
  console.log(`${index + 1}. ${suggestion}`);
});

console.log('');
console.log('📋 Next Steps:');
console.log('   1. Address HIGH priority recommendations first');
console.log('   2. Implement lazy loading for heavy components');
console.log('   3. Use specific imports instead of full imports where possible');
console.log('   4. Consider code splitting for different app sections');

console.log('\n✨ Import analysis complete!\n');

