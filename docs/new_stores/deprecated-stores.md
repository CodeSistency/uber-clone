# Stores y Hooks Deprecados

## 📋 Resumen

Esta documentación lista todos los stores y hooks que han sido marcados como deprecados y serán eliminados en futuras versiones. Se proporciona información sobre qué usar en su lugar.

## ⚠️ Estado de Deprecación

**FASE ACTUAL:** Marcados como deprecados con warnings  
**ELIMINACIÓN PLANIFICADA:** Semana 6 del plan de migración  
**VERSIÓN DE ELIMINACIÓN:** 3.0.0

---

## 🚫 Stores Deprecados

### Driver Stores (8 stores)

#### 1. `useDriverProfileStore`
```typescript
// ❌ DEPRECADO
import { useDriverProfileStore } from "@/store/driverProfile";

// ✅ REEMPLAZAR CON
import { useDriverProfile, useDriverStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useDriverProfile()` - Datos del perfil
- `useDriverStore().setProfile()` - Establecer perfil
- `useDriverStore().updateProfile()` - Actualizar perfil
- `useDriverStore().fetchProfile()` - Obtener perfil

#### 2. `useDriverStateStore`
```typescript
// ❌ DEPRECADO
import { useDriverStateStore } from "@/store/driverState";

// ✅ REEMPLAZAR CON
import { useDriverStatus, useDriverStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useDriverStatus()` - Estado del conductor
- `useDriverAvailability()` - Disponibilidad
- `useDriverStore().updateStatus()` - Actualizar estado
- `useDriverStore().setAvailability()` - Establecer disponibilidad

#### 3. `useDriverConfigStore`
```typescript
// ❌ DEPRECADO
import { useDriverConfigStore } from "@/store/driverConfig";

// ✅ REEMPLAZAR CON
import { useDriverSettings, useDriverStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useDriverSettings()` - Configuraciones completas
- `useAppSettings()` - Configuraciones de app
- `useNavigationSettings()` - Configuraciones de navegación
- `useSoundSettings()` - Configuraciones de sonido

#### 4. `useDriverRoleStore`
```typescript
// ❌ DEPRECADO
import { useDriverRoleStore } from "@/store/driverRole";

// ✅ REEMPLAZAR CON
import { useDriverRole, useIsDriver, useDriverStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useDriverRole()` - Rol del conductor
- `useIsDriver()` - Es conductor
- `useDriverStore().setRole()` - Establecer rol

#### 5. `useDriverOnboardingStore`
```typescript
// ❌ DEPRECADO
import { useDriverOnboardingStore } from "@/store/driverOnboarding";

// ✅ REEMPLAZAR CON
import { useOnboarding, useDriverStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useOnboarding()` - Estado del onboarding
- `useOnboardingProgress()` - Progreso
- `useIsOnboardingCompleted()` - Completado
- `useDriverStore().nextOnboardingStep()` - Siguiente paso

#### 6. `useDriverEarningsStore`
```typescript
// ❌ DEPRECADO
import { useDriverEarningsStore } from "@/store/driverEarnings";

// ✅ REEMPLAZAR CON
import { useDriverEarnings, useDriverStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useDriverEarnings()` - Datos de ganancias
- `useTodayEarnings()` - Ganancias de hoy
- `useWeekEarnings()` - Ganancias de la semana
- `useDriverStore().fetchEarningsSummary()` - Obtener resumen

#### 7. `useEarningsStore`
```typescript
// ❌ DEPRECADO
import { useEarningsStore } from "@/store/earnings";

// ✅ REEMPLAZAR CON
import { useDriverEarnings, useDriverStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useDriverEarnings()` - Datos de ganancias
- `useDriverStore().fetchEarningsSummary()` - Obtener resumen

#### 8. `useDriverStore` (original)
```typescript
// ❌ DEPRECADO - Store original básico
import { useDriverStore } from "@/store/driver/driver";

// ✅ REEMPLAZAR CON
import { useDriverStore } from "@/store"; // Store consolidado
```

