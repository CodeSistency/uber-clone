import { websocketEventManager } from "@/lib/websocketEventManager";
import { renderHook, act } from "@testing-library/react-native";
import { useAutoNavigation } from "@/hooks/useAutoNavigation";
import RideInProgress from "@/components/unified-flow/steps/RideInProgress";
import WaitingForAcceptance from "@/components/unified-flow/steps/Client/Viaje/WaitingForAcceptance";

// Mock dependencies
jest.mock("@/hooks/useMapFlow");
jest.mock("@/hooks/useAutoNavigation");
jest.mock("@/store/realtime/realtime");
jest.mock("@/components/UIWrapper");

const mockUseMapFlow = {
  next: jest.fn(),
  back: jest.fn(),
  startWithDriverStep: jest.fn(),
  currentStep: "WAITING_FOR_ACCEPTANCE",
  rideId: "test-ride-123",
  matchedDriver: { id: "driver-123", firstName: "Juan" },
  confirmedDestination: { address: "Centro" },
};

const mockUseAutoNavigation = {
  navigationState: {
    currentStep: "WAITING_FOR_ACCEPTANCE",
    rideId: "test-ride-123",
    activeRideStatus: "pending",
    hasMatchedDriver: true,
    hasDestination: true,
    isAutoNavigationActive: true,
  },
};

const mockUseRealtimeStore = {
  activeRide: { ride_id: "test-ride-123", status: "pending" },
  driverLocation: null,
  connectionStatus: { websocketConnected: true },
  updateDriverLocation: jest.fn(),
  updateRideStatus: jest.fn(),
};

const mockUseUI = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};

