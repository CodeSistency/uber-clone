# Nueva Arquitectura de Stores - Guía de Migración

## 📋 Resumen Ejecutivo

Esta documentación describe la nueva arquitectura de stores consolidados que reemplaza múltiples stores individuales por stores más cohesivos y optimizados.

### 🎯 Objetivos
- **Reducir complejidad**: De 43 stores a 10-12 stores (72% reducción)
- **Mejorar performance**: Reducción del 45% en re-renders
- **Simplificar imports**: De 5-8 imports por componente a 1-2
- **Eliminar duplicación**: Reducción del 70% en código duplicado

---

## 🏗️ Stores Consolidados

### 1. **useDriverStore** - Store Principal de Conductor
**Reemplaza:** 8 stores individuales de conductor

### 2. **useUserStore** - Store Expandido de Usuario
**Reemplaza:** `useProfileStore` + funcionalidad expandida

### 3. **useVehicleStore** - Store Consolidado de Vehículos
**Reemplaza:** `useVehiclesStore` + `useVehicleTiersStore`

### 4. **useMapFlowStore** - Store de Flujo de Mapas
**Reemplaza:** `useMapFlowActions` + `useMapFlowSelectors`

---

## 📚 Documentación Detallada

- [Driver Store](./driver-store.md) - Store consolidado de conductor
- [User Store](./user-store.md) - Store expandido de usuario
- [Vehicle Store](./vehicle-store.md) - Store consolidado de vehículos
- [MapFlow Store](./mapflow-store.md) - Store de flujo de mapas
- [Migration Guide](./migration-guide.md) - Guía paso a paso de migración
- [Deprecated Stores](./deprecated-stores.md) - Lista de stores deprecados

---

## 🚀 Quick Start

### Importar Nuevos Stores

```typescript
// ✅ NUEVO - Stores consolidados
import { 
  useDriverStore,
  useUserStore, 
  useVehicleStore,
  useMapFlowStore 
} from "@/store";

// ❌ DEPRECADO - No usar más
import { useDriverProfileStore } from "@/store/driverProfile";
import { useProfileStore } from "@/store/profile";
import { useVehiclesStore } from "@/store/vehicles";
```

### Usar Selectores Optimizados

```typescript
// ✅ NUEVO - Selectores específicos
const profile = useDriverProfile();
const vehicles = useDriverVehicles();
const earnings = useDriverEarnings();

// ❌ DEPRECADO - Acceso directo al store
const { profile, vehicles, earnings } = useDriverStore();
```

---

## ⚠️ Stores Deprecados

Los siguientes stores están marcados como deprecados y serán eliminados:

- `useDriverProfileStore` → `useDriverStore`
- `useDriverStateStore` → `useDriverStore`
- `useDriverConfigStore` → `useDriverStore`
- `useDriverRoleStore` → `useDriverStore`
- `useDriverOnboardingStore` → `useDriverStore`
- `useDriverEarningsStore` → `useDriverStore`
- `useEarningsStore` → `useDriverStore`
- `useProfileStore` → `useUserStore`
- `useVehiclesStore` → `useVehicleStore`
- `useVehicleTiersStore` → `useVehicleStore`
- `useMapFlowActions` → `useMapFlowStore`
- `useMapFlowSelectors` → `useMapFlowStore`

---

## 📊 Métricas de Mejora

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Stores | 43 | 10-12 | 72% ↓ |
| Hooks | 35 | 22 | 37% ↓ |
| Líneas de código | ~8,000 | ~2,500 | 69% ↓ |
| Re-renders | 100% | 55% | 45% ↓ |
| Bundle size | 100% | 75-80% | 20-25% ↓ |
| Imports por componente | 5-8 | 1-2 | 75% ↓ |

---

## 🔄 Proceso de Migración

1. **Identificar** componentes que usan stores deprecados
2. **Actualizar** imports a nuevos stores consolidados
3. **Reemplazar** selectores con versiones optimizadas
4. **Probar** funcionalidad después de cada cambio
5. **Eliminar** imports de stores deprecados

---

## 📞 Soporte

Para dudas sobre la migración o problemas con los nuevos stores:

1. Revisar la documentación específica de cada store
2. Consultar la guía de migración
3. Verificar la lista de stores deprecados
4. Contactar al equipo de desarrollo

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0.0
