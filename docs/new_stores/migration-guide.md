# Guía de Migración - Stores Consolidados

## 📋 Resumen

Esta guía proporciona instrucciones paso a paso para migrar desde los stores deprecados a los nuevos stores consolidados.

## 🎯 Objetivos de la Migración

- **Simplificar imports**: De múltiples stores a uno solo
- **Mejorar performance**: Usar selectores optimizados
- **Reducir complejidad**: Eliminar duplicación de código
- **Mantener funcionalidad**: Preservar toda la funcionalidad existente

---

## 🔄 Mapeo de Stores

### Driver Stores → useDriverStore

| Store Deprecado | Nuevo Selector | Acción |
|-----------------|----------------|---------|
| `useDriverProfileStore` | `useDriverProfile()` | `useDriverStore().setProfile()` |
| `useDriverStateStore` | `useDriverStatus()` | `useDriverStore().updateStatus()` |
| `useDriverConfigStore` | `useDriverSettings()` | `useDriverStore().updateAppSettings()` |
| `useDriverRoleStore` | `useDriverRole()` | `useDriverStore().setRole()` |
| `useDriverOnboardingStore` | `useOnboarding()` | `useDriverStore().nextOnboardingStep()` |
| `useDriverEarningsStore` | `useDriverEarnings()` | `useDriverStore().fetchEarningsSummary()` |
| `useEarningsStore` | `useDriverEarnings()` | `useDriverStore().fetchEarningsSummary()` |

### Profile Store → useUserStore

| Store Deprecado | Nuevo Selector | Acción |
|-----------------|----------------|---------|
| `useProfileStore` | `useUserProfile()` | `useUserStore().updateProfile()` |
| `useProfileStore.savedAddresses` | `useSavedAddresses()` | `useUserStore().addAddress()` |
| `useProfileStore.verification` | `useVerificationStatus()` | `useUserStore().updateVerificationStatus()` |
| `useProfileStore.preferences` | `useUserPreferences()` | `useUserStore().updatePreferences()` |
| `useProfileStore.paymentMethods` | `usePaymentMethods()` | `useUserStore().addPaymentMethod()` |

### Vehicle Stores → useVehicleStore

| Store Deprecado | Nuevo Selector | Acción |
|-----------------|----------------|---------|
| `useVehiclesStore` | `useMyVehicles()` | `useVehicleStore().createVehicle()` |
| `useVehicleTiersStore` | `useVehicleTiers()` | `useVehicleStore().fetchTiers()` |

### MapFlow Hooks → useMapFlowStore

| Hook Deprecado | Nuevo Selector | Acción |
|----------------|----------------|---------|
| `useMapFlowActions` | `useMapFlowStore()` | `useMapFlowStore().next()` |
| `useMapFlowSelectors` | `useCurrentStep()` | `useMapFlowStore().goToStep()` |

---

## 📝 Patrones de Migración

### 1. Migración Básica de Imports

#### Antes (Deprecado)
```typescript
// ❌ Múltiples imports
import { useDriverProfileStore } from "@/store/driverProfile";
import { useDriverStateStore } from "@/store/driverState";
import { useDriverConfigStore } from "@/store/driverConfig";
import { useProfileStore } from "@/store/profile/profileStore";
import { useVehiclesStore } from "@/store/vehicles/vehicles";
import { useMapFlowActions } from "@/hooks/useMapFlowActions";
```

#### Después (Nuevo)
```typescript
// ✅ Un solo import
import { 
  useDriverProfile, 
  useDriverStatus, 
  useDriverSettings,
  useUserProfile,
  useMyVehicles,
  useMapFlowStore
} from "@/store";
```

### 2. Migración de Selectores

#### Antes (Deprecado)
```typescript
// ❌ Acceso directo al store
const { profile, status, settings } = useDriverProfileStore();
const { savedAddresses, verification } = useProfileStore();
const { vehicles } = useVehiclesStore();
const actions = useMapFlowActions();
```

#### Después (Nuevo)
```typescript
// ✅ Selectores optimizados
const profile = useDriverProfile();
const status = useDriverStatus();
const settings = useDriverSettings();
const addresses = useSavedAddresses();
const verification = useVerificationStatus();
const vehicles = useMyVehicles();
const { next, back } = useMapFlowStore();
```

### 3. Migración de Acciones

#### Antes (Deprecado)
```typescript
// ❌ Acceso a acciones desde múltiples stores
const { updateProfile, fetchProfile } = useDriverProfileStore();
const { updateStatus } = useDriverStateStore();
const { updateSettings } = useDriverConfigStore();
const { addAddress } = useProfileStore();
const { createVehicle } = useVehiclesStore();
const actions = useMapFlowActions();
```

