import { renderHook, act } from "@testing-library/react-native";
import { useMapFlow } from "../../hooks/useMapFlow";
import { RideType } from "../../lib/unified-flow/constants";

// Mock the stores
jest.mock("@/store/mapFlow/mapFlow", () => ({
  useMapFlowStore: jest.fn(),
  MapFlowRole: {
    CUSTOMER: "customer",
    DRIVER: "driver",
  },
}));

jest.mock("@/store", () => ({
  useVehicleTiersStore: {
    getState: jest.fn(() => ({
      loadTiersFromStorage: jest.fn(),
      fetchTiers: jest.fn(),
    })),
  },
}));

const mockUseMapFlowStore = require("@/store/mapFlow/mapFlow").useMapFlowStore;
const mockUseVehicleTiersStore = require("@/store").useVehicleTiersStore;

describe("useMapFlow", () => {
  const mockStore = {
    step: "initial",
    service: null,
    isActive: false,
    bottomSheetVisible: false,
    bottomSheetAllowDrag: true,
    bottomSheetMinHeight: 0.1,
    bottomSheetMaxHeight: 0.8,
    bottomSheetInitialHeight: 0.4,
    start: jest.fn(),
    startService: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
    next: jest.fn(),
    back: jest.fn(),
    goTo: jest.fn(),
    goToStep: jest.fn(),
    getInitialStepConfig: jest.fn(),
    startWithConfig: jest.fn(),
    startWithCustomerStep: jest.fn(),
    startWithDriverStep: jest.fn(),
    startWithTransportStep: jest.fn(),
    startWithDeliveryStep: jest.fn(),
    startWithMandadoStep: jest.fn(),
    startWithEnvioStep: jest.fn(),
    setRideType: jest.fn(),
    setConfirmedOrigin: jest.fn(),
    setConfirmedDestination: jest.fn(),
    setPhoneNumber: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMapFlowStore.mockReturnValue(mockStore);
  });

  describe("Basic Functionality", () => {
    test("returns all store state and methods", () => {
      const { result } = renderHook(() => useMapFlow());

      expect(result.current.step).toBe("initial");
      expect(result.current.isActive).toBe(false);
      expect(result.current.start).toBeDefined();
      expect(result.current.startService).toBeDefined();
      expect(result.current.stop).toBeDefined();
      expect(result.current.reset).toBeDefined();
    });

    test("includes all type-safe helper methods", () => {
      const { result } = renderHook(() => useMapFlow());

      expect(result.current.startWithCustomerStep).toBeDefined();
      expect(result.current.startWithDriverStep).toBeDefined();
      expect(result.current.startWithTransportStep).toBeDefined();
      expect(result.current.startWithDeliveryStep).toBeDefined();
      expect(result.current.startWithMandadoStep).toBeDefined();
      expect(result.current.startWithEnvioStep).toBeDefined();
    });

    test("includes state setters", () => {
      const { result } = renderHook(() => useMapFlow());

      expect(result.current.setRideType).toBeDefined();
      expect(result.current.setConfirmedOrigin).toBeDefined();
      expect(result.current.setConfirmedDestination).toBeDefined();
      expect(result.current.setPhoneNumber).toBeDefined();
    });
  });

  describe("Navigation Methods", () => {
    test("start calls store.start with role", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.start("customer");
      });

      expect(mockStore.start).toHaveBeenCalledWith("customer");
    });

    test("stop calls store.stop", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.stop();
      });

      expect(mockStore.stop).toHaveBeenCalled();
    });

    test("reset calls store.reset", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.reset();
      });

      expect(mockStore.reset).toHaveBeenCalled();
    });

    test("next calls store.next", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.next();
      });

      expect(mockStore.next).toHaveBeenCalled();
    });

    test("back calls store.back", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.back();
      });

      expect(mockStore.back).toHaveBeenCalled();
    });

    test("goTo calls store.goTo with step", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.goTo("idle");
      });

      expect(mockStore.goTo).toHaveBeenCalledWith("idle");
    });

    test("goToStep calls store.goToStep with step name", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.goToStep("step_name");
      });

      expect(mockStore.goToStep).toHaveBeenCalledWith("step_name");
    });
  });

  describe("startService Method", () => {
    const mockTiersStore = {
      loadTiersFromStorage: jest.fn(),
      fetchTiers: jest.fn(),
    };

    beforeEach(() => {
      mockUseVehicleTiersStore.getState.mockReturnValue(mockTiersStore);
    });

    test("starts service without pre-loading for non-transport services", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        await result.current.startService("delivery");
      });

      expect(mockStore.startService).toHaveBeenCalledWith(
        "delivery",
        undefined,
      );
      expect(mockTiersStore.loadTiersFromStorage).not.toHaveBeenCalled();
      expect(mockTiersStore.fetchTiers).not.toHaveBeenCalled();
    });

    test("pre-loads vehicle tiers for transport service when not in storage", async () => {
      mockTiersStore.loadTiersFromStorage.mockResolvedValue(null);

      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        await result.current.startService("transport", "customer");
      });

      expect(mockTiersStore.loadTiersFromStorage).toHaveBeenCalled();
      expect(mockTiersStore.fetchTiers).toHaveBeenCalled();
      expect(mockStore.startService).toHaveBeenCalledWith(
        "transport",
        "customer",
      );
    });

    test("uses cached vehicle tiers for transport service when available", async () => {
      mockTiersStore.loadTiersFromStorage.mockResolvedValue([
        { id: 1, name: "Basic" },
      ]);

      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        await result.current.startService("transport", "driver");
      });

      expect(mockTiersStore.loadTiersFromStorage).toHaveBeenCalled();
      expect(mockTiersStore.fetchTiers).not.toHaveBeenCalled();
      expect(mockStore.startService).toHaveBeenCalledWith(
        "transport",
        "driver",
      );
    });
  });

  describe("Type-Safe Helper Methods", () => {
    test("startWithCustomerStep calls store method with correct step", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.startWithCustomerStep(
          "CUSTOMER_TRANSPORT_DEFINICION_VIAJE",
        );
      });

      expect(mockStore.startWithCustomerStep).toHaveBeenCalledWith(
        "CUSTOMER_TRANSPORT_DEFINICION_VIAJE",
      );
    });

    test("startWithDriverStep calls store method with correct step", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.startWithDriverStep(
          "DRIVER_TRANSPORT_RECIBIR_SOLICITUD",
        );
      });

      expect(mockStore.startWithDriverStep).toHaveBeenCalledWith(
        "DRIVER_TRANSPORT_RECIBIR_SOLICITUD",
      );
    });

    test("startWithTransportStep calls store method with step and role", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.startWithTransportStep(
          "CUSTOMER_TRANSPORT_SELECCION_VEHICULO",
          "customer",
        );
      });

      expect(mockStore.startWithTransportStep).toHaveBeenCalledWith(
        "CUSTOMER_TRANSPORT_SELECCION_VEHICULO",
        "customer",
      );
    });

    test("startWithDeliveryStep calls store method with step and role", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.startWithDeliveryStep(
          "CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO",
          "customer",
        );
      });

      expect(mockStore.startWithDeliveryStep).toHaveBeenCalledWith(
        "CUSTOMER_DELIVERY_BUSQUEDA_NEGOCIO",
        "customer",
      );
    });

    test("startWithMandadoStep calls store method with step and role", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.startWithMandadoStep(
          "CUSTOMER_MANDADO_DETALLES_MANDADO",
          "customer",
        );
      });

      expect(mockStore.startWithMandadoStep).toHaveBeenCalledWith(
        "CUSTOMER_MANDADO_DETALLES_MANDADO",
        "customer",
      );
    });

    test("startWithEnvioStep calls store method with step and role", async () => {
      const { result } = renderHook(() => useMapFlow());

      await act(async () => {
        result.current.startWithEnvioStep(
          "CUSTOMER_ENVIO_DETALLES_ENVIO",
          "customer",
        );
      });

      expect(mockStore.startWithEnvioStep).toHaveBeenCalledWith(
        "CUSTOMER_ENVIO_DETALLES_ENVIO",
        "customer",
      );
    });
  });

  describe("Configuration Methods", () => {
    test("getInitialStepConfig calls store method", () => {
      const { result } = renderHook(() => useMapFlow());

      result.current.getInitialStepConfig("idle");

      expect(mockStore.getInitialStepConfig).toHaveBeenCalledWith("idle");
    });

    test("startWithConfig calls store method with step and role", () => {
      const { result } = renderHook(() => useMapFlow());

      result.current.startWithConfig("idle", "customer");

      expect(mockStore.startWithConfig).toHaveBeenCalledWith(
        "idle",
        "customer",
      );
    });
  });

  describe("State Setters", () => {
    test("setRideType calls store method", () => {
      const { result } = renderHook(() => useMapFlow());

      result.current.setRideType(RideType.NORMAL);

      expect(mockStore.setRideType).toHaveBeenCalledWith(RideType.NORMAL);
    });

    test("setConfirmedOrigin calls store method", () => {
      const { result } = renderHook(() => useMapFlow());

      const location = {
        latitude: 40.7128,
        longitude: -74.006,
        address: "NYC",
      };
      result.current.setConfirmedOrigin(location);

      expect(mockStore.setConfirmedOrigin).toHaveBeenCalledWith(location);
    });

    test("setConfirmedDestination calls store method", () => {
      const { result } = renderHook(() => useMapFlow());

      const location = {
        latitude: 40.7589,
        longitude: -73.9851,
        address: "Times Square",
      };
      result.current.setConfirmedDestination(location);

      expect(mockStore.setConfirmedDestination).toHaveBeenCalledWith(location);
    });

    test("setPhoneNumber calls store method", () => {
      const { result } = renderHook(() => useMapFlow());

      result.current.setPhoneNumber("+1234567890");

      expect(mockStore.setPhoneNumber).toHaveBeenCalledWith("+1234567890");
    });
  });

  describe("Performance and Memoization", () => {
    test("methods are memoized with useCallback", () => {
      const { result } = renderHook(() => useMapFlow());

      const firstStart = result.current.start;
      const firstStop = result.current.stop;
      const firstStartWithCustomerStep = result.current.startWithCustomerStep;

      // Methods should be the same reference due to memoization
      expect(result.current.start).toBe(firstStart);
      expect(result.current.stop).toBe(firstStop);
      expect(result.current.startWithCustomerStep).toBe(
        firstStartWithCustomerStep,
      );
    });
  });

  describe("Error Handling", () => {
    test("handles vehicle tiers loading errors gracefully", async () => {
      const mockTiersStore = {
        loadTiersFromStorage: jest
          .fn()
          .mockRejectedValue(new Error("Storage error")),
        fetchTiers: jest.fn(),
      };
      mockUseVehicleTiersStore.getState.mockReturnValue(mockTiersStore);

      const { result } = renderHook(() => useMapFlow());

      // Should not throw when vehicle tiers loading fails
      await expect(async () => {
        await act(async () => {
          await result.current.startService("transport");
        });
      }).not.toThrow();

      expect(mockStore.startService).toHaveBeenCalledWith(
        "transport",
        undefined,
      );
    });

    test("handles API fetch errors gracefully", async () => {
      const mockTiersStore = {
        loadTiersFromStorage: jest.fn().mockResolvedValue(null),
        fetchTiers: jest.fn().mockRejectedValue(new Error("API error")),
      };
      mockUseVehicleTiersStore.getState.mockReturnValue(mockTiersStore);

      const { result } = renderHook(() => useMapFlow());

      // Should not throw when API fetch fails
      await expect(async () => {
        await act(async () => {
          await result.current.startService("transport");
        });
      }).not.toThrow();

      expect(mockStore.startService).toHaveBeenCalledWith(
        "transport",
        undefined,
      );
    });
  });
});
