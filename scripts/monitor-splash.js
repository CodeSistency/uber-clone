#!/usr/bin/env node

/**
 * Splash System Monitor
 *
 * Monitors the performance and usage of the splash system
 * in a React Native application.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

// Mock monitoring data - in a real app, this would come from analytics
const mockMetrics = {
  splashTransitions: {
    total: 245,
    successful: 238,
    failed: 7,
    avgDuration: 1850, // ms
    byModule: {
      'customer→driver': { count: 89, avgTime: 2100, successRate: 0.96 },
      'customer→business': { count: 67, avgTime: 1800, successRate: 0.98 },
      'driver→customer': { count: 45, avgTime: 1200, successRate: 0.95 },
      'business→customer': { count: 44, avgTime: 1300, successRate: 0.93 },
    }
  },
  dataLoading: {
    cacheHits: 156,
    cacheMisses: 89,
    avgLoadTime: 450, // ms
    byDataType: {
      driverProfile: { avgTime: 320, successRate: 0.99 },
      vehicleStatus: { avgTime: 280, successRate: 0.97 },
      businessProfile: { avgTime: 350, successRate: 0.98 },
      rideHistory: { avgTime: 520, successRate: 0.95 },
    }
  },
  errors: {
    timeoutErrors: 3,
    networkErrors: 2,
    authErrors: 1,
    otherErrors: 1,
    recentErrors: [
      { timestamp: '2024-01-15T14:30:00Z', type: 'timeout', module: 'driver', message: 'Vehicle status timeout' },
      { timestamp: '2024-01-15T13:15:00Z', type: 'network', module: 'business', message: 'Failed to load products' },
    ]
  },
  performance: {
    avgSplashShowTime: 45, // ms
    avgSplashHideTime: 32, // ms
    memoryUsage: '12MB',
    animationFrameDrops: 2,
  }
};

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatPercentage(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function displayHeader(title) {
  console.log(colorize('\n' + '='.repeat(60), colors.cyan));
  console.log(colorize(`📊 ${title}`, colors.cyan));
  console.log(colorize('='.repeat(60), colors.cyan));
}

function displaySplashTransitions() {
  displayHeader('SPLASH TRANSITIONS');

  const transitions = mockMetrics.splashTransitions;
  console.log(`Total Transitions: ${colorize(transitions.total, colors.yellow)}`);
  console.log(`Success Rate: ${colorize(formatPercentage(transitions.successful / transitions.total), colors.green)}`);
  console.log(`Average Duration: ${colorize(formatDuration(transitions.avgDuration), colors.blue)}`);
  console.log(`Failed Transitions: ${colorize(transitions.failed, transitions.failed > 0 ? colors.red : colors.green)}`);

  console.log(colorize('\nBy Module:', colors.magenta));
  Object.entries(transitions.byModule).forEach(([transition, stats]) => {
    const successColor = stats.successRate > 0.95 ? colors.green : stats.successRate > 0.90 ? colors.yellow : colors.red;
    console.log(`  ${transition}:`);
    console.log(`    Count: ${stats.count}`);
    console.log(`    Avg Time: ${formatDuration(stats.avgTime)}`);
    console.log(`    Success Rate: ${colorize(formatPercentage(stats.successRate), successColor)}`);
  });
}

function displayDataLoading() {
  displayHeader('DATA LOADING PERFORMANCE');

  const loading = mockMetrics.dataLoading;
  const cacheHitRate = loading.cacheHits / (loading.cacheHits + loading.cacheMisses);

  console.log(`Cache Hit Rate: ${colorize(formatPercentage(cacheHitRate), colors.green)}`);
  console.log(`Average Load Time: ${colorize(formatDuration(loading.avgLoadTime), colors.blue)}`);
  console.log(`Cache Hits: ${colorize(loading.cacheHits, colors.green)}`);
  console.log(`Cache Misses: ${colorize(loading.cacheMisses, colors.yellow)}`);

  console.log(colorize('\nBy Data Type:', colors.magenta));
  Object.entries(loading.byDataType).forEach(([type, stats]) => {
    const timeColor = stats.avgTime < 400 ? colors.green : stats.avgTime < 600 ? colors.yellow : colors.red;
    const successColor = stats.successRate > 0.95 ? colors.green : colors.yellow;
    console.log(`  ${type}:`);
    console.log(`    Avg Time: ${colorize(formatDuration(stats.avgTime), timeColor)}`);
    console.log(`    Success Rate: ${colorize(formatPercentage(stats.successRate), successColor)}`);
  });
}

function displayErrors() {
  displayHeader('ERROR MONITORING');

  const errors = mockMetrics.errors;
  const totalErrors = errors.timeoutErrors + errors.networkErrors + errors.authErrors + errors.otherErrors;

  console.log(`Total Errors (24h): ${colorize(totalErrors, totalErrors > 0 ? colors.red : colors.green)}`);

  if (totalErrors > 0) {
    console.log(`Timeout Errors: ${colorize(errors.timeoutErrors, colors.yellow)}`);
    console.log(`Network Errors: ${colorize(errors.networkErrors, colors.red)}`);
    console.log(`Auth Errors: ${colorize(errors.authErrors, colors.red)}`);
    console.log(`Other Errors: ${colorize(errors.otherErrors, colors.yellow)}`);

    console.log(colorize('\nRecent Errors:', colors.red));
    errors.recentErrors.forEach(error => {
      console.log(`  ${error.timestamp}: ${error.type} - ${error.message}`);
    });
  } else {
    console.log(colorize('✅ No errors in the last 24 hours', colors.green));
  }
}

function displayPerformance() {
  displayHeader('SYSTEM PERFORMANCE');

  const perf = mockMetrics.performance;

  console.log(`Average Splash Show Time: ${colorize(formatDuration(perf.avgSplashShowTime), colors.green)}`);
  console.log(`Average Splash Hide Time: ${colorize(formatDuration(perf.avgSplashHideTime), colors.green)}`);
  console.log(`Memory Usage: ${colorize(perf.memoryUsage, colors.blue)}`);
  console.log(`Animation Frame Drops: ${colorize(perf.animationFrameDrops, perf.animationFrameDrops > 5 ? colors.red : colors.green)}`);
}

function displayRecommendations() {
  displayHeader('RECOMMENDATIONS');

  const transitions = mockMetrics.splashTransitions;
  const loading = mockMetrics.dataLoading;
  const errors = mockMetrics.errors;

  const recommendations = [];

  // Check transition performance
  if (transitions.avgDuration > 2500) {
    recommendations.push({
      type: 'warning',
      message: 'Average transition time is high (>2.5s). Consider optimizing data loading.'
    });
  }

  // Check success rates
  Object.entries(transitions.byModule).forEach(([transition, stats]) => {
    if (stats.successRate < 0.95) {
      recommendations.push({
        type: 'error',
        message: `${transition} has low success rate (${formatPercentage(stats.successRate)}). Investigate failures.`
      });
    }
  });

  // Check cache performance
  const cacheHitRate = loading.cacheHits / (loading.cacheHits + loading.cacheMisses);
  if (cacheHitRate < 0.7) {
    recommendations.push({
      type: 'info',
      message: `Cache hit rate is low (${formatPercentage(cacheHitRate)}). Consider increasing cache TTL or preloading data.`
    });
  }

  // Check for errors
  const totalErrors = errors.timeoutErrors + errors.networkErrors + errors.authErrors + errors.otherErrors;
  if (totalErrors > 5) {
    recommendations.push({
      type: 'error',
      message: `High error rate detected (${totalErrors} errors). Review error logs and implement fixes.`
    });
  }

  if (recommendations.length === 0) {
    console.log(colorize('✅ All metrics are within acceptable ranges. System performing well!', colors.green));
  } else {
    recommendations.forEach(rec => {
      const color = rec.type === 'error' ? colors.red :
                   rec.type === 'warning' ? colors.yellow : colors.blue;
      console.log(colorize(`• ${rec.message}`, color));
    });
  }
}

function generateReport() {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(__dirname, '..', 'splash-monitor-report.json');

  const report = {
    generatedAt: timestamp,
    metrics: mockMetrics,
    summary: {
      totalTransitions: mockMetrics.splashTransitions.total,
      successRate: mockMetrics.splashTransitions.successful / mockMetrics.splashTransitions.total,
      avgTransitionTime: mockMetrics.splashTransitions.avgDuration,
      cacheHitRate: mockMetrics.dataLoading.cacheHits /
        (mockMetrics.dataLoading.cacheHits + mockMetrics.dataLoading.cacheMisses),
      totalErrors: Object.values(mockMetrics.errors).filter(val => typeof val === 'number').reduce((a, b) => a + b, 0),
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(colorize(`\n📄 Report saved to: ${reportPath}`, colors.green));
}

// Main execution
console.log(colorize('🚀 Splash System Monitor', colors.cyan));
console.log(colorize('Monitoring splash transitions, data loading, and system performance', colors.gray));

displaySplashTransitions();
displayDataLoading();
displayErrors();
displayPerformance();
displayRecommendations();
generateReport();

console.log(colorize('\n🏁 Monitoring complete', colors.green));