#### Después (Nuevo)
```typescript
// ✅ Acciones desde stores consolidados
const { updateProfile, fetchProfile, updateStatus, updateSettings } = useDriverStore();
const { addAddress } = useUserStore();
const { createVehicle } = useVehicleStore();
const { next, back } = useMapFlowStore();
```

---

## 🔧 Ejemplos de Migración por Componente

### Componente de Dashboard de Conductor

#### Antes (Deprecado)
```typescript
import React from 'react';
import { 
  useDriverProfileStore, 
  useDriverStateStore, 
  useDriverConfigStore,
  useDriverEarningsStore 
} from "@/store";

const DriverDashboard = () => {
  const { profile, fetchProfile } = useDriverProfileStore();
  const { status, updateStatus } = useDriverStateStore();
  const { settings } = useDriverConfigStore();
  const { earnings, fetchEarnings } = useDriverEarningsStore();

  useEffect(() => {
    fetchProfile();
    fetchEarnings();
  }, []);

  return (
    <View>
      <Text>{profile?.firstName} {profile?.lastName}</Text>
      <Text>Status: {status}</Text>
      <Text>Theme: {settings.app.theme}</Text>
      <Text>Today's Earnings: ${earnings.today}</Text>
    </View>
  );
};
```

#### Después (Nuevo)
```typescript
import React from 'react';
import { 
  useDriverProfile, 
  useDriverStatus, 
  useAppSettings,
  useTodayEarnings,
  useDriverStore 
} from "@/store";

const DriverDashboard = () => {
  const profile = useDriverProfile();
  const status = useDriverStatus();
  const appSettings = useAppSettings();
  const todayEarnings = useTodayEarnings();
  const { fetchProfile, fetchEarningsSummary } = useDriverStore();

  useEffect(() => {
    fetchProfile();
    fetchEarningsSummary();
  }, []);

  return (
    <View>
      <Text>{profile?.firstName} {profile?.lastName}</Text>
      <Text>Status: {status}</Text>
      <Text>Theme: {appSettings.theme}</Text>
      <Text>Today's Earnings: ${todayEarnings}</Text>
    </View>
  );
};
```

### Componente de Perfil de Usuario

#### Antes (Deprecado)
```typescript
import React from 'react';
import { useProfileStore } from "@/store/profile/profileStore";

const UserProfile = () => {
  const { 
    savedAddresses, 
    verification, 
    preferences, 
    paymentMethods,
    addAddress,
    updatePreferences 
  } = useProfileStore();

  return (
    <View>
      <Text>Addresses: {savedAddresses.length}</Text>
      <Text>Email Verified: {verification.emailVerified ? 'Yes' : 'No'}</Text>
      <Text>Theme: {preferences.theme}</Text>
      <Text>Payment Methods: {paymentMethods.length}</Text>
    </View>
  );
};
```

#### Después (Nuevo)
```typescript
import React from 'react';
import { 
  useSavedAddresses, 
  useIsEmailVerified, 
  useUserTheme,
  usePaymentMethodsCount,
  useUserStore 
} from "@/store";

const UserProfile = () => {
  const addresses = useSavedAddresses();
  const emailVerified = useIsEmailVerified();
  const theme = useUserTheme();
  const paymentMethodsCount = usePaymentMethodsCount();
  const { addAddress, updatePreferences } = useUserStore();

  return (
    <View>
      <Text>Addresses: {addresses.length}</Text>
      <Text>Email Verified: {emailVerified ? 'Yes' : 'No'}</Text>
      <Text>Theme: {theme}</Text>
      <Text>Payment Methods: {paymentMethodsCount}</Text>
    </View>
  );
};
```

### Componente de Selección de Vehículo

#### Antes (Deprecado)
```typescript
import React from 'react';
import { useVehiclesStore } from "@/store/vehicles/vehicles";
import { useVehicleTiersStore } from "@/store/vehicleTiers/vehicleTiers";

const VehicleSelector = () => {
  const { vehicles, createVehicle } = useVehiclesStore();
  const { tiers, fetchTiers } = useVehicleTiersStore();

  useEffect(() => {
    fetchTiers();
  }, []);

  return (
    <View>
      <Text>My Vehicles: {vehicles.length}</Text>
      <Text>Available Types: {tiers.length}</Text>
    </View>
  );
};
```

