# useUserStore - Store Expandido de Usuario

## 📋 Resumen

El `useUserStore` expandido consolida la funcionalidad de autenticación y perfil de usuario en un solo store cohesivo. Incluye direcciones guardadas, verificación de identidad, preferencias y métodos de pago.

## 🔄 Stores Consolidados

**Reemplaza:**
- `useProfileStore` (717 líneas eliminadas)
- Funcionalidad expandida de `useUserStore` original

## 🏗️ Estructura del Store

### Namespaces

```typescript
interface UserStore {
  // ===== AUTENTICACIÓN (existente) =====
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // ===== PERFIL EXTENDIDO (NUEVO) =====
  profile: {
    // Direcciones guardadas
    savedAddresses: Address[];
    defaultAddress: Address | null;
    
    // Verificación de identidad
    verification: {
      emailVerified: boolean;
      phoneVerified: boolean;
      accountVerified: boolean;
      status: "pending" | "approved" | "rejected";
      verificationDate?: Date;
      rejectionReason?: string;
    };
    
    // Preferencias de usuario
    preferences: {
      language: string;
      timezone: string;
      currency: string;
      theme: "light" | "dark" | "auto";
      notifications: NotificationPreferences;
    };
    
    // Métodos de pago guardados
    paymentMethods: PaymentMethod[];
    defaultPaymentMethod: string | null;
  };
}
```

## 🎯 Selectores Optimizados

### Selectores de Autenticación (Existentes)

```typescript
// Autenticación básica
export const useUser = () => useUserStore(s => s.user);
export const useIsAuthenticated = () => useUserStore(s => s.isAuthenticated);
export const useIsLoading = () => useUserStore(s => s.isLoading);
export const useUserError = () => useUserStore(s => s.error);

// Información del usuario
export const useUserBasicInfo = () => useUserStore(s => ({
  id: s.user?.id,
  firstName: s.user?.firstName,
  lastName: s.user?.lastName,
  email: s.user?.email,
  phone: s.user?.phone
}));

export const useUserFullName = () => useUserStore(s => 
  s.user ? `${s.user.firstName} ${s.user.lastName}` : ''
);

export const useUserEmail = () => useUserStore(s => s.user?.email);
export const useUserPhone = () => useUserStore(s => s.user?.phone);
export const useUserAvatar = () => useUserStore(s => s.user?.avatar);
export const useUserRole = () => useUserStore(s => s.user?.role);
export const useUserMode = () => useUserStore(s => s.user?.mode);
export const useUserCreatedAt = () => useUserStore(s => s.user?.createdAt);
export const useUserUpdatedAt = () => useUserStore(s => s.user?.updatedAt);
```

### Selectores de Direcciones (Nuevos)

```typescript
export const useSavedAddresses = () => useUserStore(s => s.profile.savedAddresses);
export const useDefaultAddress = () => useUserStore(s => s.profile.defaultAddress);
export const useHasSavedAddresses = () => useUserStore(s => s.profile.savedAddresses.length > 0);
export const useAddressesCount = () => useUserStore(s => s.profile.savedAddresses.length);

// Selector compuesto para direcciones
export const useAddressesData = () => useUserStore(s => ({
  addresses: s.profile.savedAddresses,
  defaultAddress: s.profile.defaultAddress,
  count: s.profile.savedAddresses.length
}));
```

### Selectores de Verificación (Nuevos)

```typescript
export const useVerificationStatus = () => useUserStore(s => s.profile.verification);
export const useIsEmailVerified = () => useUserStore(s => s.profile.verification.emailVerified);
export const useIsPhoneVerified = () => useUserStore(s => s.profile.verification.phoneVerified);
export const useIsAccountVerified = () => useUserStore(s => s.profile.verification.accountVerified);
export const useVerificationDate = () => useUserStore(s => s.profile.verification.verificationDate);
export const useRejectionReason = () => useUserStore(s => s.profile.verification.rejectionReason);

// Selector compuesto para verificación
export const useVerificationData = () => useUserStore(s => ({
  emailVerified: s.profile.verification.emailVerified,
  phoneVerified: s.profile.verification.phoneVerified,
  accountVerified: s.profile.verification.accountVerified,
  status: s.profile.verification.status,
  isFullyVerified: s.profile.verification.emailVerified && 
                   s.profile.verification.phoneVerified && 
                   s.profile.verification.accountVerified
}));
```

