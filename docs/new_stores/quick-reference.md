# Quick Reference - Stores Consolidados

## 🚀 Imports Rápidos

### Import Principal
```typescript
import { 
  // Driver Store
  useDriverStore,
  useDriverProfile,
  useDriverStatus,
  useDriverVehicles,
  useDriverEarnings,
  
  // User Store
  useUserStore,
  useUser,
  useUserProfile,
  useSavedAddresses,
  useVerificationStatus,
  
  // Vehicle Store
  useVehicleStore,
  useMyVehicles,
  useVehicleTiers,
  
  // MapFlow Store
  useMapFlowStore,
  useCurrentStep,
  useCurrentRole
} from "@/store";
```

---

## 🎯 Selectores por Categoría

### Driver Store Selectores

#### Básicos
```typescript
const profile = useDriverProfile();
const role = useDriverRole();
const isDriver = useIsDriver();
const status = useDriverStatus();
const availability = useDriverAvailability();
const location = useDriverLocation();
const verification = useDriverVerificationStatus();
```

#### Vehículos
```typescript
const vehicles = useDriverVehicles();
const activeVehicle = useActiveVehicle();
const selectedVehicle = useSelectedVehicle();
const hasVehicles = useHasVehicles();
const vehiclesCount = useVehiclesCount();
```

#### Documentos
```typescript
const documents = useDriverDocuments();
const documentStatus = useDocumentStatus();
const allApproved = useAllDocumentsApproved();
const pendingCount = usePendingDocumentsCount();
const expiringSoon = useExpiringDocuments();
```

#### Earnings
```typescript
const earnings = useDriverEarnings();
const todayEarnings = useTodayEarnings();
const weekEarnings = useWeekEarnings();
const monthEarnings = useMonthEarnings();
const totalEarnings = useTotalEarnings();
const tripHistory = useTripHistory();
const promotions = usePromotions();
const challenges = useChallenges();
```

#### Configuración
```typescript
const settings = useDriverSettings();
const appSettings = useAppSettings();
const navigationSettings = useNavigationSettings();
const soundSettings = useSoundSettings();
const ridePreferences = useRidePreferences();
```

#### Onboarding
```typescript
const onboarding = useOnboarding();
const progress = useOnboardingProgress();
const isCompleted = useIsOnboardingCompleted();
const currentStep = useCurrentOnboardingStep();
```

#### Driver Selection
```typescript
const drivers = useDrivers();
const selectedDriver = useSelectedDriver();
const driversCount = useDriversCount();
const hasDrivers = useHasDrivers();
```

### User Store Selectores

#### Autenticación
```typescript
const user = useUser();
const isAuthenticated = useIsAuthenticated();
const isLoading = useIsLoading();
const error = useUserError();
const basicInfo = useUserBasicInfo();
const fullName = useUserFullName();
const email = useUserEmail();
const phone = useUserPhone();
const avatar = useUserAvatar();
const role = useUserRole();
const mode = useUserMode();
```

#### Direcciones
```typescript
const addresses = useSavedAddresses();
const defaultAddress = useDefaultAddress();
const hasAddresses = useHasSavedAddresses();
const addressesCount = useAddressesCount();
const addressesData = useAddressesData();
```

#### Verificación
```typescript
const verification = useVerificationStatus();
const emailVerified = useIsEmailVerified();
const phoneVerified = useIsPhoneVerified();
const accountVerified = useIsAccountVerified();
const verificationDate = useVerificationDate();
const rejectionReason = useRejectionReason();
const verificationData = useVerificationData();
```

#### Preferencias
```typescript
const preferences = useUserPreferences();
const theme = useUserTheme();
const language = useUserLanguage();
const timezone = useUserTimezone();
const currency = useUserCurrency();
const notifications = useNotificationPreferences();
```

#### Métodos de Pago
```typescript
const paymentMethods = usePaymentMethods();
const defaultPaymentMethod = useDefaultPaymentMethod();
const hasPaymentMethods = useHasPaymentMethods();
const paymentMethodsCount = usePaymentMethodsCount();
const paymentData = usePaymentData();
```

#### Compuestos
```typescript
const userProfile = useUserProfile();
const userFullData = useUserFullData();
const profileFormData = useProfileFormData();
```

### Vehicle Store Selectores

#### Mis Vehículos
```typescript
const vehicles = useMyVehicles();
const selectedVehicle = useSelectedVehicle();
const activeVehicle = useActiveVehicle();
const hasVehicles = useHasVehicles();
const vehiclesCount = useMyVehiclesCount();
const vehiclesData = useMyVehiclesData();
```

#### Catálogo
```typescript
const tiers = useVehicleTiers();
const carTiers = useCarTiers();
const motorcycleTiers = useMotorcycleTiers();
const tiersLoading = useTiersLoading();
const lastFetch = useTiersLastFetch();
const catalogData = useCatalogData();
```

#### Carga y Error
```typescript
const loading = useVehiclesLoading();
const myVehiclesLoading = useMyVehiclesLoading();
const catalogLoading = useCatalogLoading();
const error = useVehicleError();
```

#### Compuesto
```typescript
const vehicleData = useVehicleData();
```

### MapFlow Store Selectores

#### Flujo Principal
```typescript
const step = useCurrentStep();
const role = useCurrentRole();
const service = useCurrentService();
const isActive = useIsFlowActive();
const flowState = useFlowState();
```

#### Ride Data
```typescript
const rideId = useRideId();
const isMatching = useIsMatching();
const matchedDriver = useMatchedDriver();
const origin = useConfirmedOrigin();
const destination = useConfirmedDestination();
const rideData = useRideData();
```

