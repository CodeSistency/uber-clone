<!-- 2a74ff8a-656b-462b-8760-faa7f2d0a9e6 6533a88d-c481-49b8-874d-9cf132129f75 -->
# Plan Completo de Optimización: Stores y Hooks Zustand

## PARTE 1: ANÁLISIS EXHAUSTIVO DE STORES

### Stores Actuales Identificados (43 archivos)

#### 🔴 GRUPO 1: CONDUCTOR - DUPLICACIÓN CRÍTICA (8 stores)

```
store/driver/driver.ts               → Solo lista de conductores disponibles (para pasajero)
store/driverState/driverState.ts     → Estado online/offline + ubicación + stats
store/driverProfile/driverProfile.ts → Perfil + vehículos + documentos (570 líneas)
store/driverConfig/driverConfig.ts   → Settings + navigation + sounds + preferences (850 líneas)
store/driverRole/driverRole.ts       → Rol + migración usuario → conductor (513 líneas)
store/driverOnboarding/driverOnboarding.ts → Onboarding conductor
store/driverEarnings/driverEarnings.ts → Ganancias específicas conductor (284 líneas)
store/earnings/earnings.ts           → Ganancias generales duplicado (717 líneas)
```

**USOS ENCONTRADOS:**

- `useDriverRoleStore`: 2 usos (app/(driver)/_layout.tsx, lib/driverRequestHandler.ts)
- `useDriverProfileStore`: 3 usos (hooks/useDriverNavigation.ts, app/(driver)/vehicles/add.tsx, app/(driver)/profile/edit.tsx)
- `useDriverStateStore`: 0 usos directos encontrados ⚠️
- `useDriverConfigStore`: 0 usos directos encontrados ⚠️
- `useDriverEarningsStore`: 1 uso (app/(driver)/earnings/index.tsx)
- `useEarningsStore`: 1 uso (store/earnings/earnings.ts auto-referencia)

**PROBLEMA CRÍTICO:** 8 stores con ~3,000 líneas de código duplicado manejando mismo dominio

#### ✅ GRUPO 2: CORE - BIEN ESTRUCTURADOS (6 stores)

```
store/user/user.ts          → ✅ YA OPTIMIZADO con 14 selectores
store/location/location.ts  → ✅ YA OPTIMIZADO con 10 selectores  
store/realtime/realtime.ts  → Conexión WS + rides activos (necesita selectores)
store/rides/rides.ts        → Historial de rides
store/chat/chat.ts          → Chat messages
store/payment/payment.ts    → Pagos y métodos
```

**USOS ENCONTRADOS:**

- `useUserStore`: 156 usos en 50+ archivos ✅ (bien distribuido)
- `useLocationStore`: 50+ usos con selectores optimizados ✅
- `useRealtimeStore`: 20+ usos (necesita selectores)

#### ⚠️ GRUPO 3: MÓDULOS - REQUIEREN CONSOLIDACIÓN (9 stores)

```
store/onboarding/onboarding.ts       → Onboarding general
store/mapFlow/mapFlow.ts             → MapFlow + 5 slices (config, flow, nav, ride, search)
store/profile/profileStore.ts        → Perfil de usuario (separado de user)
store/wallet/wallet.ts               → Billetera
store/module/module.ts               → Cambio de módulo
store/vehicles/vehicles.ts           → Vehículos (para pasajero)
store/vehicleTiers/vehicleTiers.ts   → Tipos de vehículo
```

#### ⚠️ GRUPO 4: UI Y ESPECIALIZADOS (10 stores)

```
store/ui/ui.ts                       → ✅ Sistema UI avanzado (mantener)
store/notification/notification.ts   → Notificaciones
store/splash/splash.ts               → Splash screens
store/safety/safety.ts               → Seguridad
store/emergency/emergency.ts         → Emergencias
store/ratings/ratings.ts             → Ratings
store/dev/dev.ts                     → Dev/debug
store/expo-notifications/expoNotificationStore.ts → Expo notifications
```

