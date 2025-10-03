import { WebSocketEventManager } from "@/lib/websocketEventManager";

describe("WebSocketEventManager", () => {
  let eventManager: WebSocketEventManager;

  beforeEach(() => {
    eventManager = WebSocketEventManager.getInstance();
    eventManager.clearAllListeners(); // Limpiar estado entre tests
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = WebSocketEventManager.getInstance();
      const instance2 = WebSocketEventManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Event Registration", () => {
    it("should register event listeners correctly", () => {
      const mockCallback = jest.fn();
      eventManager.on("test:event", mockCallback);

      const stats = eventManager.getListenerCount("test:event");
      expect(stats).toBe(1);
    });

    it("should handle multiple listeners for the same event", () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      eventManager.on("test:event", mockCallback1);
      eventManager.on("test:event", mockCallback2);

      const stats = eventManager.getListenerCount("test:event");
      expect(stats).toBe(2);
    });

    it("should not register duplicate listeners", () => {
      const mockCallback = jest.fn();
      eventManager.on("test:event", mockCallback);
      eventManager.on("test:event", mockCallback); // Intentar duplicado

      const stats = eventManager.getListenerCount("test:event");
      expect(stats).toBe(1);
    });
  });

  describe("Event Emission", () => {
    it("should emit events to registered listeners", () => {
      const mockCallback = jest.fn();
      eventManager.on("test:event", mockCallback);

      eventManager.emit("test:event", { data: "test" });

      expect(mockCallback).toHaveBeenCalledWith({ data: "test" });
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it("should emit to multiple listeners", () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();

      eventManager.on("test:event", mockCallback1);
      eventManager.on("test:event", mockCallback2);

      eventManager.emit("test:event", { data: "test" });

      expect(mockCallback1).toHaveBeenCalledWith({ data: "test" });
      expect(mockCallback2).toHaveBeenCalledWith({ data: "test" });
    });

    it("should handle async listeners", async () => {
      const mockCallback = jest.fn().mockResolvedValue(undefined);
      eventManager.on("test:event", mockCallback);

      await new Promise((resolve) => {
        eventManager.emit("test:event", { data: "test" });
        setTimeout(resolve, 10); // Pequeño delay para async
      });

      expect(mockCallback).toHaveBeenCalledWith({ data: "test" });
    });

    it("should not emit to unregistered events", () => {
      const mockCallback = jest.fn();
      eventManager.on("test:event", mockCallback);

      eventManager.emit("other:event", { data: "test" });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("Event Unregistration", () => {
    it("should remove event listeners correctly", () => {
      const mockCallback = jest.fn();
      eventManager.on("test:event", mockCallback);

      expect(eventManager.getListenerCount("test:event")).toBe(1);

      eventManager.off("test:event", mockCallback);

      expect(eventManager.getListenerCount("test:event")).toBe(0);
    });

    it("should handle removing non-existent listeners gracefully", () => {
      const mockCallback = jest.fn();
      eventManager.off("test:event", mockCallback); // No debería hacer nada

      expect(eventManager.getListenerCount("test:event")).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle listener errors without crashing", () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });
      const successCallback = jest.fn();

      eventManager.on("test:event", errorCallback);
      eventManager.on("test:event", successCallback);

      expect(() => {
        eventManager.emit("test:event", { data: "test" });
      }).not.toThrow();

      expect(successCallback).toHaveBeenCalledWith({ data: "test" });
    });

    it("should handle emit errors gracefully", () => {
      // Mock console.error to avoid test output
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      eventManager.on("test:event", errorCallback);

      expect(() => {
        eventManager.emit("test:event", { data: "test" });
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Statistics and History", () => {
    it("should track event history", () => {
      eventManager.emit("test:event", { data: "test1" });
      eventManager.emit("test:event", { data: "test2" });

      const history = eventManager.getEventHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[0].event).toBe("test:event");
    });

    it("should limit history size", () => {
      // Emitir más eventos que el límite de historia (100)
      for (let i = 0; i < 150; i++) {
        eventManager.emit("test:event", { data: i });
      }

      const history = eventManager.getEventHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it("should provide listener statistics", () => {
      eventManager.on("event1", () => {});
      eventManager.on("event1", () => {});
      eventManager.on("event2", () => {});

      const stats = eventManager.getListenerCount() as Record<string, number>;
      expect(stats.event1).toBe(2);
      expect(stats.event2).toBe(1);
    });
  });
});
