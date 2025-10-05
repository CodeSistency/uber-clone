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






async function testReconnectionScenario() {
  

  return new Promise((resolve) => {
    const socket = io(config.wsUrl.replace("/uber-realtime", ""), {
      transports: ["websocket"],
      timeout: 5000,
      forceNew: true,
    });

    socket.on("connect", () => {
      
      

      // Simulate client disconnect (like hot reload)
      setTimeout(() => {
        
        socket.disconnect();

        // Wait a bit then try to reconnect
        setTimeout(() => {
          
          const newSocket = io(config.wsUrl.replace("/uber-realtime", ""), {
            transports: ["websocket"],
            timeout: 5000,
            forceNew: true,
          });

          newSocket.on("connect", () => {
            
            
            newSocket.disconnect();
            resolve(true);
          });

          newSocket.on("connect_error", (error) => {
            
            
            newSocket.disconnect();
            resolve(false);
          });

          // Timeout for reconnection test
          setTimeout(() => {
            
            newSocket.disconnect();
            resolve(false);
          }, 5000);
        }, 1000);
      }, 1000);
    });

    socket.on("connect_error", (error) => {
      
      
      socket.disconnect();
      resolve(false);
    });
  });
}

async function runTests() {
  

  const success = await testReconnectionScenario();

  
  

  if (success) {
    
    
    
    
  } else {
    
    
  }

  
  
  
  
  
  
}

// Run the tests
runTests().catch(console.error);