**TOTAL REAL:** 43 archivos de stores + 5 slices de mapFlow = **48 unidades de estado**

## PARTE 2: ANÁLISIS EXHAUSTIVO DE HOOKS

### Hooks Actuales (35 hooks)

#### 🔴 GRUPO A: HOOKS CON DEPENDENCIAS DE STORES - REQUIEREN ACTUALIZACIÓN (15 hooks)

1. **`useMapFlowActions.ts`** (73 líneas)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Depende de: `useMapFlowStore`, `useLocationStore`, `useRealtimeStore`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Propósito: Pre-captura acciones para evitar re-creación
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **PROBLEMA:** Wrapper innecesario, los stores ya tienen las acciones
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **SOLUCIÓN:** Eliminar, usar directamente acciones del store

2. **`useMapFlowSelectors.ts`** (226 líneas)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Depende de: `useMapFlowStore` + todos los slices
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **PROBLEMA:** Crea 12 selectores que duplican los ya existentes en slices
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **USOS:** 288 referencias en 216 archivos
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **SOLUCIÓN:** Consolidar con selectores de slices, eliminar duplicados

3. **`useAsyncDriverSearch.ts`** (555 líneas)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Depende de: `useMapFlowStore`, `useSearchCache`, `useUI`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Propósito: Búsqueda asíncrona de conductores con polling inteligente
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **STATUS:** ✅ Hook complejo y necesario, solo actualizar imports

4. **`useDriverNavigation.ts`** (198 líneas)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Depende de: `useDriverProfileStore`, `useMapFlowStore`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **PROBLEMA:** Usa `useDriverProfileStore` que será consolidado
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **USOS:** 1 uso (app/(driver)/vehicles/add.tsx)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **SOLUCIÓN:** Actualizar a usar nuevo `useDriverStore`

5. **`useMapCenter.ts`** (151 líneas)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Sin dependencias de stores directas ✅
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Propósito: Calcular centro de mapa considerando bottom sheets
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **STATUS:** ✅ Mantener sin cambios

6. **`useMapNavigation.ts`**, **`useMapOrientation.ts`**, **`useAutoNavigation.ts`**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Dependen de stores de ubicación
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **STATUS:** ✅ Solo verificar imports después de consolidación

7. **`useDriverDrawer.ts`**, **`useCustomerDrawer.ts`**

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Hooks para configuración de drawers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **STATUS:** ✅ Mantener

#### ⚠️ GRUPO B: HOOKS DE MAPFLOW - ALTAMENTE REDUNDANTES (18 hooks)

**PROBLEMA CRÍTICO:** 18 hooks para manejar diferentes aspectos del MapFlow

```
useMapFlow.ts                    → Hook base
useMapFlowActions.ts            → 🔴 DUPLICADO - Ya están en store
useMapFlowSelectors.ts          → 🔴 DUPLICADO - Ya están en slices  
useMapFlowAnimatedValues.ts     → Valores animados
useMapFlowAnimationConfig.ts    → Config de animaciones
useMapFlowBackground.ts         → Background config
useMapFlowBottomSheet.ts        → Bottom sheet config
useMapFlowCriticalConfig.ts     → Config crítica
useMapFlowFooter.ts             → Footer config
useMapFlowHeights.ts            → Cálculo de alturas
useMapFlowPagerWithSteps.ts     → Pager con steps
useMapFlowScrollControl.ts      → Control de scroll
useMapFlowSnapPoints.ts         → Snap points para bottom sheet
useMapFlowTransitions.ts        → Transiciones
```

**SOLUCIÓN:** Consolidar en 3-4 hooks principales:

- `useMapFlow` (mantener como hook principal)
- `useMapFlowBottomSheet` (consolidar: bottomSheet + heights + snapPoints)
- `useMapFlowAnimations` (consolidar: animatedValues + animationConfig + transitions)
- `useMapFlowConfig` (consolidar: config + criticalConfig + background + footer)

