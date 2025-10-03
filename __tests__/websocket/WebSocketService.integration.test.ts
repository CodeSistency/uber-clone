import { WebSocketService } from "../../app/services/websocket";

// Mock socket.io-client to avoid actual network calls
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    connected: true,
    id: "mock-socket-id",
  })),
}));

describe("WebSocketService Integration Tests", () => {
  let service: WebSocketService;

  beforeEach(async () => {
    // Reset singleton instance
    (WebSocketService as any).instance = null;

    service = WebSocketService.getInstance();
    await service.initialize();
  });

  afterEach(async () => {
    await service.destroy();
  });

  describe("Backward Compatibility", () => {
    test("should maintain singleton pattern", () => {
      const instance1 = WebSocketService.getInstance();
      const instance2 = WebSocketService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(service);
    });

    test("should have all public methods from original interface", () => {
      // Core connection methods
      expect(typeof service.connect).toBe("function");
      expect(typeof service.disconnect).toBe("function");
      expect(typeof service.forceReconnect).toBe("function");

      // Room management
      expect(typeof service.joinRideRoom).toBe("function");
      expect(typeof service.leaveRideRoom).toBe("function");
      expect(typeof service.leaveAllRooms).toBe("function");

      // Message sending
      expect(typeof service.sendMessage).toBe("function");
      expect(typeof service.sendTypingStart).toBe("function");
      expect(typeof service.sendTypingStop).toBe("function");

      // Business methods
      expect(typeof service.triggerEmergency).toBe("function");
      expect(typeof service.updateDriverStatus).toBe("function");
      expect(typeof service.requestEarningsUpdate).toBe("function");
      expect(typeof service.requestPerformanceData).toBe("function");
      expect(typeof service.updateVehicleChecklist).toBe("function");
    });

    test("should have legacy getter properties", () => {
      expect(service).toHaveProperty("isConnected");
      expect(service).toHaveProperty("connectionStatus");
      expect(service).toHaveProperty("performanceMetrics");
      expect(service).toHaveProperty("messageQueue");
    });

    test("should have legacy methods", () => {
      expect(typeof service.resetPerformanceMetrics).toBe("function");
    });
  });

  describe("Modular Architecture", () => {
    test("should initialize all modules", async () => {
      const health = service.getHealthStatus();

      expect(health).toHaveProperty("healthy");
      expect(health).toHaveProperty("lastCheck");
      expect(health).toHaveProperty("details");

      // Should have module health details
      expect(health.details).toBeDefined();
      expect(health.details!).toHaveProperty("modules");
      expect(Array.isArray(health.details!.modules)).toBe(true);
      expect(health.details!.modules.length).toBeGreaterThan(0);
    });

    test("should provide comprehensive service status", () => {
      const status = service.getServiceStatus();

      expect(status).toHaveProperty("connected");
      expect(status).toHaveProperty("userId");
      expect(status).toHaveProperty("activeRooms");
      expect(status).toHaveProperty("queueSize");
      expect(status).toHaveProperty("metrics");
      expect(status).toHaveProperty("health");

      expect(typeof status.connected).toBe("boolean");
      expect(typeof status.activeRooms).toBe("number");
      expect(typeof status.queueSize).toBe("number");
    });

    test("should maintain module separation", () => {
      // Verify that internal modules are properly encapsulated
      const status = service.getServiceStatus();

      // Should be able to access high-level metrics
      expect(status.metrics).toHaveProperty("metrics");
      expect(status.metrics).toHaveProperty("errorBreakdown");
      expect(status.metrics).toHaveProperty("eventBreakdown");
      expect(status.metrics).toHaveProperty("latencyStats");
    });
  });

  describe("Functionality Preservation", () => {
    test("should handle room operations", () => {
      // These should not throw errors
      expect(() => {
        service.joinRideRoom(123);
        service.leaveRideRoom(123);
        service.leaveAllRooms();
      }).not.toThrow();
    });

    test("should handle message operations", () => {
      // These should not throw errors
      expect(() => {
        service.sendMessage(123, "test message");
        service.sendTypingStart(123);
        service.sendTypingStop(123);
      }).not.toThrow();
    });

    test("should handle business operations", () => {
      // These should not throw errors
      expect(() => {
        service.triggerEmergency({ type: "test", location: {} });
        service.updateDriverStatus({ status: "available" });
        service.requestEarningsUpdate("driver123");
        service.requestPerformanceData("driver123");
        service.updateVehicleChecklist({ checklist: [] });
      }).not.toThrow();
    });

    test("should provide performance metrics", () => {
      const metrics = service.performanceMetrics;

      expect(metrics).toHaveProperty("messagesSent");
      expect(metrics).toHaveProperty("messagesReceived");
      expect(metrics).toHaveProperty("connectionUptime");
      expect(metrics).toHaveProperty("averageResponseTime");
      expect(metrics).toHaveProperty("errorRate");
      expect(metrics).toHaveProperty("lastUpdated");

      // All should be numbers
      Object.values(metrics).forEach((value) => {
        expect(typeof value).toBe("number");
      });
    });

    test("should handle legacy messageQueue access", () => {
      const queue = (service as any).messageQueue;

      expect(Array.isArray(queue)).toBe(true);
      // Should be read-only (no push method or similar)
      expect((queue as any).push).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle destroy on uninitialized service gracefully", async () => {
      const newService = WebSocketService.getInstance();
      // Don't initialize, just destroy
      await expect(newService.destroy()).resolves.not.toThrow();
    });

    test("should provide health status even when modules fail", () => {
      const health = service.getHealthStatus();

      expect(health).toHaveProperty("healthy");
      expect(health).toHaveProperty("lastCheck");
      // Should not throw even if some modules are unhealthy
      expect(() => service.getServiceStatus()).not.toThrow();
    });
  });

  describe("Configuration", () => {
    test("should accept custom configuration", () => {
      const customService = WebSocketService.getInstance({
        connection: {
          url: "ws://localhost:8080",
          timeout: 5000,
          maxRetries: 2,
          reconnectDelay: 2000,
          heartbeatInterval: 15000,
          authTimeout: 3000,
        },
        queue: {
          maxSize: 25,
          processingInterval: 50,
          rateLimitMs: 50,
          maxRetries: 2,
        },
      });

      expect(customService).toBeDefined();
      // Should be a different instance due to custom config
      expect(customService).not.toBe(service);
    });
  });
});

// Integration test for module communication
describe("Module Communication", () => {
  let service: WebSocketService;

  beforeEach(async () => {
    (WebSocketService as any).instance = null;
    service = WebSocketService.getInstance();
    await service.initialize();
  });

  afterEach(async () => {
    await service.destroy();
  });

  test("should coordinate between modules", () => {
    // Test that operations that should communicate between modules work
    const initialStatus = service.getServiceStatus();

    // Perform some operations
    service.joinRideRoom(456);
    service.sendMessage(456, "integration test");

    const updatedStatus = service.getServiceStatus();

    // Status should still be valid (no crashes)
    expect(updatedStatus).toHaveProperty("activeRooms");
    expect(updatedStatus).toHaveProperty("queueSize");
    expect(typeof updatedStatus.activeRooms).toBe("number");
    expect(typeof updatedStatus.queueSize).toBe("number");
  });
});
