# useDriverStore - Store Consolidado de Conductor

## 📋 Resumen

El `useDriverStore` es el store principal para toda la funcionalidad relacionada con conductores. Consolida 8 stores individuales en una sola interfaz cohesiva.

## 🔄 Stores Consolidados

**Reemplaza:**
- `useDriverProfileStore`
- `useDriverStateStore` 
- `useDriverConfigStore`
- `useDriverRoleStore`
- `useDriverOnboardingStore`
- `useDriverEarningsStore`
- `useEarningsStore`
- `useDriverStore` (original)

## 🏗️ Estructura del Store

### Namespaces

```typescript
interface DriverStore {
  // ===== IDENTIDAD =====
  profile: DriverProfile | null;
  role: 'customer' | 'driver' | 'business';
  isDriver: boolean;
  
  // ===== ESTADO OPERACIONAL =====
  status: 'online' | 'offline' | 'busy';
  isAvailable: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  currentLocation: LocationData | null;
  
  // ===== DRIVER SELECTION (for ride booking) =====
  drivers: MarkerData[];
  selectedDriver: number | null;
  
  // ===== VEHÍCULOS =====
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  selectedVehicle: Vehicle | null;
  
  // ===== DOCUMENTOS =====
  documents: Document[];
  documentStatus: DocumentStatusInfo;
  
  // ===== EARNINGS =====
  earnings: EarningsData;
  tripHistory: ServiceTripEarning[];
  promotions: ServicePromotion[];
  challenges: ServiceChallenge[];
  
  // ===== CONFIGURACIÓN =====
  settings: DriverSettings;
  
  // ===== ONBOARDING =====
  onboarding: OnboardingState;
  
  // ===== ESTADOS DE CARGA =====
  loading: LoadingState;
  error: string | null;
}
```

## 🎯 Selectores Optimizados

### Selectores Básicos

```typescript
// Identidad
export const useDriverProfile = () => useDriverStore(s => s.profile);
export const useDriverRole = () => useDriverStore(s => s.role);
export const useIsDriver = () => useDriverStore(s => s.isDriver);

// Estado operacional
export const useDriverStatus = () => useDriverStore(s => s.status);
export const useDriverAvailability = () => useDriverStore(s => s.isAvailable);
export const useDriverLocation = () => useDriverStore(s => s.currentLocation);
export const useDriverVerificationStatus = () => useDriverStore(s => s.verificationStatus);

// Driver selection
export const useDrivers = () => useDriverStore(s => s.drivers);
export const useSelectedDriver = () => useDriverStore(s => s.selectedDriver);
export const useDriversCount = () => useDriverStore(s => s.drivers.length);
export const useHasDrivers = () => useDriverStore(s => s.drivers.length > 0);
```

### Selectores de Vehículos

```typescript
export const useDriverVehicles = () => useDriverStore(s => s.vehicles);
export const useActiveVehicle = () => useDriverStore(s => s.activeVehicle);
export const useSelectedVehicle = () => useDriverStore(s => s.selectedVehicle);
export const useHasVehicles = () => useDriverStore(s => s.vehicles.length > 0);
export const useVehiclesCount = () => useDriverStore(s => s.vehicles.length);
```

### Selectores de Documentos

```typescript
export const useDriverDocuments = () => useDriverStore(s => s.documents);
export const useDocumentStatus = () => useDriverStore(s => s.documentStatus);
export const useAllDocumentsApproved = () => useDriverStore(s => s.documentStatus.allApproved);
export const usePendingDocumentsCount = () => useDriverStore(s => s.documentStatus.pendingCount);
export const useExpiringDocuments = () => useDriverStore(s => s.documentStatus.expiringSoon);
```

### Selectores de Earnings

```typescript
export const useDriverEarnings = () => useDriverStore(s => s.earnings);
export const useTodayEarnings = () => useDriverStore(s => s.earnings.today);
export const useWeekEarnings = () => useDriverStore(s => s.earnings.week);
export const useMonthEarnings = () => useDriverStore(s => s.earnings.month);
export const useTotalEarnings = () => useDriverStore(s => s.earnings.total);
export const useTripHistory = () => useDriverStore(s => s.tripHistory);
export const usePromotions = () => useDriverStore(s => s.promotions);
export const useChallenges = () => useDriverStore(s => s.challenges);
```

### Selectores de Configuración

```typescript
export const useDriverSettings = () => useDriverStore(s => s.settings);
export const useAppSettings = () => useDriverStore(s => s.settings.app);
export const useNavigationSettings = () => useDriverStore(s => s.settings.navigation);
export const useSoundSettings = () => useDriverStore(s => s.settings.sounds);
export const useRidePreferences = () => useDriverStore(s => s.settings.ridePreferences);
```

### Selectores de Onboarding

```typescript
export const useOnboarding = () => useDriverStore(s => s.onboarding);
export const useOnboardingProgress = () => useDriverStore(s => s.onboarding.progress);
export const useIsOnboardingCompleted = () => useDriverStore(s => s.onboarding.isCompleted);
export const useCurrentOnboardingStep = () => useDriverStore(s => s.onboarding.currentStep);
```