#### ✅ GRUPO C: HOOKS ESPECIALIZADOS - MANTENER (12 hooks)

```
useMapAnimations.ts          → Animaciones de mapa
useMapMarkers.ts            → Gestión de marcadores
useMapRoutes.ts             → Cálculo de rutas
useMapClustering.ts         → Clustering de marcadores
useMapController.ts         → Control de mapa
useAlternativeRoutes.ts     → Rutas alternativas
useRoutePrediction.ts       → Predicción de rutas
useSearchCache.ts           → Caché de búsquedas
useOfflineMaps.ts           → Mapas offline
useConnectivity.ts          → Estado de conectividad
usePerformanceMonitor.ts    → Monitoreo de performance
useWebSocketDebug.ts        → Debug de WebSocket
```

**STATUS:** ✅ Todos son hooks especializados necesarios, mantener

## PARTE 3: ESTRATEGIA DE CONSOLIDACIÓN

### FASE 1: Consolidar Stores de Conductor → `useDriverStore`

#### Store Consolidado Final

```typescript
// store/driver.ts (NUEVO - ~800 líneas optimizadas)
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
  
  // ===== VEHÍCULOS =====
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  
  // ===== DOCUMENTOS =====
  documents: Document[];
  documentStatus: {
    allApproved: boolean;
    pendingCount: number;
    expiringSoon: Document[];
  };
  
  // ===== GANANCIAS CONSOLIDADAS =====
  earnings: {
    today: { total: number; trips: number; avg: number };
    week: { total: number; trips: number; avg: number };
    month: { total: number; trips: number; avg: number };
    total: { total: number; trips: number; avg: number };
  };
  tripHistory: TripEarning[];
  promotions: Promotion[];
  challenges: Challenge[];
  
  // ===== CONFIGURACIÓN =====
  settings: {
    app: AppSettings;
    navigation: NavigationSettings;
    sounds: SoundSettings;
    ridePreferences: RidePreferences;
  };
  
  // ===== ONBOARDING =====
  onboarding: {
    isCompleted: boolean;
    currentStep: number;
    progress: number;
  };
  
  // ===== ESTADOS DE CARGA =====
  loading: {
    profile: boolean;
    vehicles: boolean;
    documents: boolean;
    earnings: boolean;
    settings: boolean;
  };
  error: string | null;
}
```

#### Selectores Optimizados (25 selectores)

```typescript
// Selectores básicos
export const useDriverProfile = () => useDriverStore(s => s.profile);
export const useDriverRole = () => useDriverStore(s => s.role);
export const useIsDriver = () => useDriverStore(s => s.isDriver);
export const useDriverStatus = () => useDriverStore(s => s.status);
export const useDriverAvailability = () => useDriverStore(s => s.isAvailable);
export const useDriverLocation = () => useDriverStore(s => s.currentLocation);

// Selectores de vehículos
export const useDriverVehicles = () => useDriverStore(s => s.vehicles);
export const useActiveVehicle = () => useDriverStore(s => s.activeVehicle);
export const useHasVehicles = () => useDriverStore(s => s.vehicles.length > 0);

// Selectores de documentos
export const useDriverDocuments = () => useDriverStore(s => s.documents);
export const useDocumentStatus = () => useDriverStore(s => s.documentStatus);
export const useAllDocumentsApproved = () => useDriverStore(s => s.documentStatus.allApproved);

// Selectores de ganancias
export const useDriverEarnings = () => useDriverStore(s => s.earnings);
export const useTodayEarnings = () => useDriverStore(s => s.earnings.today);
export const useWeekEarnings = () => useDriverStore(s => s.earnings.week);
export const useTripHistory = () => useDriverStore(s => s.tripHistory);
export const usePromotions = () => useDriverStore(s => s.promotions);
export const useChallenges = () => useDriverStore(s => s.challenges);

// Selectores de configuración
export const useDriverSettings = () => useDriverStore(s => s.settings);
export const useAppSettings = () => useDriverStore(s => s.settings.app);
export const useNavigationSettings = () => useDriverStore(s => s.settings.navigation);
export const useSoundSettings = () => useDriverStore(s => s.settings.sounds);
export const useRidePreferences = () => useDriverStore(s => s.settings.ridePreferences);

// Selectores compuestos
export const useDriverBasicInfo = () => useDriverStore(s => ({
  profile: s.profile,
  status: s.status,
  isAvailable: s.isAvailable
}));

export const useDriverVerificationStatus = () => useDriverStore(s => ({
  verificationStatus: s.verificationStatus,
  documentsApproved: s.documentStatus.allApproved,
  pendingDocuments: s.documentStatus.pendingCount,
  expiringSoon: s.documentStatus.expiringSoon
}));
```

