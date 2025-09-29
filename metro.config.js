const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: false,
});

// Enable code splitting and chunking
config.resolver = {
  ...config.resolver,
  // Enable dynamic imports
  dynamicImports: true,
};

// Configure transformer for better performance
config.transformer = {
  ...config.transformer,
  // Enable lazy loading optimizations
  enableBabelRuntime: true,
  // Optimize imports
  allowImportExportEverywhere: false,
  // Enable experimental import support for better tree shaking
  experimentalImportSupport: true,
  // Enable minification for production
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      toplevel: true,
    },
  },
};

// Configure server options
config.server = {
  ...config.server,
  // Enable enhanced resolver for better module resolution
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add custom headers for better caching
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return middleware(req, res, next);
    };
  },
};

// Configure watch folders for better HMR
config.watchFolders = [
  ...config.watchFolders,
  // Add any additional folders to watch for changes
];


// Configure serializer for production optimizations
config.serializer = {
  ...config.serializer,
  // Custom serializer for better chunking
  getModulesRunBeforeMainModule: function () {
    // Ensure critical modules are loaded first
    return [];
  },

  processModuleFilter: function (modules) {
    // Filter out development-only modules in production
    if (process.env.NODE_ENV === 'production') {
      return modules.filter((module) => {
        const { path } = module;
        // Exclude test files and development utilities
        return !path.includes('.test.') &&
               !path.includes('__tests__') &&
               !path.includes('dev.ts') &&
               !path.includes('LoggerDebugger');
      });
    }
    return modules;
  },
};

module.exports = config;
