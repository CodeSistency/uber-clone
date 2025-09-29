# Frontend Integration Guide - Driver APIs

Esta guía explica cómo integrar las APIs de drivers en el frontend de React Native.

## Arquitectura de Servicios

### Patrón de Servicio Singleton

Todos los servicios siguen el patrón singleton para mantener consistencia:

```typescript
// app/services/driverService.ts
export class DriverService {
  private static instance: DriverService;

  static getInstance(): DriverService {
    if (!DriverService.instance) {
      DriverService.instance = new DriverService();
    }
    return DriverService.instance;
  }

  async getProfile(): Promise<ApiResponse<DriverProfile>> {
    // Implementation
  }
}

// Uso
const driverService = DriverService.getInstance();
```

### Cliente HTTP Base

Usamos `fetchAPI` como cliente HTTP base:

```typescript
// lib/fetch.ts
export const fetchAPI = async (
  endpoint: string,
  options?: RequestInit
): Promise<any> => {
  const fullUrl = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}/${endpoint}`;

  const headers = await getAuthHeaders(options);

  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
```

## Zustand Stores

### Driver Profile Store

```typescript
// store/driverProfile/driverProfile.ts
interface DriverProfileState {
  profile: DriverProfile | null;
  vehicles: Vehicle[];
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<DriverProfile>) => Promise<void>;
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicleData: CreateVehicleRequest) => Promise<Vehicle>;
  updateVehicle: (id: string, updates: UpdateVehicleRequest) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (type: string, file: any, name?: string) => Promise<Document>;
}

export const useDriverProfileStore = create<DriverProfileState>((set, get) => ({
  // Implementation
}));
```

### Earnings Store

```typescript
// store/driverEarnings/driverEarnings.ts
interface DriverEarningsState {
  earningsSummary: EarningsSummary | null;
  tripHistory: TripEarning[];
  promotions: Promotion[];
  challenges: Challenge[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEarningsSummary: () => Promise<void>;
  fetchTripHistory: () => Promise<void>;
  fetchPromotions: () => Promise<void>;
  fetchChallenges: () => Promise<void>;
}

export const useDriverEarningsStore = create<DriverEarningsState>((set, get) => ({
  // Implementation
}));
```

## Componentes React

### Patrón de Componentes

```typescript
// Componente base con loading y error states
const DriverProfile = () => {
  const {
    profile,
    vehicles,
    documents,
    isLoading,
    error,
    fetchProfile,
    fetchVehicles,
    fetchDocuments
  } = useDriverProfileStore();

  const { showError, showSuccess } = useUI();

  useEffect(() => {
    // Fetch data on mount
    fetchProfile();
    fetchVehicles();
    fetchDocuments();
  }, [fetchProfile, fetchVehicles, fetchDocuments]);

  useEffect(() => {
    if (error) {
      showError("Error", error);
    }
  }, [error, showError]);

  if (isLoading && !profile) {
    return <LoadingSpinner />;
  }

  if (error && !profile) {
    return <ErrorFallback onRetry={fetchProfile} />;
  }

  return (
    <ScrollView>
      {/* Profile Content */}
    </ScrollView>
  );
};
```

### Manejo de Estados Asíncronos

```typescript
const handleUpdateProfile = async (updates: Partial<DriverProfile>) => {
  const { updateProfile, setError } = useDriverProfileStore.getState();

  try {
    await updateProfile(updates);
    showSuccess("Profile Updated", "Your profile has been updated successfully");
  } catch (error) {
    console.error('Profile update failed:', error);
    setError(error.message);
  }
};
```

### Formularios con Validación

```typescript
import { useForm, Controller } from 'react-hook-form';

const VehicleForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<VehicleFormData>();
  const { addVehicle } = useDriverProfileStore();

