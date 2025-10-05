#!/usr/bin/env node

/**
 * WebSocket Connection Testing Script
 * Tests different WebSocket configurations to identify connection issues
 */

const { io } = require("socket.io-client");

// Load environment variables from .env file if it exists
require("dotenv").config();

const config = {
  serverUrl: process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000",
  wsUrl: process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:3000",
};







async function testConnection(url, description, options = {}) {
  return new Promise((resolve) => {
    
    

    const socket = io(url, {
      transports: ["websocket"],
      timeout: 5000,
      forceNew: true,
      ...options,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      
      resolve({ success: false, error: "Connection timeout after 5s" });
    }, 5000);

    socket.on("connect", () => {
      clearTimeout(timeout);
      
      
      socket.disconnect();
      resolve({ success: true });
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      
      
      
      socket.disconnect();
      resolve({ success: false, error: error.message, type: error.type });
    });
  });
}

async function runTests() {
  const tests = [
    {
      url: config.wsUrl.replace("/uber-realtime", ""),
      description: "Basic WebSocket connection (no namespace)",
    },
    {
      url: config.wsUrl,
      description: "WebSocket with /uber-realtime namespace",
    },
    {
      url: config.serverUrl.replace("http", "ws"),
      description: "WebSocket on HTTP port (no namespace)",
    },
    {
      url: `${config.serverUrl.replace("http", "ws")}/uber-realtime`,
      description: "WebSocket on HTTP port with /uber-realtime namespace",
    },
    {
      url: config.wsUrl,
      description: "WebSocket with auth (should fail without token)",
      options: {
        auth: { token: "invalid-token", userId: "test" },
      },
    },
  ];

  

  for (const test of tests) {
    const result = await testConnection(
      test.url,
      test.description,
      test.options,
    );
    test.result = result;

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  
  

  tests.forEach((test, index) => {
    const status = test.result.success ? "✅ PASS" : "❌ FAIL";
    
    if (!test.result.success && test.result.error) {
      
    }
  });

  
  

  const basicTest = tests[0];
  const namespacedTest = tests[1];

  if (!basicTest.result.success && !namespacedTest.result.success) {
    
    
  } else if (basicTest.result.success && !namespacedTest.result.success) {
    
    
  } else if (!basicTest.result.success && namespacedTest.result.success) {
    
  } else {
    
    
  }

  
  

  if (tests.some((t) => t.result.success)) {
    
    
    
  } else {
    
    
    
  }
}

// Run the tests
runTests().catch(console.error);