**Funcionalidad migrada a:**
- Store consolidado con toda la funcionalidad
- Selectores optimizados
- Acciones unificadas

### Profile Store (1 store)

#### 9. `useProfileStore`
```typescript
// ❌ DEPRECADO
import { useProfileStore } from "@/store/profile/profileStore";

// ✅ REEMPLAZAR CON
import { useUserStore, useUserProfile } from "@/store";
```

**Funcionalidad migrada a:**
- `useUserProfile()` - Perfil completo
- `useSavedAddresses()` - Direcciones guardadas
- `useVerificationStatus()` - Estado de verificación
- `useUserPreferences()` - Preferencias
- `usePaymentMethods()` - Métodos de pago

### Vehicle Stores (2 stores)

#### 10. `useVehiclesStore`
```typescript
// ❌ DEPRECADO
import { useVehiclesStore } from "@/store/vehicles/vehicles";

// ✅ REEMPLAZAR CON
import { useMyVehicles, useVehicleStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useMyVehicles()` - Vehículos del conductor
- `useActiveVehicle()` - Vehículo activo
- `useVehicleStore().createVehicle()` - Crear vehículo
- `useVehicleStore().updateVehicle()` - Actualizar vehículo

#### 11. `useVehicleTiersStore`
```typescript
// ❌ DEPRECADO
import { useVehicleTiersStore } from "@/store/vehicleTiers/vehicleTiers";

// ✅ REEMPLAZAR CON
import { useVehicleTiers, useVehicleStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useVehicleTiers()` - Catálogo de tipos
- `useCarTiers()` - Tipos de carros
- `useMotorcycleTiers()` - Tipos de motos
- `useVehicleStore().fetchTiers()` - Obtener catálogo

---

## 🚫 Hooks Deprecados

### MapFlow Hooks (2 hooks)

#### 1. `useMapFlowActions`
```typescript
// ❌ DEPRECADO
import { useMapFlowActions } from "@/hooks/useMapFlowActions";

// ✅ REEMPLAZAR CON
import { useMapFlowStore } from "@/store";
```

**Funcionalidad migrada a:**
- `useMapFlowStore().start()` - Iniciar flujo
- `useMapFlowStore().next()` - Siguiente paso
- `useMapFlowStore().back()` - Paso anterior
- `useMapFlowStore().goToStep()` - Ir a paso específico

#### 2. `useMapFlowSelectors`
```typescript
// ❌ DEPRECADO
import { useMapFlowSelectors } from "@/hooks/useMapFlowSelectors";

// ✅ REEMPLAZAR CON
import { 
  useCurrentStep, 
  useCurrentRole, 
  useCurrentService 
} from "@/store";
```

**Funcionalidad migrada a:**
- `useCurrentStep()` - Paso actual
- `useCurrentRole()` - Rol actual
- `useCurrentService()` - Servicio actual
- `useRideId()` - ID del viaje
- `useIsMatching()` - Estado de búsqueda

---

## 📊 Resumen de Migración

### Stores Eliminados: 11
- 8 stores de conductor
- 1 store de perfil
- 2 stores de vehículos

### Hooks Eliminados: 2
- 1 hook de acciones MapFlow
- 1 hook de selectores MapFlow

### Total de Archivos a Eliminar: 13

---

## 🔄 Mapeo Completo de Migración

### Driver Stores → useDriverStore

