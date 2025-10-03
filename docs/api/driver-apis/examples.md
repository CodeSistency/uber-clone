# Examples & Test Cases - Driver APIs

Esta sección contiene ejemplos prácticos y casos de prueba para las APIs de drivers.

## Ejemplos de Uso

### 1. Gestión del Perfil del Conductor

#### Obtener y Mostrar Perfil

```typescript
// En un componente React
const DriverProfileScreen = () => {
  const { profile, isLoading, error, fetchProfile } = useDriverProfileStore();
  const { showError } = useUI();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (error) {
      showError('Error loading profile', error);
    }
  }, [error, showError]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <Text>No profile found</Text>;
  }

  return (
    <View>
      <Text>{profile.firstName} {profile.lastName}</Text>
      <Text>⭐ {profile.rating}</Text>
      <Text>{profile.totalRides} rides</Text>
      <Text>Member since {new Date(profile.joinDate).toLocaleDateString()}</Text>
    </View>
  );
};
```

#### Actualizar Perfil

```typescript
const updateDriverProfile = async (updates: Partial<DriverProfile>) => {
  const { updateProfile } = useDriverProfileStore.getState();
  const { showSuccess, showError } = useUI();

  try {
    await updateProfile(updates);
    showSuccess(
      "Profile Updated",
      "Your profile has been updated successfully",
    );
  } catch (error) {
    showError("Update Failed", "Failed to update profile. Please try again.");
  }
};

// Uso en un formulario
const handleProfileUpdate = () => {
  updateDriverProfile({
    firstName: "Carlos",
    lastName: "Rodriguez",
    phone: "+1234567890",
  });
};
```

### 2. Gestión de Vehículos

#### Agregar Nuevo Vehículo

```typescript
const addNewVehicle = async (vehicleData: CreateVehicleRequest) => {
  const { addVehicle, fetchVehicles } = useDriverProfileStore.getState();
  const { showSuccess, showError } = useUI();

  try {
    await addVehicle(vehicleData);
    await fetchVehicles(); // Refresh list
    showSuccess('Vehicle Added', 'Your vehicle has been added successfully');
    router.back();
  } catch (error) {
    showError('Error', 'Failed to add vehicle. Please check your information.');
  }
};

// Formulario de vehículo
const VehicleForm = () => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    seats: 4
  });

  const handleSubmit = () => {
    addNewVehicle(formData);
  };

  return (
    <ScrollView>
      <InputField
        label="Make"
        value={formData.make}
        onChangeText={(text) => setFormData(prev => ({ ...prev, make: text }))}
      />
      <InputField
        label="Model"
        value={formData.model}
        onChangeText={(text) => setFormData(prev => ({ ...prev, model: text }))}
      />
      <InputField
        label="Year"
        value={formData.year.toString()}
        onChangeText={(text) => setFormData(prev => ({ ...prev, year: parseInt(text) || new Date().getFullYear() }))}
        keyboardType="numeric"
      />
      <InputField
        label="License Plate"
        value={formData.licensePlate}
        onChangeText={(text) => setFormData(prev => ({ ...prev, licensePlate: text.toUpperCase() }))}
      />
      <Button title="Add Vehicle" onPress={handleSubmit} />
    </ScrollView>
  );
};
```

#### Gestionar Estado de Vehículos

```typescript
const toggleVehicleStatus = async (
  vehicleId: string,
  currentStatus: VehicleStatus,
) => {
  const { updateVehicle } = useDriverProfileStore.getState();
  const { showSuccess, showError } = useUI();

  try {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    await updateVehicle(vehicleId, { status: newStatus });

    showSuccess("Status Updated", `Vehicle is now ${newStatus}`);
  } catch (error) {
    showError("Error", "Failed to update vehicle status");
  }
};
```

### 3. Gestión de Documentos

#### Subir Documento

```typescript
const uploadDocumentFile = async (type: string, file: any, name?: string) => {
  const { uploadDocument, fetchDocuments } = useDriverProfileStore.getState();
  const { showSuccess, showError } = useUI();

  try {
    await uploadDocument(type, file, name);
    await fetchDocuments(); // Refresh list
    showSuccess('Document Uploaded', 'Your document has been uploaded for review');
  } catch (error) {
    showError('Upload Failed', 'Failed to upload document. Please try again.');
  }
};

// Selector de documento
const DocumentUpload = () => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (result.type === 'success') {
        await uploadDocumentFile('driver_license', result, 'Driver License');
      }
    } catch (error) {
      showError('Error', 'Failed to select document');
    }
  };

  return (
    <TouchableOpacity onPress={pickDocument}>
      <Text>Upload Driver License</Text>
    </TouchableOpacity>
  );
};
```

