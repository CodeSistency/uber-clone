import { logger, LogLevel } from "../lib/logger";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("Logger", () => {
  beforeEach(() => {
    // Reset logger state before each test
    logger.setLogLevel(LogLevel.DEBUG);
    logger.clearLogs();
  });

  describe("Basic Logging", () => {
    it("should log debug messages", () => {
      logger.debug("TestCategory", "Debug message", { key: "value" });

      const logs = logger.getLogs(LogLevel.DEBUG);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[0].category).toBe("TestCategory");
      expect(logs[0].message).toBe("Debug message");
      expect(logs[0].data).toEqual({ key: "value" });
    });

    it("should log info messages", () => {
      logger.info("TestCategory", "Info message");

      const logs = logger.getLogs(LogLevel.INFO);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].level).toBe(LogLevel.INFO);
    });

    it("should log warn messages", () => {
      logger.warn("TestCategory", "Warning message");

      const logs = logger.getLogs(LogLevel.WARN);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it("should log error messages with stack trace", () => {
      const testError = new Error("Test error");
      logger.error("TestCategory", "Error message", { code: 500 }, testError);

      const logs = logger.getLogs(LogLevel.ERROR);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].stackTrace).toBe(testError.stack);
    });

    it("should log critical messages", () => {
      const testError = new Error("Critical error");
      logger.critical("TestCategory", "Critical message", undefined, testError);

      const logs = logger.getLogs(LogLevel.CRITICAL);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].level).toBe(LogLevel.CRITICAL);
    });
  });

  describe("Log Filtering", () => {
    let testLogs: any[];

    beforeEach(() => {
      // Clear logs and capture only the test logs we add
      logger.clearLogs();
      logger.info("CategoryA", "Message A1");
      logger.info("CategoryA", "Message A2");
      logger.warn("CategoryB", "Message B1");
      logger.error("CategoryA", "Message A3");
      testLogs = logger.getLogs();
    });

    it("should filter by log level", () => {
      const warnLogs = logger.getLogs(LogLevel.WARN);
      const testWarnLogs = warnLogs.filter((log) =>
        log.message.includes("Message"),
      );
      expect(testWarnLogs.length).toBe(1);
      expect(testWarnLogs[0].message).toBe("Message B1");

      const errorLogs = logger.getLogs(LogLevel.ERROR);
      const testErrorLogs = errorLogs.filter((log) =>
        log.message.includes("Message"),
      );
      expect(testErrorLogs.length).toBe(1);
      expect(testErrorLogs[0].message).toBe("Message A3");
    });

    it("should filter by category", () => {
      const categoryALogs = logger.getLogs(undefined, "CategoryA");
      const testCategoryALogs = categoryALogs.filter((log) =>
        log.message.includes("Message"),
      );
      expect(testCategoryALogs.length).toBe(3);

      const categoryBLogs = logger.getLogs(undefined, "CategoryB");
      const testCategoryBLogs = categoryBLogs.filter((log) =>
        log.message.includes("Message"),
      );
      expect(testCategoryBLogs.length).toBe(1);
    });

    it("should filter by both level and category", () => {
      const filteredLogs = logger.getLogs(LogLevel.INFO, "CategoryA");
      const testFilteredLogs = filteredLogs.filter((log) =>
        log.message.includes("Message"),
      );
      expect(testFilteredLogs.length).toBe(2);
      expect(
        testFilteredLogs.every((log) => log.category === "CategoryA"),
      ).toBe(true);
      expect(testFilteredLogs.every((log) => log.level === LogLevel.INFO)).toBe(
        true,
      );
    });

    it("should limit results", () => {
      const limitedLogs = logger.getLogs(undefined, undefined, 2);
      expect(limitedLogs.length).toBe(2);
    });
  });

  describe("Performance Logging", () => {
    it("should log performance metrics", () => {
      const startTime = Date.now() - 1000; // 1 second ago
      logger.performance("TestService", "testOperation", startTime, {
        param: "value",
      });

      const logs = logger.getLogs();
      const perfLog = logs.find((log) => log.message.includes("Performance"));
      expect(perfLog).toBeDefined();
      expect(perfLog?.data?.duration).toBeGreaterThanOrEqual(1000);
      expect(perfLog?.data?.param).toBe("value");
    });

    it("should warn for slow operations", () => {
      const startTime = Date.now() - 6000; // 6 seconds ago
      logger.performance("TestService", "slowOperation", startTime);

      const logs = logger.getLogs(LogLevel.WARN);
      expect(logs.some((log) => log.message.includes("Performance"))).toBe(
        true,
      );
    });
  });

  describe("Network Logging", () => {
    it("should log successful network requests", () => {
      logger.network("APIService", "GET", "/api/users", 200, 150);

      const logs = logger.getLogs(LogLevel.DEBUG);
      const networkLog = logs.find((log) => log.message.includes("Network"));
      expect(networkLog).toBeDefined();
      expect(networkLog?.data?.statusCode).toBe(200);
      expect(networkLog?.data?.duration).toBe(150);
    });

    it("should log failed network requests as errors", () => {
      logger.network(
        "APIService",
        "POST",
        "/api/users",
        500,
        200,
        new Error("Server error"),
      );

      const logs = logger.getLogs(LogLevel.ERROR);
      const networkLog = logs.find((log) => log.message.includes("Network"));
      expect(networkLog).toBeDefined();
      expect(networkLog?.data?.statusCode).toBe(500);
    });
  });

  describe("WebSocket Logging", () => {
    it("should log WebSocket events", () => {
      logger.websocket("WebSocketService", "connected", { userId: "123" });

      const logs = logger.getLogs(LogLevel.DEBUG);
      const wsLog = logs.find((log) => log.message.includes("WebSocket"));
      expect(wsLog).toBeDefined();
      expect(wsLog?.data?.userId).toBe("123");
    });

    it("should log WebSocket errors", () => {
      const wsError = new Error("Connection failed");
      logger.websocket(
        "WebSocketService",
        "connection_error",
        { attempt: 1 },
        wsError,
      );

      const logs = logger.getLogs(LogLevel.ERROR);
      const wsLog = logs.find((log) => log.message.includes("WebSocket"));
      expect(wsLog).toBeDefined();
      expect(wsLog?.stackTrace).toBe(wsError.stack);
    });
  });

  describe("User Action Logging", () => {
    it("should log user actions", () => {
      logger.userAction("UI", "button_pressed", {
        buttonId: "submit",
        screen: "login",
      });

      const logs = logger.getLogs(LogLevel.INFO);
      const actionLog = logs.find((log) => log.message.includes("User Action"));
      expect(actionLog).toBeDefined();
      expect(actionLog?.data?.buttonId).toBe("submit");
    });
  });

  describe("Log Management", () => {
    it("should clear logs", () => {
      logger.info("Test", "Test message");
      expect(logger.getLogs().length).toBeGreaterThan(0);

      logger.clearLogs();
      const logsAfterClear = logger.getLogs();
      // May have internal logs from the clear operation itself
      const userLogsAfterClear = logsAfterClear.filter((log) =>
        log.message.includes("Test message"),
      );
      expect(userLogsAfterClear.length).toBe(0);
    });

    it("should get log statistics", () => {
      logger.clearLogs();
      logger.info("CategoryA", "Message 1");
      logger.warn("CategoryB", "Message 2");
      logger.error("CategoryA", "Message 3");

      const stats = logger.getStats();
      // Should have at least the 3 messages we added
      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.byLevel["INFO"]).toBeGreaterThanOrEqual(1);
      expect(stats.byLevel["WARN"]).toBeGreaterThanOrEqual(1);
      expect(stats.byLevel["ERROR"]).toBeGreaterThanOrEqual(1);
      expect(stats.byCategory["CategoryA"]).toBeGreaterThanOrEqual(2);
      expect(stats.byCategory["CategoryB"]).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Log Level Filtering", () => {
    it("should respect log level settings", () => {
      logger.setLogLevel(LogLevel.ERROR);

      logger.debug("Test", "Debug message"); // Should be filtered out
      logger.info("Test", "Info message"); // Should be filtered out
      logger.warn("Test", "Warn message"); // Should be filtered out
      logger.error("Test", "Error message"); // Should be logged

      const logs = logger.getLogs();
      const errorLogs = logs.filter((log) =>
        log.message.includes("Error message"),
      );
      expect(errorLogs.length).toBe(1);
      expect(errorLogs[0].level).toBe(LogLevel.ERROR);

      // Reset log level for other tests
      logger.setLogLevel(LogLevel.DEBUG);
    });
  });
});