### Selectores de Preferencias (Nuevos)

```typescript
export const useUserPreferences = () => useUserStore(s => s.profile.preferences);
export const useUserTheme = () => useUserStore(s => s.profile.preferences.theme);
export const useUserLanguage = () => useUserStore(s => s.profile.preferences.language);
export const useUserTimezone = () => useUserStore(s => s.profile.preferences.timezone);
export const useUserCurrency = () => useUserStore(s => s.profile.preferences.currency);
export const useNotificationPreferences = () => useUserStore(s => s.profile.preferences.notifications);
```

### Selectores de Métodos de Pago (Nuevos)

```typescript
export const usePaymentMethods = () => useUserStore(s => s.profile.paymentMethods);
export const useDefaultPaymentMethod = () => useUserStore(s => s.profile.defaultPaymentMethod);
export const useHasPaymentMethods = () => useUserStore(s => s.profile.paymentMethods.length > 0);
export const usePaymentMethodsCount = () => useUserStore(s => s.profile.paymentMethods.length);

// Selector compuesto para métodos de pago
export const usePaymentData = () => useUserStore(s => ({
  methods: s.profile.paymentMethods,
  defaultMethod: s.profile.defaultPaymentMethod,
  count: s.profile.paymentMethods.length
}));
```

### Selectores Compuestos (Nuevos)

```typescript
// Perfil completo del usuario
export const useUserProfile = () => useUserStore(s => ({
  user: s.user,
  addresses: s.profile.savedAddresses,
  verification: s.profile.verification,
  preferences: s.profile.preferences
}));

// Datos completos del usuario
export const useUserFullData = () => useUserStore(s => ({
  ...s.user,
  profile: s.profile
}));

// Datos para formularios de perfil
export const useProfileFormData = () => useUserStore(s => ({
  firstName: s.user?.firstName || '',
  lastName: s.user?.lastName || '',
  email: s.user?.email || '',
  phone: s.user?.phone || '',
  addresses: s.profile.savedAddresses,
  preferences: s.profile.preferences
}));
```

## 🔧 Acciones Principales

### Gestión de Autenticación

```typescript
const { 
  setUser, 
  updateUser, 
  setAuthenticated, 
  clearUser, 
  refreshUser 
} = useUserStore();

// Establecer usuario
setUser({
  id: "123",
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@example.com"
});

// Actualizar datos del usuario
await updateUser({
  firstName: "Juan Carlos",
  phone: "+1234567890"
});
```

### Gestión de Direcciones

```typescript
const { 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} = useUserStore();

// Agregar dirección
await addAddress({
  id: "addr_1",
  name: "Casa",
  address: "123 Main St",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  coordinates: { lat: 40.7128, lng: -74.0060 }
});

// Establecer dirección por defecto
await setDefaultAddress("addr_1");
```

### Gestión de Verificación

```typescript
const { 
  updateVerificationStatus, 
  markEmailVerified, 
  markPhoneVerified 
} = useUserStore();

// Marcar email como verificado
await markEmailVerified();

// Actualizar estado de verificación
await updateVerificationStatus({
  emailVerified: true,
  phoneVerified: true,
  status: "approved"
});
```

### Gestión de Preferencias

```typescript
const { updatePreferences } = useUserStore();

// Actualizar preferencias
await updatePreferences({
  language: "es",
  theme: "dark",
  notifications: {
    push: true,
    email: false,
    sms: true
  }
});
```

### Gestión de Métodos de Pago

```typescript
const { 
  addPaymentMethod, 
  removePaymentMethod, 
  setDefaultPaymentMethod 
} = useUserStore();

// Agregar método de pago
await addPaymentMethod({
  id: "pm_1",
  type: "card",
  last4: "4242",
  brand: "visa",
  isDefault: false
});

// Establecer método por defecto
await setDefaultPaymentMethod("pm_1");
```