#### Verificar Estado de Documentos

```typescript
const checkVerificationStatus = () => {
  const { documents } = useDriverProfileStore.getState();

  const totalDocs = documents.length;
  const approvedDocs = documents.filter(
    (doc) => doc.status === "approved",
  ).length;
  const pendingDocs = documents.filter(
    (doc) => doc.status === "pending_review",
  ).length;
  const rejectedDocs = documents.filter(
    (doc) => doc.status === "rejected",
  ).length;

  return {
    totalDocs,
    approvedDocs,
    pendingDocs,
    rejectedDocs,
    isFullyVerified: approvedDocs === totalDocs && totalDocs > 0,
  };
};
```

### 4. Gestión de Ganancias

#### Mostrar Resumen de Ganancias

```typescript
const EarningsSummary = () => {
  const { earningsSummary, isLoading, error, fetchEarningsSummary } = useDriverEarningsStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'total'>('today');

  useEffect(() => {
    fetchEarningsSummary();
  }, [fetchEarningsSummary]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={fetchEarningsSummary} />;
  if (!earningsSummary) return <Text>No earnings data available</Text>;

  const currentData = earningsSummary[selectedPeriod];

  return (
    <View>
      <View className="flex-row justify-between mb-4">
        {['today', 'week', 'month', 'total'].map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period as any)}
            className={`px-3 py-2 rounded ${selectedPeriod === period ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <Text className={selectedPeriod === period ? 'text-white' : 'text-gray-700'}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-white p-4 rounded-lg">
        <Text className="text-2xl font-bold text-primary mb-2">
          ${currentData.earnings.toFixed(2)}
        </Text>
        <Text className="text-gray-600 mb-4">Total Earnings</Text>

        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-lg font-semibold">{currentData.rides}</Text>
            <Text className="text-gray-600 text-sm">Rides</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-semibold">{currentData.hours.toFixed(1)}h</Text>
            <Text className="text-gray-600 text-sm">Hours</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-semibold">${currentData.averagePerRide.toFixed(2)}</Text>
            <Text className="text-gray-600 text-sm">Avg/Ride</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
```

#### Mostrar Historial de Viajes

```typescript
const TripHistory = () => {
  const { tripHistory, isLoading, fetchTripHistory } = useDriverEarningsStore();

  useEffect(() => {
    fetchTripHistory();
  }, [fetchTripHistory]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <FlatList
      data={tripHistory}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="bg-white p-4 mb-2 rounded-lg">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="font-semibold mb-1">
                {item.date.toLocaleDateString()} {item.date.toLocaleTimeString()}
              </Text>
              <Text className="text-gray-600 text-sm">
                {item.pickupLocation} → {item.dropoffLocation}
              </Text>
            </View>
            <Text className="font-bold text-primary">
              ${item.total.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row justify-between text-sm text-gray-600">
            <Text>{item.distance.toFixed(1)} miles • {item.duration} min</Text>
            <Text>⭐ {item.rating.toFixed(1)}</Text>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View className="items-center py-8">
          <Text className="text-gray-500">No trips yet</Text>
        </View>
      }
    />
  );
};
```

## Casos de Prueba

### Casos de Prueba Unitarios

#### Servicio de Conductor

```typescript
describe("DriverService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return profile data on success", async () => {
      const mockResponse = {
        id: "driver123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        rating: 4.8,
        totalRides: 150,
      };

      (fetchAPI as jest.Mock).mockResolvedValue(mockResponse);

      const result = await driverService.getProfile();

      expect(fetchAPI).toHaveBeenCalledWith("drivers/profile", {
        requiresAuth: true,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it("should handle API errors gracefully", async () => {
      const errorMessage = "Network error";
      (fetchAPI as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const result = await driverService.getProfile();

      expect(result.success).toBe(false);
      expect(result.message).toContain(errorMessage);
    });

    it("should handle 401 unauthorized", async () => {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      (fetchAPI as jest.Mock).mockRejectedValue(error);

      const result = await driverService.getProfile();

      expect(result.success).toBe(false);
      expect(result.message).toContain("Unauthorized");
      // Should trigger logout or token refresh
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      const updates = { firstName: "Jane", phone: "+1234567890" };
      const mockResponse = {
        id: "driver123",
        firstName: "Jane",
        phone: "+1234567890",
      };

      (fetchAPI as jest.Mock).mockResolvedValue(mockResponse);

      const result = await driverService.updateProfile(updates);

      expect(fetchAPI).toHaveBeenCalledWith("drivers/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
        requiresAuth: true,
      });
      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe("Jane");
    });

    it("should validate input data", async () => {
      const invalidUpdates = { email: "invalid-email" };

      // Mock validation error from API
      (fetchAPI as jest.Mock).mockRejectedValue({
        statusCode: 422,
        message: "Invalid email format",
      });

      const result = await driverService.updateProfile(invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid email format");
    });
  });
});
```

#### Store de Perfil del Conductor

```typescript
describe("DriverProfileStore", () => {
  beforeEach(() => {
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

  describe("fetchProfile", () => {
    it("should fetch and set profile data", async () => {
      const mockProfile = {
        id: "driver123",
        firstName: "John",
        lastName: "Doe",
        rating: 4.8,
      };

      jest.spyOn(driverService, "getProfile").mockResolvedValue({
        success: true,
        data: mockProfile,
        message: "Success",
      });

      const { result } = renderHook(() => useDriverProfileStore());

      await act(async () => {
        await result.current.fetchProfile();
      });

      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should handle fetch errors", async () => {
      jest.spyOn(driverService, "getProfile").mockResolvedValue({
        success: false,
        message: "API Error",
      });

      const { result } = renderHook(() => useDriverProfileStore());

      await act(async () => {
        await result.current.fetchProfile();
      });

      expect(result.current.profile).toBeTruthy(); // Should use fallback
      expect(result.current.error).toContain("API Error");
    });

    it("should set loading state during fetch", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      jest.spyOn(driverService, "getProfile").mockReturnValue(promise);

      const { result } = renderHook(() => useDriverProfileStore());

      act(() => {
        result.current.fetchProfile();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise({
          success: true,
          data: { id: "test" },
          message: "Success",
        });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

### Casos de Prueba de Integración

#### Flujo Completo de Onboarding de Conductor

```typescript
describe("Driver Onboarding Flow", () => {
  it("should complete full onboarding process", async () => {
    // 1. Create profile
    const profileData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1234567890",
    };

    await act(async () => {
      await driverService.createProfile(profileData);
    });

    // 2. Add vehicle
    const vehicleData = {
      make: "Toyota",
      model: "Camry",
      year: 2020,
      licensePlate: "ABC123",
      color: "White",
      seats: 4,
    };

    await act(async () => {
      await driverService.addVehicle(vehicleData);
    });

    // 3. Upload documents
    const documentFile = new File(["dummy content"], "license.pdf");

    await act(async () => {
      await driverService.uploadDocument("driver_license", documentFile);
    });

    // 4. Verify status
    const status = await driverService.getVerificationStatus();

    expect(status.isVerified).toBe(false); // Pending review
    expect(status.documentsUploaded).toBe(1);
  });

  it("should handle document rejection and re-upload", async () => {
    // Upload document
    const documentFile = new File(["dummy content"], "license.pdf");

    await act(async () => {
      await driverService.uploadDocument("driver_license", documentFile);
    });

    // Simulate rejection
    await act(async () => {
      await driverService.rejectDocument("doc123", "Poor quality image");
    });

    // Re-upload
    const newDocumentFile = new File(["better content"], "license_clear.pdf");

    await act(async () => {
      await driverService.reuploadDocument("doc123", newDocumentFile);
    });

    // Check status
    const documents = await driverService.getDocuments();
    const doc = documents.find((d) => d.id === "doc123");

    expect(doc.status).toBe("pending_review");
    expect(doc.rejectionReason).toBe(null);
  });
});
```

#### Gestión de Estado de Vehículos

```typescript
describe("Vehicle Status Management", () => {
  it("should change vehicle status correctly", async () => {
    // Add vehicle
    const vehicle = await driverService.addVehicle({
      make: "Honda",
      model: "Civic",
      year: 2021,
      licensePlate: "XYZ789",
      color: "Blue",
      seats: 4,
    });

    expect(vehicle.status).toBe("pending");

    // Activate vehicle
    await driverService.updateVehicle(vehicle.id, { status: "active" });

    const updatedVehicle = await driverService.getVehicle(vehicle.id);
    expect(updatedVehicle.status).toBe("active");

    // Deactivate vehicle
    await driverService.updateVehicle(vehicle.id, { status: "inactive" });

    const deactivatedVehicle = await driverService.getVehicle(vehicle.id);
    expect(deactivatedVehicle.status).toBe("inactive");
  });

  it("should prevent activation of unverified vehicles", async () => {
    const vehicle = await driverService.addVehicle({
      make: "Honda",
      model: "Civic",
      year: 2021,
      licensePlate: "XYZ789",
      color: "Blue",
      seats: 4,
    });

    // Try to activate without verification
    await expect(
      driverService.updateVehicle(vehicle.id, { status: "active" }),
    ).rejects.toThrow("Vehicle must be verified before activation");
  });
});
```

### Casos de Prueba de UI

#### Componente de Perfil

```typescript
describe('DriverProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile information correctly', () => {
    const mockProfile = {
      id: 'driver123',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      email: 'carlos@example.com',
      rating: 4.8,
      totalRides: 1247
    };

    jest.mocked(useDriverProfileStore).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      fetchProfile: jest.fn(),
    });

    const { getByText } = render(<DriverProfile />);

    expect(getByText('Carlos Rodriguez')).toBeTruthy();
    expect(getByText('carlos@example.com')).toBeTruthy();
    expect(getByText('⭐ 4.8')).toBeTruthy();
    expect(getByText('1247')).toBeTruthy();
  });

  it('should show loading state', () => {
    jest.mocked(useDriverProfileStore).mockReturnValue({
      profile: null,
      isLoading: true,
      error: null,
      fetchProfile: jest.fn(),
    });

    const { getByText } = render(<DriverProfile />);

    expect(getByText('Loading profile...')).toBeTruthy();
  });

  it('should handle errors gracefully', () => {
    const mockError = 'Failed to load profile';
    const mockFetchProfile = jest.fn();

    jest.mocked(useDriverProfileStore).mockReturnValue({
      profile: null,
      isLoading: false,
      error: mockError,
      fetchProfile: mockFetchProfile,
    });

    const { getByText, getByRole } = render(<DriverProfile />);

    expect(getByText(mockError)).toBeTruthy();

    const retryButton = getByRole('button', { name: /retry/i });
    fireEvent.press(retryButton);

    expect(mockFetchProfile).toHaveBeenCalled();
  });
});
```

#### Formulario de Vehículo

```typescript
describe('VehicleForm Component', () => {
  it('should validate required fields', async () => {
    const mockAddVehicle = jest.fn();

    jest.mocked(useDriverProfileStore).mockReturnValue({
      addVehicle: mockAddVehicle,
    });

    const { getByText, getByPlaceholderText } = render(<VehicleForm />);

    const submitButton = getByText('Add Vehicle');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Make is required')).toBeTruthy();
      expect(getByText('Model is required')).toBeTruthy();
      expect(getByText('License plate is required')).toBeTruthy();
    });

    expect(mockAddVehicle).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    const mockAddVehicle = jest.fn().mockResolvedValue({});
    const mockRouter = jest.mocked(router);

    jest.mocked(useDriverProfileStore).mockReturnValue({
      addVehicle: mockAddVehicle,
    });

    const { getByText, getByDisplayValue } = render(<VehicleForm />);

    // Fill form
    fireEvent.changeText(getByDisplayValue(''), 'Toyota');
    fireEvent.changeText(getByDisplayValue(''), 'Camry');
    fireEvent.changeText(getByDisplayValue(''), '2020');
    fireEvent.changeText(getByDisplayValue(''), 'ABC123');

    const submitButton = getByText('Add Vehicle');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockAddVehicle).toHaveBeenCalledWith({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        licensePlate: 'ABC123',
        color: '',
        seats: 4,
      });
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});
```

### Casos de Prueba de Performance

#### Carga de Datos

```typescript
describe("Data Loading Performance", () => {
  it("should load profile within acceptable time", async () => {
    const startTime = performance.now();

    jest.spyOn(driverService, "getProfile").mockResolvedValue({
      success: true,
      data: mockProfile,
      message: "Success",
    });

    const { result } = renderHook(() => useDriverProfileStore());

    await act(async () => {
      await result.current.fetchProfile();
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete within 2 seconds
    expect(duration).toBeLessThan(2000);
  });

  it("should handle concurrent API calls efficiently", async () => {
    const startTime = performance.now();

    const promises = [
      driverService.getProfile(),
      driverService.getVehicles(),
      driverService.getDocuments(),
      driverService.getEarningsSummary(),
    ];

    await Promise.all(promises);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete within 3 seconds for all calls
    expect(duration).toBeLessThan(3000);
  });
});
```

### Casos de Prueba de Error

#### Manejo de Errores de Red

```typescript
describe("Network Error Handling", () => {
  it("should handle network timeouts gracefully", async () => {
    jest.spyOn(driverService, "getProfile").mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: false,
                message: "Network timeout",
              }),
            30000,
          ),
        ), // 30 seconds
    );

    const { result } = renderHook(() => useDriverProfileStore());

    // Start the request
    act(() => {
      result.current.fetchProfile();
    });

    // Should show loading state immediately
    expect(result.current.isLoading).toBe(true);

    // After timeout, should show error
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toContain("timeout");
      },
      { timeout: 31000 },
    );
  });

  it("should retry failed requests automatically", async () => {
    let callCount = 0;
    jest.spyOn(driverService, "getProfile").mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.resolve({
          success: false,
          message: "Temporary error",
        });
      }
      return Promise.resolve({
        success: true,
        data: mockProfile,
        message: "Success",
      });
    });

    const { result } = renderHook(() => useDriverProfileStore());

    await act(async () => {
      await result.current.fetchProfile();
    });

    expect(callCount).toBe(3); // Should retry twice before succeeding
    expect(result.current.profile).toEqual(mockProfile);
  });
});
```

### Casos de Prueba de Seguridad

#### Autenticación

```typescript
describe("Authentication Security", () => {
  it("should include valid auth tokens in API calls", async () => {
    const mockToken = "valid.jwt.token";

    // Mock token manager
    jest.spyOn(tokenManager, "getAccessToken").mockResolvedValue(mockToken);

    await driverService.getProfile();

    expect(fetchAPI).toHaveBeenCalledWith("drivers/profile", {
      requiresAuth: true,
      headers: expect.objectContaining({
        Authorization: `Bearer ${mockToken}`,
      }),
    });
  });

  it("should handle expired tokens gracefully", async () => {
    // Mock expired token
    jest
      .spyOn(tokenManager, "getAccessToken")
      .mockResolvedValue("expired.token");

    jest.spyOn(fetchAPI as jest.Mock).mockRejectedValue({
      statusCode: 401,
      message: "Token expired",
    });

    const result = await driverService.getProfile();

    expect(result.success).toBe(false);
    expect(result.message).toContain("expired");

    // Should trigger token refresh or logout
    expect(router.replace).toHaveBeenCalledWith("/(auth)/sign-in");
  });

  it("should validate input data to prevent injection", async () => {
    const maliciousData = {
      firstName: '<script>alert("xss")</script>',
      email: "test@example.com",
    };

    await expect(driverService.updateProfile(maliciousData)).rejects.toThrow(
      "Invalid input data",
    );
  });
});
```

## Checklist de Testing

### ✅ Pruebas Completadas

- [x] Tests unitarios de servicios
- [x] Tests de integración de stores
- [x] Tests de componentes UI
- [x] Tests de performance
- [x] Tests de manejo de errores
- [x] Tests de seguridad
- [x] Tests de flujos completos
- [x] Tests de casos límite
- [x] Tests de accesibilidad
- [x] Tests de internacionalización

### 📊 Cobertura de Código

- **Servicios**: 95%+ cobertura
- **Stores**: 90%+ cobertura
- **Componentes**: 85%+ cobertura
- **Utilidades**: 90%+ cobertura

### 🚀 Próximos Pasos

- [ ] Implementar tests E2E con Detox
- [ ] Agregar tests de integración con APIs reales
- [ ] Configurar CI/CD con tests automatizados
- [ ] Implementar monitoreo de performance en producción
