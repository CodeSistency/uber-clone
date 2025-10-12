<!-- 9f688166-df80-4eb3-a610-0e759ce3e256 9cad7350-f118-409a-a5f9-6c8b96d82b2a -->
# MMKV Storage Integration Plan

## Overview

Replace `@react-native-async-storage/async-storage` with `react-native-mmkv` for better performance (up to 30x faster). Use a gradual migration approach with a storage adapter pattern that supports both systems during transition, and automatically migrate existing user data on first launch.

## Phase 1: Setup and Infrastructure

### 1.1 Install MMKV

```bash
npm install react-native-mmkv
npx pod-install  # iOS only
```

### 1.2 Create Storage Adapter (`lib/storage/storageAdapter.ts`)

Create an abstraction layer that:

- Provides a unified interface for both AsyncStorage and MMKV
- Handles automatic type conversion (MMKV supports string, number, boolean, Buffer natively)
- Manages migration state
- Falls back to AsyncStorage if MMKV fails

Key interface:

```typescript
interface IStorageAdapter {
  getString(key: string): string | undefined;
  setString(key: string, value: string): void;
  getNumber(key: string): number | undefined;
  setNumber(key: string, value: number): void;
  getBoolean(key: string): boolean | undefined;
  setBoolean(key: string, value: boolean): void;
  delete(key: string): void;
  contains(key: string): boolean;
  getAllKeys(): string[];
  clearAll(): void;
}
```

### 1.3 Create MMKV Provider (`lib/storage/mmkvProvider.ts`)

- Initialize MMKV instance with encryption support
- Create separate MMKV instances for different data types:
  - `storage.default` - general app data
  - `storage.user` - user-specific data
  - `storage.cache` - cache data (can be cleared)
  - `storage.secure` - sensitive data (encrypted)

### 1.4 Create Migration Manager (`lib/storage/migrationManager.ts`)

Handles automatic data migration:

- Check migration status flag in MMKV
- If not migrated, read all AsyncStorage keys
- Migrate data by category:
  - User data → `storage.user`
  - Cache data → `storage.cache`
  - Sensitive data → `storage.secure`
  - Everything else → `storage.default`
- Set migration complete flag
- Optional: Clear AsyncStorage after successful migration

## Phase 2: Update Storage Utilities

### 2.1 Update `app/lib/storage.ts`

Refactor the existing storage module:

- Replace direct AsyncStorage imports with `storageAdapter`
- Update `storage` object to use MMKV through adapter
- Keep same API interface for backward compatibility
- Add migration initialization in module

Current file structure to maintain:

```typescript
// Keep all existing exports:
export const STORAGE_KEYS = { ... };
export const storage = { ... };  // Now uses MMKV internally
export const userModeStorage = { ... };
export const notificationStorage = { ... };
export const chatStorage = { ... };
export const emergencyStorage = { ... };
export const realtimeStorage = { ... };
export const onboardingStorage = { ... };
export const themeStorage = { ... };
```

### 2.2 Performance Optimizations

- Use native MMKV methods for primitives instead of JSON stringify/parse
- Example: `storage.setBoolean()` instead of `storage.setItem('key', 'true')`
- Batch operations for multiple writes
- Use MMKV transactions for atomic updates

## Phase 3: Update Zustand Stores

### 3.1 Create Zustand MMKV Storage Adapter (`lib/storage/zustandMMKVAdapter.ts`)

Create a custom storage adapter for Zustand's `persist` middleware:

```typescript
import { StateStorage } from 'zustand/middleware';

export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return storage.user.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.user.setString(name, value);
  },
  removeItem: (name: string): void => {
    storage.user.delete(name);
  },
};
```

### 3.2 Update Store Configurations

Update stores that use `persist` middleware:

- `store/user/user.ts` (line 3: imports AsyncStorage)
- `store/driver.ts` (line 3: imports AsyncStorage)
- `store/vehicle/vehicle.ts` (imports AsyncStorage)
- `store/payment/payment.ts` (line 2: uses `createJSONStorage`)