## 📝 Ejemplos de Uso

### Componente de Perfil

```typescript
import { 
  useUser, 
  useSavedAddresses, 
  useVerificationData,
  useUserPreferences 
} from "@/store";

const UserProfile = () => {
  const user = useUser();
  const addresses = useSavedAddresses();
  const verification = useVerificationData();
  const preferences = useUserPreferences();

  return (
    <View>
      <Text>{user?.firstName} {user?.lastName}</Text>
      <Text>Email Verified: {verification.emailVerified ? 'Yes' : 'No'}</Text>
      <Text>Addresses: {addresses.length}</Text>
      <Text>Theme: {preferences.theme}</Text>
    </View>
  );
};
```

### Componente de Direcciones

```typescript
import { 
  useSavedAddresses, 
  useDefaultAddress,
  useUserStore 
} from "@/store";

const AddressesList = () => {
  const addresses = useSavedAddresses();
  const defaultAddress = useDefaultAddress();
  const { addAddress, setDefaultAddress } = useUserStore();

  const handleAddAddress = async (addressData) => {
    await addAddress(addressData);
  };

  const handleSetDefault = async (addressId) => {
    await setDefaultAddress(addressId);
  };

  return (
    <View>
      {addresses.map(address => (
        <View key={address.id}>
          <Text>{address.name}</Text>
          <Text>{address.address}</Text>
          {address.id === defaultAddress?.id && <Text>Default</Text>}
        </View>
      ))}
    </View>
  );
};
```

### Componente de Verificación

```typescript
import { 
  useVerificationData, 
  useUserStore 
} from "@/store";

const VerificationStatus = () => {
  const verification = useVerificationData();
  const { markEmailVerified, markPhoneVerified } = useUserStore();

  return (
    <View>
      <Text>Email: {verification.emailVerified ? '✓' : '✗'}</Text>
      <Text>Phone: {verification.phoneVerified ? '✓' : '✗'}</Text>
      <Text>Account: {verification.accountVerified ? '✓' : '✗'}</Text>
      
      {!verification.emailVerified && (
        <Button onPress={markEmailVerified} title="Verify Email" />
      )}
    </View>
  );
};
```

## ⚠️ Migración desde ProfileStore

### Antes (Deprecado)

```typescript
// ❌ DEPRECADO - Store separado
import { useProfileStore } from "@/store/profile/profileStore";

const { 
  savedAddresses, 
  verification, 
  preferences, 
  paymentMethods 
} = useProfileStore();
```

### Después (Nuevo)

```typescript
// ✅ NUEVO - Store consolidado
import { 
  useSavedAddresses, 
  useVerificationStatus, 
  useUserPreferences, 
  usePaymentMethods 
} from "@/store";

const addresses = useSavedAddresses();
const verification = useVerificationStatus();
const preferences = useUserPreferences();
const paymentMethods = usePaymentMethods();
```

## 🔍 Persistencia

El store incluye persistencia automática para:

- `user` - Datos básicos del usuario
- `isAuthenticated` - Estado de autenticación
- `profile` - Datos extendidos del perfil

## 🧪 Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useUserStore } from '@/store';

describe('useUserStore', () => {
  it('should add address correctly', async () => {
    const { result } = renderHook(() => useUserStore());
    
    const newAddress = {
      id: 'addr_1',
      name: 'Home',
      address: '123 Main St'
    };
    
    await act(async () => {
      await result.current.addAddress(newAddress);
    });
    
    expect(result.current.profile.savedAddresses).toContain(newAddress);
  });
});
```

## 📊 Performance

- **Selectores granulares**: Solo re-renderiza cuando cambia la propiedad específica
- **Persistencia selectiva**: Solo persiste datos esenciales
- **Memoización automática**: Zustand optimiza automáticamente los selectores
- **Lazy loading**: Carga datos de perfil solo cuando se necesitan

---

**Última actualización:** Diciembre 2024  
**Versión:** 2.0.0