### FASE 2: Consolidar Stores Core

#### 2.1 `useRideStore` (NUEVO - Consolidar rides + tracking)

```typescript
interface RideStore {
  // Estado de rides
  activeRide: ExtendedRide | null;
  rideHistory: Ride[];
  pendingRequests: RideRequest[];  // Para conductores
  
  // Tracking
  isTracking: boolean;
  driverLocation: LocationData | null;
  estimatedArrival: Date | null;
  route: RouteCoordinates[];
  
  // Estados
  loading: { history: boolean; active: boolean };
  error: string | null;
}
```

**Selectores:**

```typescript
export const useActiveRide = () => useRideStore(s => s.activeRide);
export const useRideHistory = () => useRideStore(s => s.rideHistory);
export const useIsTracking = () => useRideStore(s => s.isTracking);
export const useDriverLocation = () => useRideStore(s => s.driverLocation);
```

#### 2.2 `useCommunicationStore` (NUEVO - Consolidar chat + notifications)

```typescript
interface CommunicationStore {
  // Chat
  activeChat: string | null;
  messages: ChatMessage[];
  unreadMessages: number;
  
  // Notificaciones
  notifications: NotificationData[];
  unreadNotifications: number;
  preferences: NotificationPreferences;
}
```

### FASE 3: Consolidar Hooks de MapFlow

#### Antes (18 hooks):

```
useMapFlow.ts
useMapFlowActions.ts (73 líneas) → 🔴 ELIMINAR
useMapFlowSelectors.ts (226 líneas) → 🔴 ELIMINAR (usar slices directamente)
useMapFlowAnimatedValues.ts
useMapFlowAnimationConfig.ts
useMapFlowBackground.ts
useMapFlowBottomSheet.ts
useMapFlowCriticalConfig.ts
useMapFlowFooter.ts
useMapFlowHeights.ts
useMapFlowPagerWithSteps.ts
useMapFlowScrollControl.ts
useMapFlowSnapPoints.ts
useMapFlowTransitions.ts
```

#### Después (4 hooks consolidados):

