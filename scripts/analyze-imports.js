#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Advanced Import Analysis Script
 * Analyzes import patterns to identify optimization opportunities
 */



// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = [".ts", ".tsx", ".js", ".jsx"]) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith(".") &&
        item !== "node_modules"
      ) {
        traverse(fullPath);
      } else if (
        stat.isFile() &&
        extensions.some((ext) => item.endsWith(ext))
      ) {
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
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip comments and empty lines
        if (
          !line ||
          line.startsWith("//") ||
          line.startsWith("/*") ||
          line.startsWith("*")
        ) {
          continue;
        }

        // Check for import statements
        const importMatch = line.match(
          /^import\s+.*?\s+from\s+['"]([^'"]+)['"]/,
        );
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
        const dynamicImportMatch = line.match(
          /import\s*\(\s*['"]([^'"]+)['"]\s*\)/,
        );
        if (dynamicImportMatch) {
          importStats.dynamicImports.push({
            file: path.relative(process.cwd(), file),
            package: dynamicImportMatch[1],
            line: i + 1,
          });
        }
      }
    } catch (error) {
      
    }
  }

  return importStats;
}

// Analyze bundle impact
function analyzeBundleImpact(importStats) {
  const heavyPackages = [
    "react-native-maps",
    "expo-location",
    "@stripe/stripe-react-native",
    "@stripe/stripe-js",
    "firebase",
    "socket.io-client",
    "react-native-reanimated",
    "react-native-gesture-handler",
    "expo-router",
    "zustand",
    "date-fns",
    "lodash",
    "moment",
  ];

  const impact = new Map();

  for (const [pkg, count] of importStats.importsByPackage) {
    const isHeavy = heavyPackages.some((heavy) => pkg.includes(heavy));
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
    return "HIGH: Consider tree-shaking or lazy loading";
  } else if (efficiency < 70) {
    return "MEDIUM: Review imports for optimization";
  } else if (isHeavy) {
    return "LOW: Monitor for future optimizations";
  }
  return "GOOD: No action needed";
}

// Main analysis
const files = findFiles("./app");
const importStats = analyzeImports(files);
const bundleImpact = analyzeBundleImpact(importStats);











const sortedPackages = Array.from(importStats.importsByPackage.entries())
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10);

sortedPackages.forEach(([pkg, count], index) => {
  const impact = bundleImpact.get(pkg);
  const marker = impact?.isHeavy ? "⚠️" : "✅";
  
  if (impact) {
    
  }
});





const heavyPackages = Array.from(bundleImpact.entries())
  .filter(([, impact]) => impact.isHeavy)
  .sort(([, a], [, b]) => a.efficiency - b.efficiency); // Sort by lowest efficiency first

if (heavyPackages.length === 0) {
  
} else {
  heavyPackages.forEach(([pkg, impact]) => {
    
    
    
    
    
    
  });
}




// Specific suggestions based on findings
const suggestions = [];

if (importStats.dynamicImports.length === 0) {
  suggestions.push(
    "Consider using dynamic imports for heavy components (Map, Payment, etc.)",
  );
}

const lowEfficiencyPackages = Array.from(bundleImpact.entries())
  .filter(([, impact]) => impact.efficiency < 70)
  .map(([pkg]) => pkg);

if (lowEfficiencyPackages.length > 0) {
  suggestions.push(
    `Review imports for: ${lowEfficiencyPackages.slice(0, 3).join(", ")}`,
  );
}

suggestions.forEach((suggestion, index) => {
  
});









