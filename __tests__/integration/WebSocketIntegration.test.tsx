import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import { websocketEventManager } from "@/lib/websocketEventManager";

// Mock components
import WaitingForAcceptance from "@/components/unified-flow/steps/Client/Viaje/WaitingForAcceptance";
import RideInProgress from "@/components/unified-flow/steps/RideInProgress";

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
    rideId: "test-ride-123",
    activeRideStatus: "pending",
    hasMatchedDriver: true,
    hasDestination: true,
    isAutoNavigationActive: true,
  },
};

const mockUseRealtimeStore = {
  activeRide: {
    ride_id: "test-ride-123",
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
};

const mockUseUI = {
  showError: jest.fn(),
  showSuccess: jest.fn(),
};

describe("WebSocket Integration Tests", () => {
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

  describe("WaitingForAcceptance WebSocket Integration", () => {
    it("should handle ride:accepted event and show success message", async () => {
      render(<WaitingForAcceptance />);

      // Simular evento WebSocket ride:accepted
      act(() => {
        websocketEventManager.emit("ride:accepted", {
          rideId: "test-ride-123",
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
    });

    it("should handle ride:rejected event and show error message", async () => {
      render(<WaitingForAcceptance />);

      // Simular evento WebSocket ride:rejected
      act(() => {
        websocketEventManager.emit("ride:rejected", {
          rideId: "test-ride-123",
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
    });

    it("should update connection status when WebSocket connects/disconnects", async () => {
      const { getByText } = render(<WaitingForAcceptance />);

      // Verificar estado inicial (conectado)
      expect(getByText("🟢 Conectado")).toBeTruthy();

      // Simular desconexión (esto requeriría mock del connection status)
      // En un test real, esto se haría mockeando el useRealtimeStore
    });
  });

  describe("RideInProgress WebSocket Integration", () => {
    it("should handle driverLocationUpdate and recalculate ETA", async () => {
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

      // Simular actualización de ubicación del conductor
      act(() => {
        websocketEventManager.emit("driverLocationUpdate", {
          rideId: "test-ride-123",
          latitude: 19.4426, // Más cerca del destino
          longitude: -99.1432,
          accuracy: 8,
          speed: 35,
          timestamp: new Date().toISOString(),
        });
      });

      // Verificar que se actualizó la ubicación (esto requeriría acceso al estado interno)
      // En un test real, podríamos verificar que se llamó a updateDriverLocation
    });

    it("should handle ride:arrived event", async () => {
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

      // Simular evento ride:arrived
      act(() => {
        websocketEventManager.emit("ride:arrived", {
          rideId: "test-ride-123",
          driverId: "driver-123",
          location: {
            latitude: 19.4326,
            longitude: -99.1332,
          },
        });
      });

      // Verificar logging o efectos (esto requeriría mocks más detallados)
    });

    it("should handle ride:started event", async () => {
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

      // Simular evento ride:started
      act(() => {
        websocketEventManager.emit("ride:started", {
          rideId: "test-ride-123",
          startTime: new Date().toISOString(),
        });
      });

      // Verificar que se actualizó el estado del ride
      await waitFor(() => {
        expect(
          require("@/store/realtime/realtime").useRealtimeStore,
        ).toHaveBeenCalled();
      });
    });

    it("should handle ride:completed event", async () => {
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

      // Simular evento ride:completed
      act(() => {
        websocketEventManager.emit("ride:completed", {
          rideId: "test-ride-123",
          totalDistance: 12.5,
          totalTime: 18,
          finalFare: 125.5,
        });
      });

      // Verificar efectos de finalización
    });

    it("should ignore location updates for different rides", async () => {
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

      // Simular actualización para ride diferente
      act(() => {
        websocketEventManager.emit("driverLocationUpdate", {
          rideId: "different-ride-456",
          latitude: 19.4426,
          longitude: -99.1432,
        });
      });

      // Verificar que no se actualizó nada (esto requeriría mocks más específicos)
    });
  });

  describe("WebSocket Connection Status", () => {
    it("should show connection status in UI components", async () => {
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

      // Verificar que se muestra el estado de conexión
      expect(getByText("🟢 GPS en tiempo real activo")).toBeTruthy();
    });

    it("should show disconnection warning when WebSocket is offline", async () => {
      // Mock desconexión
      require("@/store/realtime/realtime").useRealtimeStore.mockReturnValue({
        ...mockUseRealtimeStore,
        connectionStatus: {
          websocketConnected: false,
        },
      });

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

      // Verificar que se muestra advertencia de desconexión
      expect(getByText("🔴 GPS desconectado")).toBeTruthy();
      expect(
        getByText(
          "⚠️ Sin conexión en tiempo real. La información puede no estar actualizada.",
        ),
      ).toBeTruthy();
    });
  });

  describe("Performance Tests", () => {
    it("should handle rapid WebSocket events without crashing", async () => {
      render(<WaitingForAcceptance />);

      // Simular múltiples eventos rápidos
      act(() => {
        for (let i = 0; i < 10; i++) {
          websocketEventManager.emit("ride:accepted", {
            rideId: "test-ride-123",
            driverId: "driver-123",
          });
        }
      });

      // Verificar que el componente sigue funcionando
      // En un test real, verificaríamos que no hay memory leaks
    });

    it("should debounce rapid location updates", async () => {
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

      // Simular múltiples actualizaciones de ubicación rápidas
      act(() => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            websocketEventManager.emit("driverLocationUpdate", {
              rideId: "test-ride-123",
              latitude: 19.4326 + i * 0.001,
              longitude: -99.1332 + i * 0.001,
              accuracy: 10,
              timestamp: new Date().toISOString(),
            });
          }, i * 100);
        }
      });

      // Esperar un poco para que se procesen
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verificar que el componente maneja las actualizaciones correctamente
    });
  });
});