## 🔧 Acciones Principales

### Gestión de Perfil

```typescript
const { setProfile, updateProfile, fetchProfile } = useDriverStore();

// Actualizar perfil
await updateProfile({
  firstName: "Juan",
  lastName: "Pérez",
  phone: "+1234567890"
});

// Obtener perfil desde API
await fetchProfile();
```

### Gestión de Vehículos

```typescript
const { 
  fetchVehicles, 
  addVehicle, 
  updateVehicle, 
  deleteVehicle,
  selectVehicle,
  activateVehicle 
} = useDriverStore();

// Agregar vehículo
await addVehicle({
  make: "Toyota",
  model: "Camry",
  year: 2020,
  color: "White",
  plateNumber: "ABC123"
});

// Activar vehículo
await activateVehicle(vehicleId);
```

### Gestión de Documentos

```typescript
const { 
  fetchDocuments, 
  uploadDocument, 
  updateDocumentStatus 
} = useDriverStore();

// Subir documento
await uploadDocument({
  driverId: "123",
  type: "license",
  file: fileObject,
  fileName: "license.pdf",
  description: "Driver's license"
});
```

### Gestión de Earnings

```typescript
const { 
  fetchEarningsSummary, 
  fetchTripHistory, 
  fetchPromotions, 
  fetchChallenges 
} = useDriverStore();

// Obtener resumen de ganancias
await fetchEarningsSummary();

// Obtener historial de viajes
await fetchTripHistory("week");
```

### Driver Selection (para booking)

```typescript
const { 
  setDrivers, 
  setSelectedDriver, 
  clearSelectedDriver 
} = useDriverStore();

// Establecer conductores disponibles
setDrivers(availableDrivers);

// Seleccionar conductor
setSelectedDriver(driverId);
```

## 📝 Ejemplos de Uso

### Componente de Dashboard

```typescript
import { 
  useDriverProfile, 
  useDriverEarnings, 
  useDriverVehicles,
  useDriverStatus 
} from "@/store";

const DriverDashboard = () => {
  const profile = useDriverProfile();
  const earnings = useDriverEarnings();
  const vehicles = useDriverVehicles();
  const status = useDriverStatus();

  return (
    <View>
      <Text>Welcome, {profile?.firstName}</Text>
      <Text>Status: {status}</Text>
      <Text>Vehicles: {vehicles.length}</Text>
      <Text>Today's Earnings: ${earnings.today}</Text>
    </View>
  );
};
```

### Componente de Earnings

```typescript
import { 
  useTodayEarnings, 
  useWeekEarnings, 
  useTripHistory,
  useDriverStore 
} from "@/store";

const EarningsComponent = () => {
  const todayEarnings = useTodayEarnings();
  const weekEarnings = useWeekEarnings();
  const tripHistory = useTripHistory();
  const { fetchEarningsSummary } = useDriverStore();

  useEffect(() => {
    fetchEarningsSummary();
  }, []);

  return (
    <View>
      <Text>Today: ${todayEarnings}</Text>
      <Text>This Week: ${weekEarnings}</Text>
      {/* Render trip history */}
    </View>
  );
};
```

## ⚠️ Migración desde Stores Antiguos

### Antes (Deprecado)

```typescript
// ❌ DEPRECADO - Múltiples imports
import { useDriverProfileStore } from "@/store/driverProfile";
import { useDriverStateStore } from "@/store/driverState";
import { useDriverConfigStore } from "@/store/driverConfig";
import { useDriverEarningsStore } from "@/store/driverEarnings";

const { profile } = useDriverProfileStore();
const { status } = useDriverStateStore();
const { settings } = useDriverConfigStore();
const { earnings } = useDriverEarningsStore();
```

### Después (Nuevo)

```typescript
// ✅ NUEVO - Un solo import
import { 
  useDriverProfile, 
  useDriverStatus, 
  useDriverSettings, 
  useDriverEarnings 
} from "@/store";

const profile = useDriverProfile();
const status = useDriverStatus();
const settings = useDriverSettings();
const earnings = useDriverEarnings();
```

## 🔍 Persistencia

El store incluye persistencia automática para:

- `profile` - Datos del perfil del conductor
- `vehicles` - Lista de vehículos
- `documents` - Documentos subidos
- `settings` - Configuraciones del conductor
- `onboarding` - Estado del onboarding

## 🧪 Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useDriverStore } from '@/store';

describe('useDriverStore', () => {
  it('should update profile correctly', () => {
    const { result } = renderHook(() => useDriverStore());
    
    act(() => {
      result.current.setProfile({
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez'
      });
    });
    
    expect(result.current.profile?.firstName).toBe('Juan');
  });
});
```

## 📊 Performance

- **Selectores optimizados**: Solo re-renderiza cuando cambia la propiedad específica
- **Persistencia selectiva**: Solo persiste datos necesarios
- **Lazy loading**: Carga datos solo cuando se necesitan
- **Memoización**: Evita cálculos innecesarios

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0.0