describe("WebSocket Performance Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    require("@/hooks/useMapFlow").useMapFlow.mockReturnValue(mockUseMapFlow);
    require("@/hooks/useAutoNavigation").useAutoNavigation.mockReturnValue(
      mockUseAutoNavigation,
    );
    require("@/store/realtime/realtime").useRealtimeStore.mockReturnValue(
      mockUseRealtimeStore,
    );
    require("@/components/UIWrapper").useUI.mockReturnValue(mockUseUI);
  });

  describe("Event Manager Performance", () => {
    it("should emit events within 5ms budget", () => {
      const eventData = { rideId: "test-ride-123", driverId: "driver-123" };
      const iterations = 100;

      const startTime = performance.now();

      // Emitir múltiples eventos
      for (let i = 0; i < iterations; i++) {
        websocketEventManager.emit("ride:accepted", {
          ...eventData,
          iteration: i,
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;

      console.log(
        `Event emission performance: ${totalTime}ms total, ${averageTime}ms average`,
      );

      // Verificar que el promedio está dentro del presupuesto de 5ms
      expect(averageTime).toBeLessThan(5);
    });

    it("should handle multiple listeners efficiently", () => {
      const listenerCount = 50;
      const listeners: jest.Mock[] = [];

      // Registrar múltiples listeners
      for (let i = 0; i < listenerCount; i++) {
        const mockListener = jest.fn();
        listeners.push(mockListener);
        websocketEventManager.on("test:event", mockListener);
      }

      const startTime = performance.now();

      // Emitir evento con múltiples listeners
      websocketEventManager.emit("test:event", { data: "performance-test" });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log(
        `Multiple listeners performance: ${totalTime}ms for ${listenerCount} listeners`,
      );

      // Verificar que todos los listeners fueron llamados
      listeners.forEach((listener) => {
        expect(listener).toHaveBeenCalledWith({ data: "performance-test" });
      });

      // Verificar que está dentro del presupuesto razonable (100ms para 50 listeners)
      expect(totalTime).toBeLessThan(100);
    });

    it("should maintain event history without memory leaks", () => {
      const initialHistoryLength =
        websocketEventManager.getEventHistory().length;

      // Emitir muchos eventos
      for (let i = 0; i < 200; i++) {
        websocketEventManager.emit("test:event", { iteration: i });
      }

      const finalHistoryLength = websocketEventManager.getEventHistory().length;

      // Verificar que el historial no crece indefinidamente (tiene límite de 100)
      expect(finalHistoryLength).toBeLessThanOrEqual(100);
      expect(finalHistoryLength - initialHistoryLength).toBeLessThanOrEqual(
        100,
      );
    });
  });

  describe("Auto Navigation Performance", () => {
    it("should process navigation events within 50ms", () => {
      const { result } = renderHook(() => useAutoNavigation());

      const testEvents = [
        { event: "ride:accepted", data: { rideId: "test-ride-123" } },
        { event: "ride:rejected", data: { rideId: "test-ride-123" } },
        { event: "ride:started", data: { rideId: "test-ride-123" } },
        { event: "ride:completed", data: { rideId: "test-ride-123" } },
      ];

      testEvents.forEach(({ event, data }) => {
        const startTime = performance.now();

        websocketEventManager.emit(event, data);

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        console.log(`${event} processing time: ${processingTime}ms`);

        // Verificar que cada evento se procesa dentro de 50ms
        expect(processingTime).toBeLessThan(50);
      });
    });

    it("should validate events quickly", () => {
      const { result } = renderHook(() => useAutoNavigation());

      const iterations = 1000;
      const startTime = performance.now();

      // Validar múltiples eventos
      for (let i = 0; i < iterations; i++) {
        result.current.validateEventForRide({
          rideId: "test-ride-123",
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;

      console.log(
        `Event validation performance: ${averageTime}ms average per validation`,
      );

      // Verificar que la validación es muy rápida (< 1ms promedio)
      expect(averageTime).toBeLessThan(1);
    });
  });

  describe("Component Re-render Performance", () => {
    it("should handle rapid location updates without excessive re-renders", async () => {
      const renderStartTime = performance.now();

      const { rerender } = renderHook(() => useAutoNavigation());

      // Simular múltiples actualizaciones rápidas
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10));

        act(() => {
          websocketEventManager.emit("driverLocationUpdate", {
            rideId: "test-ride-123",
            latitude: 19.4326 + i * 0.001,
            longitude: -99.1332 + i * 0.001,
            accuracy: 10,
          });
        });
      }

      const renderEndTime = performance.now();
      const totalRenderTime = renderEndTime - renderStartTime;

      console.log(
        `Component re-render performance: ${totalRenderTime}ms for 10 updates`,
      );

      // Verificar que el componente maneja las actualizaciones eficientemente
      expect(totalRenderTime).toBeLessThan(500); // Menos de 500ms para 10 actualizaciones
    });
  });

  describe("Memory Usage Tests", () => {
    it("should not create memory leaks with repeated event emissions", () => {
      // Obtener línea base de memoria (aproximada)
      const initialListeners = websocketEventManager.getListenerCount();

      // Emitir muchos eventos
      for (let i = 0; i < 1000; i++) {
        websocketEventManager.emit("test:event", { iteration: i });
      }

      // Verificar que el número de listeners no cambió
      const finalListeners = websocketEventManager.getListenerCount();

      // Los listeners deberían mantenerse constantes (solo los registrados inicialmente)
      expect(finalListeners).toEqual(initialListeners);
    });

    it("should cleanup event listeners properly", () => {
      const initialCount = Object.keys(
        websocketEventManager.getListenerCount(),
      ).length;

      // Registrar y luego limpiar listeners
      const cleanup = jest.fn();
      websocketEventManager.on("test:event", cleanup);
      websocketEventManager.off("test:event", cleanup);

      const finalCount = Object.keys(
        websocketEventManager.getListenerCount(),
      ).length;

      // El conteo debería ser el mismo después de cleanup
      expect(finalCount).toBe(initialCount);
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent WebSocket events", async () => {
      const eventPromises: Promise<void>[] = [];
      const processedEvents: number[] = [];

      // Configurar listener que registra eventos procesados
      const testListener = (data: any) => {
        processedEvents.push(data.id);
      };

      websocketEventManager.on("concurrent:test", testListener);

      // Emitir eventos concurrentemente
      for (let i = 0; i < 20; i++) {
        eventPromises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              websocketEventManager.emit("concurrent:test", { id: i });
              resolve();
            }, Math.random() * 10); // Delay aleatorio
          }),
        );
      }

      // Esperar que todos los eventos se procesen
      await Promise.all(eventPromises);

      // Pequeño delay para que se procesen los eventos
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verificar que todos los eventos fueron procesados
      expect(processedEvents.length).toBe(20);
      expect(processedEvents.sort()).toEqual(
        Array.from({ length: 20 }, (_, i) => i),
      );

      // Cleanup
      websocketEventManager.off("concurrent:test", testListener);
    });
  });

  describe("GPS Update Performance", () => {
    it("should process GPS updates within 100ms", () => {
      const gpsUpdates = [
        { latitude: 19.4326, longitude: -99.1332, accuracy: 10 },
        { latitude: 19.4426, longitude: -99.1432, accuracy: 8 },
        { latitude: 19.4526, longitude: -99.1532, accuracy: 12 },
        { latitude: 19.4626, longitude: -99.1632, accuracy: 6 },
        { latitude: 19.4726, longitude: -99.1732, accuracy: 15 },
      ];

      const processingTimes: number[] = [];

      gpsUpdates.forEach((location, index) => {
        const startTime = performance.now();

        websocketEventManager.emit("driverLocationUpdate", {
          rideId: "test-ride-123",
          ...location,
          timestamp: new Date().toISOString(),
        });

        const endTime = performance.now();
        processingTimes.push(endTime - startTime);
      });

      const averageProcessingTime =
        processingTimes.reduce((a, b) => a + b) / processingTimes.length;
      const maxProcessingTime = Math.max(...processingTimes);

      console.log(
        `GPS processing performance: ${averageProcessingTime}ms average, ${maxProcessingTime}ms max`,
      );

      // Verificar que las actualizaciones GPS se procesan rápidamente
      expect(averageProcessingTime).toBeLessThan(50);
      expect(maxProcessingTime).toBeLessThan(100);
    });
  });

  describe("Error Handling Performance", () => {
    it("should handle errors without significant performance impact", () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      const successListener = jest.fn();

      websocketEventManager.on("error:test", errorListener);
      websocketEventManager.on("error:test", successListener);

      const startTime = performance.now();

      // Emitir evento que causará error en un listener
      websocketEventManager.emit("error:test", { data: "error-test" });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      console.log(`Error handling performance: ${processingTime}ms`);

      // Verificar que el listener exitoso aún se ejecutó
      expect(successListener).toHaveBeenCalledWith({ data: "error-test" });

      // Verificar que el manejo de errores no afecta significativamente el performance
      expect(processingTime).toBeLessThan(100);

      // Cleanup
      websocketEventManager.off("error:test", errorListener);
      websocketEventManager.off("error:test", successListener);
    });
  });
});