| Store Deprecado | Selector Nuevo | Acción Nueva |
|-----------------|----------------|--------------|
| `useDriverProfileStore.profile` | `useDriverProfile()` | `useDriverStore().setProfile()` |
| `useDriverStateStore.status` | `useDriverStatus()` | `useDriverStore().updateStatus()` |
| `useDriverConfigStore.settings` | `useDriverSettings()` | `useDriverStore().updateAppSettings()` |
| `useDriverRoleStore.role` | `useDriverRole()` | `useDriverStore().setRole()` |
| `useDriverOnboardingStore.onboarding` | `useOnboarding()` | `useDriverStore().nextOnboardingStep()` |
| `useDriverEarningsStore.earnings` | `useDriverEarnings()` | `useDriverStore().fetchEarningsSummary()` |
| `useEarningsStore.earnings` | `useDriverEarnings()` | `useDriverStore().fetchEarningsSummary()` |

### Profile Store → useUserStore

| Store Deprecado | Selector Nuevo | Acción Nueva |
|-----------------|----------------|--------------|
| `useProfileStore.savedAddresses` | `useSavedAddresses()` | `useUserStore().addAddress()` |
| `useProfileStore.verification` | `useVerificationStatus()` | `useUserStore().updateVerificationStatus()` |
| `useProfileStore.preferences` | `useUserPreferences()` | `useUserStore().updatePreferences()` |
| `useProfileStore.paymentMethods` | `usePaymentMethods()` | `useUserStore().addPaymentMethod()` |

### Vehicle Stores → useVehicleStore

| Store Deprecado | Selector Nuevo | Acción Nueva |
|-----------------|----------------|--------------|
| `useVehiclesStore.vehicles` | `useMyVehicles()` | `useVehicleStore().createVehicle()` |
| `useVehicleTiersStore.tiers` | `useVehicleTiers()` | `useVehicleStore().fetchTiers()` |

### MapFlow Hooks → useMapFlowStore

| Hook Deprecado | Selector Nuevo | Acción Nueva |
|----------------|----------------|--------------|
| `useMapFlowSelectors.step` | `useCurrentStep()` | `useMapFlowStore().goToStep()` |
| `useMapFlowSelectors.role` | `useCurrentRole()` | `useMapFlowStore().start()` |
| `useMapFlowActions.next` | - | `useMapFlowStore().next()` |
| `useMapFlowActions.back` | - | `useMapFlowStore().back()` |

---

## ⚠️ Warnings de Deprecación

Los stores deprecados incluyen warnings en consola:

```typescript
// Warning que verás en consola
console.warn(
  '[DEPRECATED] useDriverProfileStore is deprecated. ' +
  'Use useDriverProfile() from @/store instead. ' +
  'This store will be removed in version 3.0.0'
);
```

## 🗑️ Plan de Eliminación

### Semana 5: Marcar como Deprecados
- [ ] Agregar warnings a todos los stores deprecados
- [ ] Actualizar documentación
- [ ] Notificar a desarrolladores

### Semana 6: Eliminación Final
- [ ] Eliminar archivos de stores deprecados
- [ ] Eliminar archivos de hooks deprecados
- [ ] Limpiar imports en store/index.ts
- [ ] Actualizar tipos TypeScript
- [ ] Ejecutar tests finales

---

## 🧪 Testing de Migración

### Verificar que la migración funciona:

```typescript
// Test para verificar que el nuevo store funciona
describe('Store Migration', () => {
  it('should provide same data as deprecated store', () => {
    // Test que compare datos del store nuevo vs deprecado
    const newData = useDriverProfile();
    const oldData = useDriverProfileStore().profile;
    
    expect(newData).toEqual(oldData);
  });
});
```

### Verificar que no hay referencias a stores deprecados:

```bash
# Buscar referencias a stores deprecados
grep -r "useDriverProfileStore" src/
grep -r "useProfileStore" src/
grep -r "useMapFlowActions" src/
```

---

## 📞 Soporte para Migración

Si necesitas ayuda con la migración:

1. **Revisar** la guía de migración detallada
2. **Consultar** la documentación de cada store nuevo
3. **Usar** los ejemplos de migración proporcionados
4. **Contactar** al equipo de desarrollo

---

**Última actualización:** Diciembre 2024  
**Versión de eliminación:** 3.0.0