  const onSubmit = async (data: VehicleFormData) => {
    try {
      await addVehicle(data);
      showSuccess("Vehicle Added", "Your vehicle has been added successfully");
      router.back();
    } catch (error) {
      showError("Error", "Failed to add vehicle");
    }
  };

  return (
    <View>
      <Controller
        control={control}
        rules={{ required: "Make is required" }}
        render={({ field: { onChange, value } }) => (
          <InputField
            label="Make"
            value={value}
            onChangeText={onChange}
            error={errors.make?.message}
          />
        )}
        name="make"
      />

      <Button
        title="Add Vehicle"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};
```

## Hooks Personalizados

### Hook de Navegación Contextual

```typescript
// hooks/useDriverNavigation.ts
export const useDriverNavigation = () => {
  const { hasActiveRide, currentServiceType } = useMapFlowStore();

  const navigateToVehicles = useCallback(() => {
    if (hasActiveRide) {
      showError(
        'Action Not Available',
        `You cannot access vehicle management while on an active ${currentServiceType} service.`
      );
      return;
    }

    router.push('/(driver)/vehicles');
  }, [hasActiveRide, currentServiceType]);

  return {
    hasActiveRide,
    currentServiceType,
    navigateToVehicles,
    navigateToEarnings: () => router.push('/(driver)/earnings'),
    // ... other navigation methods
  };
};
```

### Hook de Conectividad

```typescript
// hooks/useConnectivity.ts
export const useConnectivity = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<'wifi' | 'cellular' | 'none'>('wifi');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type as any);
    });

    return unsubscribe;
  }, []);

  return { isConnected, connectionType };
};
```

## Gestión de Estado Global

### Integración con Zustand

```typescript
// store/index.ts
export * from './driverProfile';
export * from './driverEarnings';
export * from './user';
export * from './location';
export * from './mapFlow';
```

### Patrón de Selectores

```typescript
// ❌ Mal - Extrae todo el estado
const { profile, vehicles, documents, isLoading, error } = useDriverProfileStore();

// ✅ Bien - Usa selectores específicos
const profile = useDriverProfileStore((state) => state.profile);
const isLoading = useDriverProfileStore((state) => state.isLoading);
const vehicles = useDriverProfileStore((state) => state.vehicles);
```

## Manejo de Errores

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Driver module error:', error, errorInfo);
    // Report to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          title="Something went wrong"
          message="Please restart the app"
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

### UI para Estados de Error

```typescript
const ErrorFallback = ({ title, message, onRetry }) => (
  <View className="flex-1 justify-center items-center p-6">
    <Text className="text-xl font-JakartaBold mb-4 text-center">
      {title}
    </Text>
    <Text className="text-secondary-600 text-center mb-6">
      {message}
    </Text>
    <Button title="Retry" onPress={onRetry} />
  </View>
);
```

## Optimizaciones de Performance

### Memoización

```typescript
const VehicleCard = memo<VehicleCardProps>(({ vehicle, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{vehicle.make} {vehicle.model}</Text>
      <Text>{vehicle.licensePlate}</Text>
    </TouchableOpacity>
  );
});
```

### Lazy Loading

```typescript
const LazyVehicleForm = lazy(() => import('../screens/VehicleForm'));

const VehiclesScreen = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyVehicleForm />
  </Suspense>
);
```

### Virtualización de Listas

```typescript
<FlatList
  data={vehicles}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <VehicleCard vehicle={item} />}
  initialNumToRender={10}
  maxToRenderPerBatch={5}
  windowSize={10}
  getItemLayout={(data, index) => ({
    length: 100,
    offset: 100 * index,
    index
  })}