```typescript
// 1. hooks/useMapFlow.ts (MANTENER como principal)
export const useMapFlow = () => {
  const store = useMapFlowStore();
  return {
    step: store.step,
    role: store.role,
    service: store.service,
    start: store.start,
    next: store.next,
    back: store.back,
    stop: store.stop
  };
};

// 2. hooks/useMapFlowBottomSheet.ts (CONSOLIDADO)
// Consolida: bottomSheet + heights + snapPoints
export const useMapFlowBottomSheet = () => {
  const visible = useMapFlowStore(s => s.bottomSheetVisible);
  const minHeight = useMapFlowStore(s => s.bottomSheetMinHeight);
  const maxHeight = useMapFlowStore(s => s.bottomSheetMaxHeight);
  
  // Cálculo de heights optimizado
  const heights = useMemo(() => calculateHeights(minHeight, maxHeight), [minHeight, maxHeight]);
  
  // Snap points optimizados
  const snapPoints = useMemo(() => calculateSnapPoints(heights), [heights]);
  
  return { visible, minHeight, maxHeight, heights, snapPoints };
};

// 3. hooks/useMapFlowAnimations.ts (CONSOLIDADO)
// Consolida: animatedValues + animationConfig + transitions
export const useMapFlowAnimations = () => {
  const transitionType = useMapFlowStore(s => s.transitionType);
  const transitionDuration = useMapFlowStore(s => s.transitionDuration);
  
  const animatedValues = useMapFlowAnimatedValues();
  const animationConfig = useMapFlowAnimationConfig(transitionType, transitionDuration);
  
  return { animatedValues, animationConfig, transitionType, transitionDuration };
};

// 4. hooks/useMapFlowConfig.ts (CONSOLIDADO)
// Consolida: config + criticalConfig + background + footer
export const useMapFlowConfig = () => {
  const mapInteraction = useMapFlowStore(s => s.mapInteraction);
  const backgroundConfig = useMapFlowBackground();
  const footerConfig = useMapFlowFooter();
  const criticalConfig = useMapFlowCriticalConfig();
  
  return { mapInteraction, backgroundConfig, footerConfig, criticalConfig };
};
```

## PARTE 4: PLAN DE MIGRACIÓN DETALLADO

### Archivos Afectados por Categoría

#### CATEGORÍA A: Stores de Conductor (59 archivos afectados)

```
STORES (8 archivos - DEPRECATED):
- store/driver/driver.ts
- store/driverState/driverState.ts
- store/driverProfile/driverProfile.ts
- store/driverConfig/driverConfig.ts
- store/driverRole/driverRole.ts
- store/driverOnboarding/driverOnboarding.ts
- store/driverEarnings/driverEarnings.ts
- store/earnings/earnings.ts

COMPONENTES (37 archivos en app/(driver)/*):
- app/(driver)/_layout.tsx
- app/(driver)/dashboard/index.tsx
- app/(driver)/profile/index.tsx
- app/(driver)/profile/edit.tsx
- app/(driver)/vehicles/*.tsx (4 archivos)
- app/(driver)/documents/*.tsx (4 archivos)
- app/(driver)/earnings/*.tsx (7 archivos)
- app/(driver)/emergency/*.tsx (6 archivos)
- app/(driver)/onboarding/*.tsx (7 archivos)
- app/(driver)/ratings/*.tsx
- app/(driver)/safety/*.tsx
- app/(driver)/settings/*.tsx

COMPONENTES (12 archivos en components/driver/*):
- components/driver/*.tsx (todos)

HOOKS (3 archivos):
- hooks/useDriverNavigation.ts
- hooks/useDriverDrawer.ts

SERVICIOS (8 archivos):
- app/services/driverService.ts
- app/services/driverLocationService.ts
- app/services/driverStateService.ts
- app/services/driverStatusService.ts
- app/services/earningsService.ts
- app/services/vehicleService.ts
- app/services/documentService.ts
```

#### CATEGORÍA B: Hooks de MapFlow (18 hooks afectados)

```
ELIMINAR COMPLETAMENTE (2 archivos):
- hooks/useMapFlowActions.ts (73 líneas)
- hooks/useMapFlowSelectors.ts (226 líneas)

CONSOLIDAR (12 hooks → 3 hooks):
Antes:
- hooks/useMapFlowAnimatedValues.ts
- hooks/useMapFlowAnimationConfig.ts
- hooks/useMapFlowBackground.ts
- hooks/useMapFlowBottomSheet.ts
- hooks/useMapFlowCriticalConfig.ts
- hooks/useMapFlowFooter.ts
- hooks/useMapFlowHeights.ts
- hooks/useMapFlowPagerWithSteps.ts
- hooks/useMapFlowScrollControl.ts
- hooks/useMapFlowSnapPoints.ts
- hooks/useMapFlowTransitions.ts

Después:
- hooks/useMapFlowBottomSheet.ts (CONSOLIDADO)
- hooks/useMapFlowAnimations.ts (CONSOLIDADO)
- hooks/useMapFlowConfig.ts (CONSOLIDADO)

COMPONENTES AFECTADOS (288 usos en 216 archivos):
- Todos los componentes en components/unified-flow/
- Todos los componentes en components/mapFlow/
- app/(customer)/unified-flow-demo.tsx
- app/(driver)/driver-unified-flow-demo.tsx
```

