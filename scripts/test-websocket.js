#!/usr/bin/env node

/**
 * WebSocket Connection Testing Script
 * Tests different WebSocket configurations to identify connection issues
 */

const { io } = require('socket.io-client');

// Load environment variables from .env file if it exists
require('dotenv').config();

const config = {
  serverUrl: process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000',
  wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000',
};

console.log('🔧 WebSocket Testing Script');
console.log('========================');
console.log(`Server URL: ${config.serverUrl}`);
console.log(`WebSocket URL: ${config.wsUrl}`);
console.log('');

async function testConnection(url, description, options = {}) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`URL: ${url}`);

    const socket = io(url, {
      transports: ["websocket"],
      timeout: 5000,
      forceNew: true,
      ...options,
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      console.log(`❌ TIMEOUT: ${description}`);
      resolve({ success: false, error: 'Connection timeout after 5s' });
    }, 5000);

    socket.on("connect", () => {
      clearTimeout(timeout);
      console.log(`✅ SUCCESS: ${description}`);
      console.log(`   Socket ID: ${socket.id}`);
      socket.disconnect();
      resolve({ success: true });
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      console.log(`❌ ERROR: ${description}`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Type: ${error.type || 'Unknown'}`);
      socket.disconnect();
      resolve({ success: false, error: error.message, type: error.type });
    });
  });
}

async function runTests() {
  const tests = [
    {
      url: config.wsUrl.replace('/uber-realtime', ''),
      description: 'Basic WebSocket connection (no namespace)',
    },
    {
      url: config.wsUrl,
      description: 'WebSocket with /uber-realtime namespace',
    },
    {
      url: config.serverUrl.replace('http', 'ws'),
      description: 'WebSocket on HTTP port (no namespace)',
    },
    {
      url: `${config.serverUrl.replace('http', 'ws')}/uber-realtime`,
      description: 'WebSocket on HTTP port with /uber-realtime namespace',
    },
    {
      url: config.wsUrl,
      description: 'WebSocket with auth (should fail without token)',
      options: {
        auth: { token: 'invalid-token', userId: 'test' }
      }
    },
  ];

  console.log('Running WebSocket connectivity tests...\n');

  for (const test of tests) {
    const result = await testConnection(test.url, test.description, test.options);
    test.result = result;

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Test Results Summary:');
  console.log('========================');

  tests.forEach((test, index) => {
    const status = test.result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${test.description}`);
    if (!test.result.success && test.result.error) {
      console.log(`   Error: ${test.result.error}`);
    }
  });

  console.log('\n🔍 Analysis:');
  console.log('============');

  const basicTest = tests[0];
  const namespacedTest = tests[1];

  if (!basicTest.result.success && !namespacedTest.result.success) {
    console.log('❌ No WebSocket connection possible - server may not be running');
    console.log('   Check if the server is running on the expected port');
  } else if (basicTest.result.success && !namespacedTest.result.success) {
    console.log('⚠️  Basic connection works, but /uber-realtime namespace fails');
    console.log('   Server may not have the /uber-realtime namespace configured');
  } else if (!basicTest.result.success && namespacedTest.result.success) {
    console.log('🤔 Namespace works but basic connection fails - unusual');
  } else {
    console.log('✅ Both basic and namespaced connections work');
    console.log('   Issue may be with authentication or client-side configuration');
  }

  console.log('\n💡 Recommendations:');
  console.log('===================');

  if (tests.some(t => t.result.success)) {
    console.log('• Server WebSocket is reachable');
    console.log('• Check authentication in the mobile app');
    console.log('• Verify namespace configuration matches server');
  } else {
    console.log('• Start the server with WebSocket support');
    console.log('• Check server logs for WebSocket initialization');
    console.log('• Verify firewall settings allow WebSocket connections');
  }
}

// Run the tests
runTests().catch(console.error);
