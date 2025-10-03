import { act, renderHook } from "@testing-library/react-native";
import { useDriverProfileStore } from "@/store/driverProfile";

// Mock the services
jest.mock("@/app/services/driverService", () => ({
  driverService: {
    getProfile: jest.fn(),
  },
}));

jest.mock("@/app/services/vehicleService", () => ({
  vehicleService: {
    getVehicles: jest.fn(),
    createVehicle: jest.fn(),
    updateVehicle: jest.fn(),
    deleteVehicle: jest.fn(),
  },
}));

jest.mock("@/app/services/documentService", () => ({
  documentService: {
    getDocuments: jest.fn(),
    uploadDocument: jest.fn(),
  },
}));

describe("DriverProfileStore", () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useDriverProfileStore.setState({
        profile: null,
        vehicles: [],
        documents: [],
        isLoading: false,
        error: null,
      });
    });
  });

  describe("Profile Management", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useDriverProfileStore());

      expect(result.current.profile).toBeNull();
      expect(result.current.vehicles).toEqual([]);
      expect(result.current.documents).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should set profile correctly", () => {
      const { result } = renderHook(() => useDriverProfileStore());

      const mockProfile = {
        id: "driver123",
        userId: "user123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        profilePicture: undefined,
        dateOfBirth: new Date("1985-05-15"),
        licenseNumber: "DL123456789",
        licenseExpiry: new Date("2025-12-31"),
        insuranceProvider: "State Farm",
        insuranceExpiry: new Date("2024-12-31"),
        vehicleRegistration: "ABC123",
        registrationExpiry: new Date("2024-12-31"),
        isVerified: true,
        verificationStatus: "approved" as const,
        joinedDate: new Date("2023-01-01"),
        totalRides: 150,
        totalEarnings: 15000,
        averageRating: 4.8,
        status: "active" as const,
        isOnline: true,
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
          timestamp: new Date(),
          address: "New York, NY",
        },
      };

      act(() => {
        result.current.setProfile(mockProfile);
      });

      expect(result.current.profile).toEqual(mockProfile);
    });

    it("should handle fetchProfile with API success", async () => {
      const { driverService } = require("@/app/services/driverService");
      const { result } = renderHook(() => useDriverProfileStore());

      const mockApiResponse = {
        id: "driver123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        averageRating: 4.8,
        totalRides: 150,
        joinedDate: "2023-01-01",
        isVerified: true,
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      };

      driverService.getProfile.mockResolvedValue(mockApiResponse);

      await act(async () => {
        await result.current.fetchProfile();
      });

      expect(result.current.profile).toBeTruthy();
      expect(result.current.profile?.firstName).toBe("John");
      expect(result.current.profile?.averageRating).toBe(4.8);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle fetchProfile with API error and use fallback", async () => {
      const { driverService } = require("@/app/services/driverService");
      const { result } = renderHook(() => useDriverProfileStore());

      driverService.getProfile.mockRejectedValue(new Error("API Error"));

      await act(async () => {
        await result.current.fetchProfile();
      });

      // Should use fallback data
      expect(result.current.profile).toBeTruthy();
      expect(result.current.profile?.firstName).toBe("Carlos");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("Vehicle Management", () => {
    it("should fetch vehicles successfully", async () => {
      const { vehicleService } = require("@/app/services/vehicleService");
      const { result } = renderHook(() => useDriverProfileStore());

      const mockVehicles = [
        {
          id: "vehicle1",
          driverId: "driver123",
          make: "Toyota",
          model: "Camry",
          year: 2020,
          licensePlate: "ABC123",
          color: "White",
          seats: 4,
          status: "active" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vehicleService.getVehicles.mockResolvedValue(mockVehicles);

      await act(async () => {
        await result.current.fetchVehicles();
      });

      expect(result.current.vehicles).toEqual(mockVehicles);
      expect(result.current.isLoading).toBe(false);
    });

    it("should create vehicle successfully", async () => {
      const { vehicleService } = require("@/app/services/vehicleService");
      const { result } = renderHook(() => useDriverProfileStore());

      const newVehicleData = {
        make: "Honda",
        model: "Civic",
        year: 2021,
        licensePlate: "XYZ789",
        color: "Blue",
        seats: 4,
      };

      const mockCreatedVehicle = {
        ...newVehicleData,
        id: "vehicle_new",
        driverId: "driver123",
        status: "pending" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vehicleService.createVehicle.mockResolvedValue(mockCreatedVehicle);

      let returnedVehicle;
      await act(async () => {
        returnedVehicle = await result.current.addVehicle(newVehicleData);
      });

      expect(returnedVehicle).toEqual(mockCreatedVehicle);
      expect(result.current.vehicles).toContain(mockCreatedVehicle);
      expect(result.current.isLoading).toBe(false);
    });

    it("should update vehicle successfully", async () => {
      const { vehicleService } = require("@/app/services/vehicleService");
      const { result } = renderHook(() => useDriverProfileStore());

      // Set initial vehicle
      const initialVehicle = {
        id: "vehicle1",
        driverId: "driver123",
        make: "Toyota",
        model: "Camry",
        year: 2020,
        licensePlate: "ABC123",
        color: "White",
        seats: 4,
        status: "active" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      act(() => {
        result.current.setVehicles([initialVehicle]);
      });

      const updatedVehicle = {
        ...initialVehicle,
        status: "inactive" as const,
        updatedAt: new Date(),
      };

      vehicleService.updateVehicle.mockResolvedValue(updatedVehicle);

      await act(async () => {
        await result.current.updateVehicle("vehicle1", { status: "inactive" });
      });

      expect(result.current.vehicles[0].status).toBe("inactive");
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Document Management", () => {
    it("should fetch documents successfully", async () => {
      const { documentService } = require("@/app/services/documentService");
      const { result } = renderHook(() => useDriverProfileStore());

      const mockDocuments = [
        {
          id: "doc1",
          driverId: "driver123",
          type: "driver_license" as const,
          name: "Driver License",
          status: "approved" as const,
          uploadedAt: new Date(),
          isRequired: true,
        },
      ];

      documentService.getDocuments.mockResolvedValue(mockDocuments);

      await act(async () => {
        await result.current.fetchDocuments();
      });

      expect(result.current.documents).toEqual(mockDocuments);
      expect(result.current.isLoading).toBe(false);
    });

    it("should upload document successfully", async () => {
      const { documentService } = require("@/app/services/documentService");
      const { result } = renderHook(() => useDriverProfileStore());

      const mockUploadedDocument = {
        id: "doc_new",
        driverId: "driver123",
        type: "driver_license" as const,
        name: "Driver License Document",
        status: "pending_review" as const,
        uploadedAt: new Date(),
        isRequired: true,
      };

      documentService.uploadDocument.mockResolvedValue(mockUploadedDocument);

      await act(async () => {
        await result.current.uploadDocument(
          "driver_license",
          "base64data",
          "Driver License",
        );
      });

      expect(result.current.documents).toContain(mockUploadedDocument);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
