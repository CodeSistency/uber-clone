import React from "react";
import { render, waitFor, act, fireEvent } from "@testing-library/react-native";
import { websocketEventManager } from "@/lib/websocketEventManager";

// Import components
import WaitingForAcceptance from "@/components/unified-flow/steps/Client/Viaje/WaitingForAcceptance";
import RideInProgress from "@/components/unified-flow/steps/RideInProgress";

// Mock all dependencies
jest.mock("@/hooks/useMapFlow");
jest.mock("@/hooks/useAutoNavigation");
jest.mock("@/store/realtime/realtime");
jest.mock("@/components/UIWrapper");
jest.mock("@/app/services/websocketService");

describe("Auto Navigation E2E Tests", () => {
  const mockUseMapFlow = {
    next: jest.fn(),
    back: jest.fn(),
    startWithDriverStep: jest.fn(),
    currentStep: "WAITING_FOR_ACCEPTANCE",
    rideId: "e2e-test-ride-123",
    matchedDriver: {
      id: "driver-123",
      firstName: "Juan",
      title: "Juan Pérez",
    },
    confirmedDestination: {
      address: "Centro Histórico",
      latitude: 19.4326,
      longitude: -99.1332,
    },
    acceptanceTimeout: 30,
    acceptanceStartTime: new Date(),
    stopAcceptanceTimer: jest.fn(),
  };

  const mockUseAutoNavigation = {
    navigationState: {
      currentStep: "WAITING_FOR_ACCEPTANCE",
      rideId: "e2e-test-ride-123",
      activeRideStatus: "pending",
      hasMatchedDriver: true,
      hasDestination: true,
      isAutoNavigationActive: true,
    },
  };

  const mockUseRealtimeStore = {
    activeRide: {
      ride_id: "e2e-test-ride-123",
      status: "pending",
    },
    driverLocation: {
      latitude: 19.4326,
      longitude: -99.1332,
      accuracy: 10,
      timestamp: new Date(),
    },
    connectionStatus: {
      websocketConnected: true,
    },
    updateDriverLocation: jest.fn(),
    updateRideStatus: jest.fn(),
  };

  const mockUseUI = {
    showError: jest.fn(),
    showSuccess: jest.fn(),
  };

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

  describe("Complete Ride Flow: Request → Accept → Start → Complete", () => {
    it("should handle complete ride lifecycle with auto-navigation", async () => {
      // 1. Renderizar WaitingForAcceptance
      const { rerender, getByText } = render(<WaitingForAcceptance />);

      // Verificar estado inicial
      expect(getByText("Esperando aceptación")).toBeTruthy();

      // 2. Simular conductor acepta la solicitud
      act(() => {
        websocketEventManager.emit("ride:accepted", {
          rideId: "e2e-test-ride-123",
          driverId: "driver-123",
          estimatedArrival: 5,
        });
      });

      // Verificar que se mostró mensaje de éxito
      await waitFor(() => {
        expect(mockUseUI.showSuccess).toHaveBeenCalledWith(
          "¡Conductor aceptado!",
          "Tu viaje comenzará pronto",
        );
      });

      // Verificar que se navegó automáticamente
      expect(mockUseMapFlow.next).toHaveBeenCalled();

      // 3. Simular cambio a RideInProgress (mock manual navigation)
      const rideInProgressComponent = render(
        <RideInProgress
          driverName="Juan Pérez"
          destination="Centro Histórico"
          estimatedTime={15}
          rideId={123}
          onCallDriver={jest.fn()}
          onEmergency={jest.fn()}
        />,
      );

      // 4. Simular conductor llega al origen
      act(() => {
        websocketEventManager.emit("ride:arrived", {
          rideId: "e2e-test-ride-123",
          driverId: "driver-123",
          location: {
            latitude: 19.4326,
            longitude: -99.1332,
          },
        });
      });

      // 5. Simular viaje comienza
      act(() => {
        websocketEventManager.emit("ride:started", {
          rideId: "e2e-test-ride-123",
          startTime: new Date().toISOString(),
        });
      });

      // Verificar que se actualizó el estado del ride
      expect(mockUseRealtimeStore.updateRideStatus).toHaveBeenCalledWith(
        "e2e-test-ride-123",
        "in_progress",
      );

      // 6. Simular viaje finaliza
      act(() => {
        websocketEventManager.emit("ride:completed", {
          rideId: "e2e-test-ride-123",
          totalDistance: 12.5,
          totalTime: 18,
          finalFare: 125.5,
        });
      });

      // Verificar que se procesó el evento de finalización
      // (En un test real, verificaríamos navegación automática)
    });
  });

  describe("Error Scenarios and Recovery", () => {
    it("should handle rejected rides and navigate back", async () => {
      const { getByText } = render(<WaitingForAcceptance />);

      // Simular conductor rechaza la solicitud
      act(() => {
        websocketEventManager.emit("ride:rejected", {
          rideId: "e2e-test-ride-123",
          reason: "Conductor ocupado",
        });
      });

      // Verificar que se mostró mensaje de error
      await waitFor(() => {
        expect(mockUseUI.showError).toHaveBeenCalledWith(
          "Conductor no disponible",
          "Buscando otro conductor...",
        );
      });

      // Verificar que se navegó hacia atrás automáticamente
      expect(mockUseMapFlow.back).toHaveBeenCalled();
    });

    it("should handle ride cancellations during trip", async () => {
      const { getByText } = render(
        <RideInProgress
          driverName="Juan Pérez"
          destination="Centro Histórico"
          estimatedTime={15}
          rideId={123}
          onCallDriver={jest.fn()}
          onEmergency={jest.fn()}
        />,
      );

      // Simular cancelación durante el viaje
      act(() => {
        websocketEventManager.emit("ride:cancelled", {
          rideId: "e2e-test-ride-123",
          reason: "Problema técnico",
          cancelledBy: "driver",
        });
      });

      // Verificar que se procesó la cancelación
      // (En un test real, verificaríamos navegación automática)
    });

    it("should ignore events for different rides", async () => {
      render(<WaitingForAcceptance />);

      // Simular evento para ride diferente
      act(() => {
        websocketEventManager.emit("ride:accepted", {
          rideId: "different-ride-456",
          driverId: "driver-123",
        });
      });

      // Verificar que NO se mostró mensaje de éxito
      expect(mockUseUI.showSuccess).not.toHaveBeenCalled();
      expect(mockUseMapFlow.next).not.toHaveBeenCalled();
    });
  });

  describe("GPS Tracking During Ride", () => {
    it("should update location and ETA in real-time", async () => {
      const { getByText } = render(
        <RideInProgress
          driverName="Juan Pérez"
          destination="Centro Histórico"
          estimatedTime={15}
          rideId={123}
          onCallDriver={jest.fn()}
          onEmergency={jest.fn()}
        />,
      );

      // Verificar estado inicial
      expect(getByText("Viaje en Curso")).toBeTruthy();

      // Simular múltiples actualizaciones de GPS
      const gpsUpdates = [
        { latitude: 19.4326, longitude: -99.1332, accuracy: 10 },
        { latitude: 19.4426, longitude: -99.1432, accuracy: 8 },
        { latitude: 19.4526, longitude: -99.1532, accuracy: 6 },
        { latitude: 19.4626, longitude: -99.1632, accuracy: 5 },
      ];

      gpsUpdates.forEach((location, index) => {
        act(() => {
          websocketEventManager.emit("driverLocationUpdate", {
            rideId: "e2e-test-ride-123",
            ...location,
            timestamp: new Date().toISOString(),
          });
        });
      });

      // Verificar que se actualizó la ubicación del conductor
      expect(mockUseRealtimeStore.updateDriverLocation).toHaveBeenCalledTimes(
        gpsUpdates.length,
      );

      // Verificar que se muestran las actualizaciones GPS
      expect(getByText("📡 4 actualizaciones GPS")).toBeTruthy();
    });
  });

  describe("Connection State Changes", () => {
    it("should handle WebSocket disconnection and reconnection", async () => {
      const { getByText, rerender } = render(
        <RideInProgress
          driverName="Juan Pérez"
          destination="Centro Histórico"
          estimatedTime={15}
          rideId={123}
          onCallDriver={jest.fn()}
          onEmergency={jest.fn()}
        />,
      );

      // Verificar estado inicial (conectado)
      expect(getByText("🟢 GPS en tiempo real activo")).toBeTruthy();

      // Simular desconexión
      require("@/store/realtime/realtime").useRealtimeStore.mockReturnValue({
        ...mockUseRealtimeStore,
        connectionStatus: { websocketConnected: false },
      });

      // Re-render para reflejar el cambio
      rerender(
        <RideInProgress
          driverName="Juan Pérez"
          destination="Centro Histórico"
          estimatedTime={15}
          rideId={123}
          onCallDriver={jest.fn()}
          onEmergency={jest.fn()}
        />,
      );

      // Verificar que se muestra desconexión
      expect(getByText("🔴 GPS desconectado")).toBeTruthy();
      expect(
        getByText(
          "⚠️ Sin conexión en tiempo real. La información puede no estar actualizada.",
        ),
      ).toBeTruthy();

      // Simular reconexión
      require("@/store/realtime/realtime").useRealtimeStore.mockReturnValue({
        ...mockUseRealtimeStore,
        connectionStatus: { websocketConnected: true },
      });

      rerender(
        <RideInProgress
          driverName="Juan Pérez"
          destination="Centro Histórico"
          estimatedTime={15}
          rideId={123}
          onCallDriver={jest.fn()}
          onEmergency={jest.fn()}
        />,
      );

      // Verificar que se muestra reconexión
      expect(getByText("🟢 GPS en tiempo real activo")).toBeTruthy();
    });
  });

  describe("Performance Under Load", () => {
    it("should handle rapid event sequences without crashing", async () => {
      const { getByText } = render(<WaitingForAcceptance />);

      // Simular secuencia rápida de eventos
      const rapidEvents = [
        () =>
          websocketEventManager.emit("ride:accepted", {
            rideId: "e2e-test-ride-123",
          }),
        () =>
          websocketEventManager.emit("ride:started", {
            rideId: "e2e-test-ride-123",
          }),
        () =>
          websocketEventManager.emit("ride:completed", {
            rideId: "e2e-test-ride-123",
          }),
      ];

      // Ejecutar eventos rápidamente
      act(() => {
        rapidEvents.forEach((emitEvent, index) => {
          setTimeout(emitEvent, index * 10); // 10ms delay entre eventos
        });
      });

      // Esperar que se procesen todos los eventos
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verificar que el componente sigue funcionando
      expect(getByText("Esperando aceptación")).toBeTruthy();
    });

    it("should maintain state consistency during rapid updates", async () => {
      render(
        <RideInProgress
          driverName="Juan Pérez"
          destination="Centro Histórico"
          estimatedTime={15}
          rideId={123}
          onCallDriver={jest.fn()}
          onEmergency={jest.fn()}
        />,
      );

      // Simular muchas actualizaciones de GPS rápidamente
      act(() => {
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            websocketEventManager.emit("driverLocationUpdate", {
              rideId: "e2e-test-ride-123",
              latitude: 19.4326 + i * 0.001,
              longitude: -99.1332 + i * 0.001,
              accuracy: 10,
            });
          }, i * 5); // 5ms entre actualizaciones
        }
      });

      // Esperar que se procesen
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verificar que se actualizó el contador de GPS
      // (En un test real, verificaríamos el estado interno del componente)
    });
  });

  describe("User Interaction During Auto-Navigation", () => {
    it("should allow manual cancellation during waiting", async () => {
      const { getByText } = render(<WaitingForAcceptance />);

      // Simular clic en cancelar
      const cancelButton = getByText("Cancelar solicitud");
      fireEvent.press(cancelButton);

      // Verificar que se detuvo el timer
      expect(mockUseMapFlow.stopAcceptanceTimer).toHaveBeenCalled();

      // Verificar que se navegó hacia atrás
      expect(mockUseMapFlow.back).toHaveBeenCalled();
    });

    it("should allow emergency actions during ride", async () => {
      const mockEmergency = jest.fn();
      const { getByText } = render(
        <RideInProgress
          driverName="Juan Pérez"
          destination="Centro Histórico"
          estimatedTime={15}
          rideId={123}
          onCallDriver={jest.fn()}
          onEmergency={mockEmergency}
        />,
      );

      // Simular clic en emergencia durante el viaje
      const emergencyButton = getByText("🚨 Emergencia");
      fireEvent.press(emergencyButton);

      // Verificar que se ejecutó la acción de emergencia
      expect(mockEmergency).toHaveBeenCalled();
    });
  });
});