#### Después (Nuevo)
```typescript
import React from 'react';
import { 
  useMyVehicles, 
  useVehicleTiers,
  useVehicleStore 
} from "@/store";

const VehicleSelector = () => {
  const vehicles = useMyVehicles();
  const tiers = useVehicleTiers();
  const { createVehicle, fetchTiers } = useVehicleStore();

  useEffect(() => {
    fetchTiers();
  }, []);

  return (
    <View>
      <Text>My Vehicles: {vehicles.length}</Text>
      <Text>Available Types: {tiers?.length || 0}</Text>
    </View>
  );
};
```

### Componente de Flujo de Mapas

#### Antes (Deprecado)
```typescript
import React from 'react';
import { useMapFlowActions } from "@/hooks/useMapFlowActions";
import { useMapFlowSelectors } from "@/hooks/useMapFlowSelectors";

const MapFlowComponent = () => {
  const actions = useMapFlowActions();
  const { step, role, service } = useMapFlowSelectors();

  return (
    <View>
      <Text>Step: {step}</Text>
      <Text>Role: {role}</Text>
      <Text>Service: {service}</Text>
      <Button title="Next" onPress={actions.next} />
      <Button title="Back" onPress={actions.back} />
    </View>
  );
};
```

#### Después (Nuevo)
```typescript
import React from 'react';
import { 
  useCurrentStep, 
  useCurrentRole, 
  useCurrentService,
  useMapFlowStore 
} from "@/store";

const MapFlowComponent = () => {
  const step = useCurrentStep();
  const role = useCurrentRole();
  const service = useCurrentService();
  const { next, back } = useMapFlowStore();

  return (
    <View>
      <Text>Step: {step}</Text>
      <Text>Role: {role}</Text>
      <Text>Service: {service}</Text>
      <Button title="Next" onPress={next} />
      <Button title="Back" onPress={back} />
    </View>
  );
};
```

---

## ⚠️ Consideraciones Importantes

### 1. Orden de Migración

1. **Primero**: Migrar imports y selectores básicos
2. **Segundo**: Migrar acciones y métodos
3. **Tercero**: Probar funcionalidad
4. **Cuarto**: Eliminar imports deprecados

### 2. Testing Durante Migración

```typescript
// Test básico para verificar migración
describe('Component Migration', () => {
  it('should render with new selectors', () => {
    const { getByText } = render(<Component />);
    expect(getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### 3. Rollback Plan

Si encuentras problemas:

1. **Revertir** cambios del componente
2. **Verificar** que los stores antiguos siguen funcionando
3. **Identificar** el problema específico
4. **Corregir** y reintentar la migración

### 4. Performance Monitoring

```typescript
// Monitorear re-renders durante migración
const Component = () => {
  console.log('Component rendered'); // Temporal para debugging
  const data = useNewSelector();
  return <View>{/* content */}</View>;
};
```

---

## 📋 Checklist de Migración

### Para Cada Componente:

- [ ] **Identificar** stores deprecados usados
- [ ] **Actualizar** imports a nuevos stores
- [ ] **Reemplazar** selectores con versiones optimizadas
- [ ] **Actualizar** acciones a nuevos métodos
- [ ] **Probar** funcionalidad básica
- [ ] **Verificar** que no hay errores de TypeScript
- [ ] **Eliminar** imports deprecados
- [ ] **Ejecutar** tests unitarios
- [ ] **Verificar** performance (re-renders)

### Para Todo el Proyecto:

- [ ] **Migrar** todos los componentes listados
- [ ] **Actualizar** store/index.ts
- [ ] **Eliminar** stores deprecados
- [ ] **Actualizar** documentación
- [ ] **Ejecutar** tests de integración
- [ ] **Verificar** build sin errores

---

## 🆘 Troubleshooting

### Error: "Cannot find module"
```typescript
// ❌ Error
import { useDriverProfile } from "@/store/driverProfile";

// ✅ Solución
import { useDriverProfile } from "@/store";
```

### Error: "Property does not exist"
```typescript
// ❌ Error
const { profile } = useDriverStore();

// ✅ Solución
const profile = useDriverProfile();
```

### Error: "Hook not found"
```typescript
// ❌ Error
import { useMapFlowActions } from "@/hooks/useMapFlowActions";

// ✅ Solución
import { useMapFlowStore } from "@/store";
const { next, back } = useMapFlowStore();
```

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. **Revisar** esta guía de migración
2. **Consultar** documentación específica de cada store
3. **Verificar** que estás usando la versión correcta
4. **Contactar** al equipo de desarrollo

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0.0
