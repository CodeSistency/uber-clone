# useVehicleStore - Store Consolidado de Vehículos

## 📋 Resumen

El `useVehicleStore` consolida la funcionalidad de vehículos del conductor y el catálogo de tipos de vehículos en un solo store con namespaces separados para mayor claridad.

## 🔄 Stores Consolidados

**Reemplaza:**
- `useVehiclesStore` (206 líneas eliminadas)
- `useVehicleTiersStore` (181 líneas eliminadas)

## 🏗️ Estructura del Store

### Namespaces

```typescript
interface VehicleStore {
  // ===== VEHÍCULOS DEL CONDUCTOR =====
  myVehicles: {
    list: Vehicle[];
    selected: Vehicle | null;
    active: Vehicle | null;
  };
  
  // ===== CATÁLOGO DE TIPOS =====
  catalog: {
    tiers: VehicleTiersData | null;
    carTiers: VehicleTier[];
    motorcycleTiers: VehicleTier[];
    loading: boolean;
    lastFetch: Date | null;
  };
  
  // ===== ESTADOS DE CARGA =====
  loading: {
    myVehicles: boolean;
    catalog: boolean;
  };
  error: string | null;
}
```

## 🎯 Selectores Optimizados

### Selectores de Mis Vehículos

```typescript
// Lista de vehículos
export const useMyVehicles = () => useVehicleStore(s => s.myVehicles.list);
export const useSelectedVehicle = () => useVehicleStore(s => s.myVehicles.selected);
export const useActiveVehicle = () => useVehicleStore(s => s.myVehicles.active);
export const useHasVehicles = () => useVehicleStore(s => s.myVehicles.list.length > 0);
export const useMyVehiclesCount = () => useVehicleStore(s => s.myVehicles.list.length);

// Selector compuesto para mis vehículos
export const useMyVehiclesData = () => useVehicleStore(s => ({
  vehicles: s.myVehicles.list,
  selected: s.myVehicles.selected,
  active: s.myVehicles.active,
  count: s.myVehicles.list.length
}));
```

### Selectores del Catálogo

```typescript
// Catálogo de tipos
export const useVehicleTiers = () => useVehicleStore(s => s.catalog.tiers);
export const useCarTiers = () => useVehicleStore(s => s.catalog.carTiers);
export const useMotorcycleTiers = () => useVehicleStore(s => s.catalog.motorcycleTiers);
export const useTiersLoading = () => useVehicleStore(s => s.catalog.loading);
export const useTiersLastFetch = () => useVehicleStore(s => s.catalog.lastFetch);

// Selector compuesto para catálogo
export const useCatalogData = () => useVehicleStore(s => ({
  tiers: s.catalog.tiers,
  carTiers: s.catalog.carTiers,
  motorcycleTiers: s.catalog.motorcycleTiers,
  loading: s.catalog.loading
}));
```

### Selectores de Carga y Error

```typescript
export const useVehiclesLoading = () => useVehicleStore(s => s.loading);
export const useMyVehiclesLoading = () => useVehicleStore(s => s.loading.myVehicles);
export const useCatalogLoading = () => useVehicleStore(s => s.loading.catalog);
export const useVehicleError = () => useVehicleStore(s => s.error);
```

### Selector Compuesto General

```typescript
export const useVehicleData = () => useVehicleStore(s => ({
  myVehicles: s.myVehicles.list,
  selected: s.myVehicles.selected,
  active: s.myVehicles.active,
  tiers: s.catalog.tiers,
  loading: s.loading
}));
```

## 🔧 Acciones Principales

### Gestión de Mis Vehículos

```typescript
const { 
  fetchMyVehicles, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  selectVehicle,
  activateVehicle,
  deactivateVehicle
} = useVehicleStore();

// Obtener mis vehículos
await fetchMyVehicles();

// Crear vehículo
const newVehicle = await createVehicle({
  make: "Toyota",
  model: "Camry",
  year: 2020,
  color: "White",
  plateNumber: "ABC123",
  vehicleType: "car"
});

// Activar vehículo
await activateVehicle(vehicleId);

// Seleccionar vehículo
selectVehicle(vehicle);
```

### Gestión del Catálogo

```typescript
const { 
  fetchTiers, 
  loadTiersFromStorage, 
  forceRefreshTiers, 
  clearTiers 
} = useVehicleStore();

// Obtener catálogo de tipos
await fetchTiers();

// Cargar desde almacenamiento local
await loadTiersFromStorage();

// Forzar actualización
await forceRefreshTiers();
```

### Utilidades

```typescript
const { 
  getTierById, 
  getTiersByType 
} = useVehicleStore();

// Obtener tipo por ID
const tier = getTierById(1);

// Obtener tipos por categoría
const carTiers = getTiersByType('car');
const motorcycleTiers = getTiersByType('motorcycle');
```

## 📝 Ejemplos de Uso

### Componente de Mis Vehículos (Driver)