Change from:

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
persist(
  (set, get) => ({ ... }),
  {
    name: 'user-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
)
```

To:

```typescript
import { mmkvStorage } from '@/lib/storage/zustandMMKVAdapter';
persist(
  (set, get) => ({ ... }),
  {
    name: 'user-storage',
    storage: mmkvStorage,
  }
)
```

## Phase 4: Update Direct AsyncStorage Usage

### 4.1 Update Cache Systems

Files to update:

- `lib/cache/CriticalDataCache.ts` (line 1)
- `lib/offline/OfflineQueue.ts` (line 1)
- `lib/map/tileCache.ts` (uses AsyncStorage)

Replace AsyncStorage calls with MMKV cache instance:

```typescript
// Before
await AsyncStorage.setItem(key, JSON.stringify(data));

// After
storage.cache.setString(key, JSON.stringify(data));
```

### 4.2 Update Service Files

Files to update:

- `app/services/firebaseService.ts`
- Other services using AsyncStorage directly

### 4.3 Update Hooks

Files to update:

- `hooks/useMapFlow.ts`
- `components/drawer/useDrawer.ts`
- `app/hooks/useNotificationsCompat.ts`

## Phase 5: Migration Initialization

### 5.1 Update Root Layout (`app/_layout.tsx`)

Add migration initialization before app renders:

```typescript
useEffect(() => {
  const initializeStorage = async () => {
    await migrationManager.checkAndMigrate();
  };
  initializeStorage();
}, []);
```

### 5.2 Add Migration Status UI (Optional)

Show migration progress for users with large datasets:

- Display loading screen during migration
- Show progress percentage
- Handle migration errors gracefully

## Phase 6: Testing and Validation

### 6.1 Create MMKV Tests

- Test storage adapter functionality
- Test migration process with mock data
- Test Zustand persistence with MMKV
- Test performance benchmarks

### 6.2 Update Existing Tests

Files with AsyncStorage mocks to update:

- `__tests__/lib/map/tileCache.test.ts`
- `__tests__/cache/CriticalDataCache.test.ts`
- `__tests__/offline/OfflineQueue.test.ts`
- `jest.setup.js` (mock AsyncStorage → mock MMKV)

### 6.3 Manual Testing

- Fresh install (no migration needed)
- Upgrade from AsyncStorage (migration needed)
- Large dataset migration (performance test)
- Offline mode with MMKV
- Store persistence after app restart

## Phase 7: Cleanup and Documentation

### 7.1 Update Dependencies

Remove AsyncStorage from `package.json`:

```bash
npm uninstall @react-native-async-storage/async-storage
```

### 7.2 Update Documentation

- Add MMKV setup instructions to README
- Document migration process
- Add performance benchmarks
- Update architecture docs with storage changes

### 7.3 Update Rules/Conventions

Update workspace rules to reflect:

- Use MMKV through storage adapter
- No direct AsyncStorage usage
- Use typed storage methods when possible

## Key Files to Create/Modify

**New Files:**

- `lib/storage/storageAdapter.ts` - Storage abstraction layer
- `lib/storage/mmkvProvider.ts` - MMKV instance management
- `lib/storage/migrationManager.ts` - Migration logic
- `lib/storage/zustandMMKVAdapter.ts` - Zustand adapter
- `__tests__/lib/storage/storageAdapter.test.ts` - Tests

**Modified Files:**

- `app/lib/storage.ts` - Update to use MMKV internally
- `store/user/user.ts` - Update Zustand persistence
- `store/driver.ts` - Update Zustand persistence
- `store/vehicle/vehicle.ts` - Update Zustand persistence
- `store/payment/payment.ts` - Update Zustand persistence
- `lib/cache/CriticalDataCache.ts` - Use MMKV cache
- `lib/offline/OfflineQueue.ts` - Use MMKV cache
- `lib/map/tileCache.ts` - Use MMKV cache
- `app/_layout.tsx` - Initialize migration
- `package.json` - Update dependencies
- `jest.setup.js` - Update mocks

## Benefits

1. **Performance**: 30x faster than AsyncStorage
2. **Type Safety**: Native support for primitives (no JSON parse/stringify)
3. **Synchronous API**: No async overhead for reads
4. **Encryption**: Built-in encryption support
5. **Smaller Bundle**: ~30KB vs AsyncStorage's larger size
6. **Better DX**: Direct access without await for most operations

## Migration Safety

- Zero data loss: Migration validates data before removing from AsyncStorage
- Rollback support: Keep AsyncStorage data until migration confirmed
- Error handling: Falls back to AsyncStorage if MMKV fails
- Gradual adoption: Can coexist with AsyncStorage during transition

### To-dos

- [ ] Install react-native-mmkv package and run pod install for iOS
- [ ] Create storage adapter interface and implementation (lib/storage/storageAdapter.ts)
- [ ] Create MMKV provider with multiple instances for different data types (lib/storage/mmkvProvider.ts)
- [ ] Create migration manager to handle AsyncStorage to MMKV data migration (lib/storage/migrationManager.ts)
- [ ] Create Zustand MMKV storage adapter for persist middleware (lib/storage/zustandMMKVAdapter.ts)
- [ ] Update app/lib/storage.ts to use MMKV through storage adapter
- [ ] Update Zustand stores (user, driver, vehicle, payment) to use MMKV adapter
- [ ] Update cache systems (CriticalDataCache, OfflineQueue, tileCache) to use MMKV
- [ ] Update services and hooks that use AsyncStorage directly
- [ ] Add migration initialization in app/_layout.tsx
- [ ] Create tests for storage adapter, migration manager, and MMKV functionality
- [ ] Update existing tests and jest.setup.js to mock MMKV instead of AsyncStorage
- [ ] Perform manual testing for fresh install, migration, and persistence scenarios
- [ ] Remove @react-native-async-storage/async-storage from package.json
- [ ] Update README, architecture docs, and workspace rules with MMKV information