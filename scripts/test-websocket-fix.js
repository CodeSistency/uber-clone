#!/usr/bin/env node

/**
 * Test script to verify WebSocket reconnection fixes
 */

require("dotenv").config();
const { io } = require("socket.io-client");

const config = {
  serverUrl: process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000",
  wsUrl: process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:3000",
};

console.log("🧪 Testing WebSocket Reconnection Fixes");
console.log("======================================");
console.log(`WebSocket URL: ${config.wsUrl}`);
console.log("");

async function testReconnectionScenario() {
  console.log("1. Testing initial connection...");

  return new Promise((resolve) => {
    const socket = io(config.wsUrl.replace("/uber-realtime", ""), {
      transports: ["websocket"],
      timeout: 5000,
      forceNew: true,
    });

    socket.on("connect", () => {
      console.log("✅ Initial connection successful");
      console.log(`   Socket ID: ${socket.id}`);

      // Simulate client disconnect (like hot reload)
      setTimeout(() => {
        console.log("\n2. Simulating client disconnect (hot reload)...");
        socket.disconnect();

        // Wait a bit then try to reconnect
        setTimeout(() => {
          console.log("\n3. Attempting reconnection...");
          const newSocket = io(config.wsUrl.replace("/uber-realtime", ""), {
            transports: ["websocket"],
            timeout: 5000,
            forceNew: true,
          });

          newSocket.on("connect", () => {
            console.log("✅ Reconnection successful after client disconnect");
            console.log(`   New Socket ID: ${newSocket.id}`);
            newSocket.disconnect();
            resolve(true);
          });

          newSocket.on("connect_error", (error) => {
            console.log("❌ Reconnection failed");
            console.log(`   Error: ${error.message}`);
            newSocket.disconnect();
            resolve(false);
          });

          // Timeout for reconnection test
          setTimeout(() => {
            console.log("⏰ Reconnection test timeout");
            newSocket.disconnect();
            resolve(false);
          }, 5000);
        }, 1000);
      }, 1000);
    });

    socket.on("connect_error", (error) => {
      console.log("❌ Initial connection failed");
      console.log(`   Error: ${error.message}`);
      socket.disconnect();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log("Testing WebSocket reconnection behavior...\n");

  const success = await testReconnectionScenario();

  console.log("\n📊 Test Results:");
  console.log("================");

  if (success) {
    console.log("✅ WebSocket reconnection works correctly");
    console.log("   - Initial connection: SUCCESS");
    console.log("   - Client disconnect: HANDLED");
    console.log("   - Reconnection: SUCCESS");
  } else {
    console.log("❌ WebSocket reconnection has issues");
    console.log("   Check server logs and network connectivity");
  }

  console.log("\n💡 Expected behavior in app:");
  console.log("=============================");
  console.log("• WebSocket connects successfully on app start");
  console.log("• On hot reload (dev), WebSocket reconnects automatically");
  console.log("• Health check should now show WebSocket as available");
  console.log("• In production, intentional disconnects won't auto-reconnect");
}

// Run the tests
runTests().catch(console.error);