```typescript
import { 
  useMyVehicles, 
  useActiveVehicle, 
  useMyVehiclesLoading,
  useVehicleStore 
} from "@/store";

const MyVehiclesList = () => {
  const vehicles = useMyVehicles();
  const activeVehicle = useActiveVehicle();
  const loading = useMyVehiclesLoading();
  const { activateVehicle, deactivateVehicle } = useVehicleStore();

  const handleToggleActive = async (vehicleId) => {
    if (activeVehicle?.id === vehicleId) {
      await deactivateVehicle(vehicleId);
    } else {
      await activateVehicle(vehicleId);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      {vehicles.map(vehicle => (
        <View key={vehicle.id}>
          <Text>{vehicle.make} {vehicle.model}</Text>
          <Text>{vehicle.year} - {vehicle.color}</Text>
          <Text>Plate: {vehicle.plateNumber}</Text>
          {activeVehicle?.id === vehicle.id && <Text>ACTIVE</Text>}
          <Button 
            title={activeVehicle?.id === vehicle.id ? "Deactivate" : "Activate"}
            onPress={() => handleToggleActive(vehicle.id)}
          />
        </View>
      ))}
    </View>
  );
};
```

### Componente de Selección de Tipo (Passenger)

```typescript
import { 
  useCarTiers, 
  useMotorcycleTiers, 
  useTiersLoading,
  useVehicleStore 
} from "@/store";

const VehicleTypeSelector = () => {
  const carTiers = useCarTiers();
  const motorcycleTiers = useMotorcycleTiers();
  const loading = useTiersLoading();
  const { fetchTiers } = useVehicleStore();

  useEffect(() => {
    fetchTiers();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <Text>Select Vehicle Type</Text>
      
      <Text>Cars:</Text>
      {carTiers.map(tier => (
        <TouchableOpacity key={tier.id}>
          <Text>{tier.name}</Text>
          <Text>${tier.basePrice}</Text>
        </TouchableOpacity>
      ))}
      
      <Text>Motorcycles:</Text>
      {motorcycleTiers.map(tier => (
        <TouchableOpacity key={tier.id}>
          <Text>{tier.name}</Text>
          <Text>${tier.basePrice}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### Componente de Formulario de Vehículo

```typescript
import { 
  useVehicleStore,
  useMyVehiclesLoading 
} from "@/store";

const AddVehicleForm = () => {
  const { createVehicle } = useVehicleStore();
  const loading = useMyVehiclesLoading();
  const [formData, setFormData] = useState({});

  const handleSubmit = async () => {
    try {
      await createVehicle(formData);
      // Navigate back or show success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Make"
        value={formData.make}
        onChangeText={(text) => setFormData({...formData, make: text})}
      />
      <TextInput
        placeholder="Model"
        value={formData.model}
        onChangeText={(text) => setFormData({...formData, model: text})}
      />
      <Button 
        title="Add Vehicle" 
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
};
```

## ⚠️ Migración desde Stores Antiguos

### Antes (Deprecado)

```typescript
// ❌ DEPRECADO - Stores separados
import { useVehiclesStore } from "@/store/vehicles/vehicles";
import { useVehicleTiersStore } from "@/store/vehicleTiers/vehicleTiers";

const { vehicles, addVehicle } = useVehiclesStore();
const { tiers, fetchTiers } = useVehicleTiersStore();
```

### Después (Nuevo)

```typescript
// ✅ NUEVO - Store consolidado
import { 
  useMyVehicles, 
  useVehicleTiers, 
  useVehicleStore 
} from "@/store";

const vehicles = useMyVehicles();
const tiers = useVehicleTiers();
const { addVehicle, fetchTiers } = useVehicleStore();
```

## 🔍 Diferencias Clave

### Mis Vehículos vs Catálogo

```typescript
// MIS VEHÍCULOS - Para conductores
const myVehicles = useMyVehicles(); // Vehículos del conductor
const activeVehicle = useActiveVehicle(); // Vehículo activo

// CATÁLOGO - Para pasajeros
const carTiers = useCarTiers(); // Tipos de carros disponibles
const motorcycleTiers = useMotorcycleTiers(); // Tipos de motos disponibles
```

### Acciones Específicas

```typescript
// Para mis vehículos
const { createVehicle, activateVehicle, deactivateVehicle } = useVehicleStore();

// Para catálogo
const { fetchTiers, getTierById, getTiersByType } = useVehicleStore();
```

## 🔍 Persistencia

El store incluye persistencia automática para:

- `myVehicles.list` - Lista de vehículos del conductor
- `catalog.tiers` - Catálogo de tipos de vehículos
- `catalog.lastFetch` - Timestamp de última actualización

## 🧪 Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useVehicleStore } from '@/store';

describe('useVehicleStore', () => {
  it('should create vehicle correctly', async () => {
    const { result } = renderHook(() => useVehicleStore());
    
    const vehicleData = {
      make: 'Toyota',
      model: 'Camry',
      year: 2020
    };
    
    await act(async () => {
      await result.current.createVehicle(vehicleData);
    });
    
    expect(result.current.myVehicles.list).toContainEqual(
      expect.objectContaining(vehicleData)
    );
  });
});
```

## 📊 Performance

- **Namespaces separados**: Evita re-renders innecesarios
- **Selectores granulares**: Solo actualiza componentes específicos
- **Persistencia selectiva**: Solo persiste datos necesarios
- **Lazy loading**: Carga catálogo solo cuando se necesita

## 🎯 Casos de Uso

### Para Conductores
- Gestionar vehículos propios
- Activar/desactivar vehículos
- Verificar estado de vehículos

### Para Pasajeros
- Ver tipos de vehículos disponibles
- Seleccionar tipo de vehículo
- Ver precios y características

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0.0
