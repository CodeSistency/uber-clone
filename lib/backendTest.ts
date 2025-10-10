/**
 * Backend Connectivity Testing
 * Utility functions to test backend API and WebSocket connections
 */

import { log } from "./logger";
import { fetchAPI } from "./api";

export interface BackendTestResult {
  endpoint: string;
  success: boolean;
  responseTime: number;
  error?: string;
  statusCode?: number;
}

export interface WebSocketTestResult {
  connected: boolean;
  namespace: string;
  responseTime: number;
  error?: string;
}

/**
 * Test basic API connectivity
 */
export async function testAPIConnectivity(): Promise<BackendTestResult[]> {
  const tests: BackendTestResult[] = [];
  const endpoints = [
    { path: "health", description: "Health check" },
    { path: "chat", description: "Chat base endpoint" },
    { path: "auth/status", description: "Auth status" },
  ];

  for (const endpoint of endpoints) {
    const startTime = Date.now();

    try {
      log.info(`Testing API endpoint: ${endpoint.path}`, {
        component: "BackendTest",
        data: {
          description: endpoint.description,
        }
      });

      const response = await fetchAPI(endpoint.path, {
        method: "GET",
        requiresAuth: false, // Skip auth for basic connectivity tests
      });

      const responseTime = Date.now() - startTime;

      tests.push({
        endpoint: endpoint.path,
        success: true,
        responseTime,
        statusCode: 200, // Assume success if no error thrown
      });

      log.info(`✅ API endpoint ${endpoint.path} is accessible`, {
        component: "BackendTest",
        data: {
          responseTime: `${responseTime}ms`,
        }
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      tests.push({
        endpoint: endpoint.path,
        success: false,
        responseTime,
        error: errorMessage,
      });

      log.warn(`❌ API endpoint ${endpoint.path} failed`, {
        component: "BackendTest",
        data: {
          error: errorMessage,
          responseTime: `${responseTime}ms`,
        }
      });
    }
  }

  return tests;
}

/**
 * Test chat-specific endpoints
 */
export async function testChatAPIConnectivity(): Promise<BackendTestResult[]> {
  const tests: BackendTestResult[] = [];
  const chatEndpoints = [
    { path: "chat", method: "GET", description: "Chat base endpoint" },
    // Note: Specific ride/order endpoints would require valid IDs
    // { path: 'chat/1/messages', method: 'GET', description: 'Ride messages' },
  ];

  for (const endpoint of chatEndpoints) {
    const startTime = Date.now();

    try {
      log.info(`Testing chat API endpoint: ${endpoint.path}`, {
        component: "BackendTest",
        data: {
          method: endpoint.method,
          description: endpoint.description,
        }
      });

      const response = await fetchAPI(endpoint.path, {
        method: endpoint.method,
      });

      const responseTime = Date.now() - startTime;

      tests.push({
        endpoint: endpoint.path,
        success: true,
        responseTime,
        statusCode: 200,
      });

      log.info(`✅ Chat API endpoint ${endpoint.path} is accessible`, {
        component: "BackendTest",
        data: {
          responseTime: `${responseTime}ms`,
        }
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      tests.push({
        endpoint: endpoint.path,
        success: false,
        responseTime,
        error: errorMessage,
      });

      log.warn(`❌ Chat API endpoint ${endpoint.path} failed`, {
        component: "BackendTest",
        data: {
          error: errorMessage,
          responseTime: `${responseTime}ms`,
        }
      });
    }
  }

  return tests;
}

/**
 * Test WebSocket connectivity
 */
export async function testWebSocketConnectivity(): Promise<WebSocketTestResult> {
  const startTime = Date.now();

  try {
    log.info("Testing WebSocket connectivity", {
      component: "BackendTest",
      data: {
        namespace: "/uber-realtime",
        url: process.env.EXPO_PUBLIC_WS_URL || "http://localhost:3000",
      }
    });

    // Import websocketService dynamically to avoid circular imports
    const { websocketService } = await import(
      "../app/services/websocketService"
    );

    // Attempt to connect (this will timeout if server is not available)
    const connectPromise = new Promise<WebSocketTestResult>(
      (resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("WebSocket connection timeout"));
        }, 5000); // 5 second timeout

        // Set up connection listeners
        const wsService = websocketService as any;
        const originalOnConnect = wsService.socket?.listeners("connect") || [];
        const originalOnConnectError =
          wsService.socket?.listeners("connect_error") || [];

        // Override listeners temporarily for testing
        if (wsService.socket) {
          wsService.socket.once("connect", () => {
            clearTimeout(timeout);
            const responseTime = Date.now() - startTime;

            // Restore original listeners
            wsService.socket?.removeAllListeners("connect");
            wsService.socket?.removeAllListeners("connect_error");

            resolve({
              connected: true,
              namespace: "/uber-realtime",
              responseTime,
            });

            log.info("✅ WebSocket connection successful", {
              component: "BackendTest",
              data: {
                namespace: "/uber-realtime",
                responseTime: `${responseTime}ms`,
              }
            });
          });

          wsService.socket.once("connect_error", (error: any) => {
            clearTimeout(timeout);
            const responseTime = Date.now() - startTime;

            // Restore original listeners
            wsService.socket?.removeAllListeners("connect");
            wsService.socket?.removeAllListeners("connect_error");

            resolve({
              connected: false,
              namespace: "/uber-realtime",
              responseTime,
              error: error.message || "Connection failed",
            });

            log.warn("❌ WebSocket connection failed", {
              component: "BackendTest",
              data: {
                error: error.message || "Connection failed",
                responseTime: `${responseTime}ms`,
              }
            });
          });

          // Trigger connection if not already connected
          if (!wsService.socket.connected) {
            wsService.socket.connect();
          } else {
            // Already connected
            resolve({
              connected: true,
              namespace: "/uber-realtime",
              responseTime: Date.now() - startTime,
            });
          }
        } else {
          reject(new Error("WebSocket service not initialized"));
        }
      },
    );

    return await connectPromise;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    log.error("WebSocket test failed", {
      component: "BackendTest",
      data: {
        error: errorMessage,
        responseTime: `${responseTime}ms`,
      }
    });

    return {
      connected: false,
      namespace: "/uber-realtime",
      responseTime,
      error: errorMessage,
    };
  }
}

/**
 * Run comprehensive backend connectivity test
 */
export async function runBackendConnectivityTest() {
  log.info("🚀 Starting comprehensive backend connectivity test", {
    component: "BackendTest"
  });

  const results = {
    api: await testAPIConnectivity(),
    chat: await testChatAPIConnectivity(),
    websocket: await testWebSocketConnectivity(),
    timestamp: new Date().toISOString(),
  };

  const apiSuccess = results.api.filter((test) => test.success).length;
  const chatSuccess = results.chat.filter((test) => test.success).length;

  log.info("📊 Backend connectivity test completed", {
    component: "BackendTest",
    data: {
      apiTests: `${apiSuccess}/${results.api.length}`,
      chatTests: `${chatSuccess}/${results.chat.length}`,
      websocketConnected: results.websocket.connected,
      totalResponseTime:
        results.api.reduce((sum, test) => sum + test.responseTime, 0) +
        results.chat.reduce((sum, test) => sum + test.responseTime, 0) +
        results.websocket.responseTime,
    }
  });

  return results;
}

/**
 * Get backend status summary
 */
export function getBackendStatus(
  results: Awaited<ReturnType<typeof runBackendConnectivityTest>>,
) {
  const apiHealthy = results.api.every((test) => test.success);
  const chatHealthy = results.chat.every((test) => test.success);
  const wsHealthy = results.websocket.connected;

  const overallHealth =
    apiHealthy && chatHealthy && wsHealthy ? "healthy" : "degraded";

  return {
    overall: overallHealth,
    api: apiHealthy ? "healthy" : "unhealthy",
    chat: chatHealthy ? "healthy" : "unhealthy",
    websocket: wsHealthy ? "connected" : "disconnected",
    details: results,
  };
}