/>
```

## Testing

### Testing de Servicios

```typescript
// __tests__/services/driverService.test.ts
describe('DriverService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch profile successfully', async () => {
    const mockResponse = { /* mock data */ };
    (fetchAPI as jest.Mock).mockResolvedValue(mockResponse);

    const result = await driverService.getProfile();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    (fetchAPI as jest.Mock).mockRejectedValue(new Error('API Error'));

    const result = await driverService.getProfile();

    expect(result.success).toBe(false);
    expect(result.message).toContain('API Error');
  });
});
```

### Testing de Stores

```typescript
// __tests__/stores/driverProfileStore.test.ts
describe('DriverProfileStore', () => {
  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useDriverProfileStore());

    expect(result.current.profile).toBeNull();
    expect(result.current.vehicles).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch profile successfully', async () => {
    const mockProfile = { /* mock profile */ };
    driverService.getProfile.mockResolvedValue({
      success: true,
      data: mockProfile
    });

    const { result } = renderHook(() => useDriverProfileStore());

    await act(async () => {
      await result.current.fetchProfile();
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Testing de Componentes

```typescript
// __tests__/components/DriverProfile.test.tsx
describe('DriverProfile', () => {
  it('should render profile data', () => {
    const mockProfile = { /* mock profile */ };

    jest.mocked(useDriverProfileStore).mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      error: null,
      // ... other methods
    });

    const { getByText } = render(<DriverProfile />);

    expect(getByText(mockProfile.firstName)).toBeTruthy();
    expect(getByText(mockProfile.email)).toBeTruthy();
  });

  it('should show loading state', () => {
    jest.mocked(useDriverProfileStore).mockReturnValue({
      profile: null,
      isLoading: true,
      error: null,
      // ... other methods
    });

    const { getByText } = render(<DriverProfile />);

    expect(getByText('Loading...')).toBeTruthy();
  });
});
```

## Configuración de Ambiente

### Variables de Entorno

```typescript
// app.json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.uber-clone.com",
      "wsUrl": "wss://ws.uber-clone.com",
      "environment": "development"
    }
  }
}
```

### Acceso a Variables

```typescript
// lib/config.ts
export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  wsUrl: process.env.EXPO_PUBLIC_WS_URL,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT,
};
```

## Logging y Debugging

### Logging Consistente

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[DriverModule] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[DriverModule] ${message}`, error);
  },
  debug: (message: string, data?: any) => {
    if (__DEV__) {
      console.debug(`[DriverModule] ${message}`, data);
    }
  }
};
```

### Uso en Servicios

```typescript
// En driverService.ts
export class DriverService {
  async getProfile(): Promise<ApiResponse<DriverProfile>> {
    try {
      logger.info('Fetching driver profile');

      const response = await fetchAPI('drivers/profile');

      logger.info('Profile fetched successfully', { profileId: response.id });

      return {
        success: true,
        data: response,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to fetch profile', error);

      return {
        success: false,
        message: error.message || 'Failed to fetch profile'
      };
    }
  }
}
```

## Migración y Versionado

### Versionado de API

```typescript
// lib/apiVersion.ts
export const API_VERSION = 'v1';

export const getApiUrl = (endpoint: string) => {
  return `/${API_VERSION}/${endpoint}`;
};
```

### Migración de Datos

```typescript
// Cuando cambian las APIs, manejar migración
const migrateDriverData = (oldData: any): DriverProfile => {
  // Transform old format to new format
  return {
    ...oldData,
    // Apply transformations
  };
};
```

## Checklist de Integración

### ✅ Requisitos Completados
- [x] Servicios API implementados
- [x] Stores Zustand configurados
- [x] Componentes React creados
- [x] Estados de carga y error manejados
- [x] Navegación contextual implementada
- [x] Tests unitarios e integración
- [x] Documentación completa
- [x] Optimizaciones de performance
- [x] Manejo de errores robusto
- [x] Logging y debugging
- [x] Configuración de ambiente

### 🚀 Próximos Pasos
- [ ] Monitoreo de performance en producción
- [ ] Analytics y métricas de uso
- [ ] A/B testing de nuevas funcionalidades
- [ ] Internacionalización (i18n)
- [ ] Accesibilidad (a11y)