#### CATEGORÍA C: Stores Core (25+ archivos afectados)

```
CONSOLIDAR:
- store/rides/rides.ts + parte de store/realtime/realtime.ts → useRideStore
- store/chat/chat.ts + store/notification/notification.ts → useCommunicationStore
- store/vehicles/vehicles.ts + store/vehicleTiers/vehicleTiers.ts → useVehicleStore
```

### Timeline de Implementación (5 semanas)

#### SEMANA 1: Crear Nuevo DriverStore

**Días 1-2:** Crear estructura

- Crear `store/driver.ts` con interfaz consolidada
- Implementar estado inicial y acciones básicas
- Crear 25 selectores optimizados

**Días 3-4:** Migrar lógica

- Copiar lógica de `driverProfile` (vehículos + documentos)
- Copiar lógica de `driverState` (status + location)
- Copiar lógica de `driverEarnings` + `earnings`
- Copiar lógica de `driverConfig` (settings)
- Copiar lógica de `driverRole` (role management)

**Día 5:** Testing

- Escribir tests unitarios (>80% coverage)
- Tests de integración con servicios
- Validar todas las acciones

**ENTREGABLE:** `store/driver.ts` completo y testeado

#### SEMANA 2: Migrar Componentes de Driver

**Días 1-2:** Actualizar imports (37 archivos en app/(driver)/*)

```typescript
// ANTES
import { useDriverStateStore, useDriverProfileStore } from '@/store';
const { status } = useDriverStateStore();
const { profile } = useDriverProfileStore();

// DESPUÉS
import { useDriverStatus, useDriverProfile } from '@/store';
const status = useDriverStatus();
const profile = useDriverProfile();
```

**Días 3-4:** Actualizar hooks (3 archivos)

- Actualizar `hooks/useDriverNavigation.ts`
- Actualizar `hooks/useDriverDrawer.ts`
- Verificar `hooks/useAsyncDriverSearch.ts` (no requiere cambios)

**Día 5:** Testing de integración

- Probar todos los flujos de conductor
- Verificar navegación
- Validar actualización de estado

**ENTREGABLE:** Todos los componentes de driver migrados

#### SEMANA 3: Consolidar Hooks de MapFlow + Stores Core

**Días 1-2:** Eliminar hooks redundantes

- Eliminar `useMapFlowActions.ts`
- Eliminar `useMapFlowSelectors.ts`
- Crear 3 hooks consolidados (bottomSheet, animations, config)
- Actualizar 216 archivos que usan estos hooks

**Días 3-4:** Crear stores consolidados

- Crear `useRideStore` (consolidar rides + tracking)
- Crear `useCommunicationStore` (consolidar chat + notifications)
- Crear `useVehicleStore` (consolidar vehicles + tiers)

**Día 5:** Migrar componentes afectados

- Actualizar componentes que usan hooks eliminados
- Actualizar componentes que usan stores consolidados

**ENTREGABLE:** Hooks optimizados + nuevos stores

#### SEMANA 4: Deprecar y Limpiar

**Días 1-2:** Marcar stores antiguos como deprecated

```typescript
// store/driverState/driverState.ts
/**
 * @deprecated Use useDriverStore instead
 * This store will be removed in next major version
 */
export const useDriverStateStore = create<DriverStateStore>((set, get) => {
  console.warn('[DEPRECATED] useDriverStateStore is deprecated. Use useDriverStore instead.');
  // ... existing implementation
});
```

**Días 3-4:** Actualizar exports y documentación

- Actualizar `store/index.ts` con nuevos exports
- Añadir migration guide en docs
- Actualizar tipos consolidados en `types/driver.ts`

**Día 5:** Validación final

- Verificar que no quedan imports de stores antiguos
- Validar que todos los tests pasan
- Performance testing

**ENTREGABLE:** Stores deprecated con warnings

#### SEMANA 5: Remover Deprecated y Validación Final

**Días 1-2:** Remover stores antiguos

- Eliminar 8 stores de conductor deprecated
- Eliminar 2 hooks de MapFlow
- Limpiar imports no usados

**Días 3-4:** Testing completo

- Tests unitarios de todos los stores (80%+ coverage)
- Tests de integración de flujos completos
- Tests E2E de escenarios críticos
- Performance testing (re-renders, memory, bundle size)

**Día 5:** Documentación y métricas

- Actualizar documentación de arquitectura
- Generar reporte de métricas de éxito
- Code review final

**ENTREGABLE:** Sistema optimizado y documentado

## PARTE 5: MÉTRICAS DE ÉXITO

### Reducción de Complejidad

- **Stores:** 43 → 12-15 (65% reducción)
- **Hooks:** 35 → 22 (37% reducción)
- **Líneas de código stores:** ~8,000 → ~3,000 (62% reducción)
- **Imports por componente:** 5-8 → 1-2 (75% reducción)
- **Código duplicado:** Reducción del 60% en lógica de conductor

### Performance

- **Re-renders:** Reducción del 40% usando selectores optimizados
- **Bundle size:** Reducción del 15-20% en código de stores
- **Memory:** Reducción del 30% en memoria usada por stores
- **First render:** Mejora del 25% en tiempo de primer render

### Type Safety

- **Type errors:** 0 errores de tipo en producción
- **Validación:** 100% de inputs validados con Zod
- **Autocomplete:** 100% de funciones con JSDoc
- **Type coverage:** >95% del código con tipos explícitos

### Mantenibilidad

- **Tiempo de búsqueda:** Reducción del 50% para encontrar lógica
- **Onboarding:** Reducción del 40% en tiempo para entender stores
- **Bugs:** Reducción estimada del 30% en bugs relacionados con estado
- **Test coverage:** >80% en stores consolidados

## PARTE 6: MIGRACIÓN SEGURA

### Estrategia de Rollout Incremental

1. **Fase Alpha (Semana 1-2):** Crear nuevos stores sin afectar existentes
2. **Fase Beta (Semana 2-3):** Migrar componentes paulatinamente, mantener deprecated
3. **Fase Gamma (Semana 4):** Deprecar stores antiguos con warnings
4. **Fase Release (Semana 5):** Remover deprecated después de validación

### Rollback Plan

- Mantener stores deprecated funcionales durante 2 semanas
- Git tags en cada fase para rollback rápido
- Feature flags para activar/desactivar nuevos stores

### Validación en cada fase

- Tests automáticos deben pasar 100%
- Code review obligatorio
- Performance benchmarks deben mejorar o mantenerse

### To-dos

- [ ] Consolidar 68 stores en ~15 stores modulares principales
- [ ] Simplificar estructura de carpetas y rutas de navegación
- [ ] Implementar lazy loading, code splitting y optimización de mapas
- [ ] Crear componente MapViewWithBottomSheet unificado
- [ ] Implementar validación de entrada con Zod y sanitización de API keys
- [ ] Eliminar código y servicios duplicados (websocket, mapas, auth)
- [ ] Habilitar modo strict de TypeScript y corregir errores
- [ ] Aumentar cobertura de tests a 80%+ con tests de integración
- [ ] Configurar pipeline CI/CD con GitHub Actions
- [ ] Implementar soporte para screen readers y alto contraste
- [ ] Configurar sistema de internacionalización (español/inglés)
- [ ] Crear documentación JSDoc y README por módulo