#### Bottom Sheet
```typescript
const isVisible = useBottomSheetVisible();
const height = useBottomSheetHeight();
const index = useBottomSheetIndex();
const snapPoints = useBottomSheetSnapPoints();
const bottomSheetState = useBottomSheetState();
```

#### Pager
```typescript
const pagerIndex = usePagerIndex();
const totalPages = usePagerTotalPages();
const canGoNext = useCanGoNext();
const canGoBack = useCanGoBack();
const pagerState = usePagerState();
```

#### Configuración
```typescript
const navConfig = useNavigationConfig();
const visualConfig = useVisualConfig();
const animationConfig = useAnimationConfig();
const validationConfig = useValidationConfig();
const mapFlowConfig = useMapFlowConfig();
```

---

## 🔧 Acciones Comunes

### Driver Store Acciones
```typescript
const {
  // Perfil
  setProfile,
  updateProfile,
  fetchProfile,
  
  // Vehículos
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  selectVehicle,
  activateVehicle,
  deactivateVehicle,
  
  // Documentos
  fetchDocuments,
  uploadDocument,
  updateDocumentStatus,
  
  // Earnings
  fetchEarningsSummary,
  fetchTripHistory,
  fetchPromotions,
  fetchChallenges,
  
  // Configuración
  updateAppSettings,
  updateNavigationSettings,
  updateSoundSettings,
  updateRidePreferences,
  
  // Onboarding
  updateOnboardingStep,
  nextOnboardingStep,
  completeOnboarding,
  resetOnboarding,
  
  // Estado
  setRole,
  updateStatus,
  setAvailability,
  updateLocation,
  
  // Driver Selection
  setDrivers,
  setSelectedDriver,
  clearSelectedDriver,
  
  // Utilidades
  setLoading,
  setError,
  clearError,
  reset
} = useDriverStore();
```

### User Store Acciones
```typescript
const {
  // Autenticación
  setUser,
  updateUser,
  setAuthenticated,
  clearUser,
  refreshUser,
  
  // Direcciones
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  
  // Verificación
  updateVerificationStatus,
  markEmailVerified,
  markPhoneVerified,
  markAccountVerified,
  
  // Preferencias
  updatePreferences,
  
  // Métodos de Pago
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  
  // Utilidades
  setLoading,
  setError,
  clearError
} = useUserStore();
```

### Vehicle Store Acciones
```typescript
const {
  // Mis Vehículos
  fetchMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  selectVehicle,
  activateVehicle,
  deactivateVehicle,
  
  // Catálogo
  fetchTiers,
  loadTiersFromStorage,
  forceRefreshTiers,
  clearTiers,
  
  // Utilidades
  getTierById,
  getTiersByType,
  
  // Utilidades
  setLoading,
  setError,
  clearError
} = useVehicleStore();
```

### MapFlow Store Acciones
```typescript
const {
  // Flujo
  start,
  stop,
  next,
  back,
  goToStep,
  reset,
  
  // Ride
  setRideId,
  setMatching,
  setMatchedDriver,
  setOrigin,
  setDestination,
  
  // Bottom Sheet
  showBottomSheet,
  hideBottomSheet,
  setBottomSheetHeight,
  setBottomSheetIndex,
  
  // Pager
  setPagerIndex,
  nextPage,
  prevPage,
  setTotalPages,
  
  // Configuración
  updateNavigationConfig,
  updateVisualConfig,
  updateAnimationConfig,
  updateValidationConfig
} = useMapFlowStore();
```

---

## 📝 Patrones Comunes

### Componente con Múltiples Selectores
```typescript
const MyComponent = () => {
  // Driver data
  const profile = useDriverProfile();
  const vehicles = useDriverVehicles();
  const earnings = useDriverEarnings();
  
  // User data
  const user = useUser();
  const addresses = useSavedAddresses();
  
  // Actions
  const { updateProfile, createVehicle } = useDriverStore();
  const { addAddress } = useUserStore();
  
  return (
    <View>
      {/* Component content */}
    </View>
  );
};
```

### Componente con Loading States
```typescript
const LoadingComponent = () => {
  const profile = useDriverProfile();
  const isLoading = useDriverStore(s => s.loading.profile);
  const { fetchProfile } = useDriverStore();
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <NoDataMessage />;
  
  return <ProfileContent profile={profile} />;
};
```

### Componente con Error Handling
```typescript
const ErrorHandlingComponent = () => {
  const data = useMyVehicles();
  const error = useVehicleError();
  const { setError, clearError } = useVehicleStore();
  
  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
        <Button title="Retry" onPress={clearError} />
      </View>
    );
  }
  
  return <VehiclesList vehicles={data} />;
};
```

---

## ⚡ Performance Tips

### Usar Selectores Específicos
```typescript
// ✅ Bueno - Solo re-renderiza cuando cambia profile
const profile = useDriverProfile();

// ❌ Malo - Re-renderiza cuando cambia cualquier cosa del store
const { profile } = useDriverStore();
```

### Memoizar Componentes
```typescript
const MyComponent = memo(() => {
  const data = useSpecificSelector();
  return <ExpensiveComponent data={data} />;
});
```

### Usar Selectores Compuestos
```typescript
// ✅ Bueno - Un solo selector para datos relacionados
const userProfile = useUserProfile();

// ❌ Malo - Múltiples selectores separados
const user = useUser();
const addresses = useSavedAddresses();
const verification = useVerificationStatus();
```

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0.0
