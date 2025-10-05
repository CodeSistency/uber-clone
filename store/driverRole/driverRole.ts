import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { driverService } from "@/app/services/driverService";

// Types
interface DriverRoleState {
  // State
  isDriver: boolean;
  driverRole: "customer" | "driver" | "business";
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;

  // Actions
  checkDriverRole: () => Promise<void>;
  setDriverRole: (role: "customer" | "driver" | "business") => Promise<void>;
  syncWithServer: () => Promise<void>;
  clearLocalData: () => Promise<void>;
  getMigratedData: () => Promise<any>;
  clearMigrationData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Storage keys
const DRIVER_ROLE_KEY = "@driver_role";
const LAST_SYNC_KEY = "@driver_role_last_sync";

// Validation function for migrated data
const validateMigratedData = (data: any) => {
  const warnings: string[] = [];
  let isValid = true;

  // Required fields validation
  if (!data.firstName?.trim()) {
    warnings.push("First name is missing from user profile");
    isValid = false;
  }

  if (!data.lastName?.trim()) {
    warnings.push("Last name is missing from user profile");
    isValid = false;
  }

  if (!data.email?.trim()) {
    warnings.push("Email is missing from user profile");
    isValid = false;
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      warnings.push("Email format appears invalid");
    }
  }

  if (!data.phone?.trim()) {
    warnings.push("Phone number is missing from user profile");
  }

  // Optional but recommended fields
  if (!data.address?.trim()) {
    warnings.push(
      "Address is missing - will need to be completed during onboarding",
    );
  }

  if (!data.city?.trim() || !data.state?.trim()) {
    warnings.push(
      "City/State information is missing - will need to be completed during onboarding",
    );
  }

  // Age validation if dateOfBirth is available
  if (data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 18) {
      warnings.push(
        "User appears to be under 18 - driver age requirements may not be met",
      );
      isValid = false;
    } else if (age < 21) {
      warnings.push(
        "User is between 18-21 - some driver services may have restrictions",
      );
    }
  } else {
    warnings.push(
      "Date of birth is missing - age verification will be required during onboarding",
    );
  }

  return { isValid, warnings };
};

export const useDriverRoleStore = create<DriverRoleState>((set, get) => ({
  // Initial state
  isDriver: false,
  driverRole: "customer",
  isLoading: false,
  error: null,
  lastSync: null,

  // Check driver role from server and local storage with offline support
  checkDriverRole: async () => {
    const state = get();
    

    try {
      state.setLoading(true);
      state.setError(null);

      // First check local storage for cached role
      const cachedRole = await AsyncStorage.getItem(DRIVER_ROLE_KEY);
      const cachedSync = await AsyncStorage.getItem(LAST_SYNC_KEY);

      let cachedData = null;
      if (cachedRole) {
        cachedData = JSON.parse(cachedRole);
        const lastSync = cachedSync ? new Date(cachedSync) : null;

        

        // Set cached data immediately for better UX (offline-first approach)
        set({
          isDriver: cachedData.isDriver,
          driverRole: cachedData.driverRole,
          lastSync,
        });
      }

      // Try to check with server for latest status (with 5 second timeout)
      try {
        const serverStatusPromise = driverService.getStatus();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Driver role check timeout")),
            5000,
          ),
        );

        const serverStatus = (await Promise.race([
          serverStatusPromise,
          timeoutPromise,
        ])) as any;
        

        // Update state with server data
        const newRoleData = {
          isDriver: serverStatus.isDriver,
          driverRole: serverStatus.driverRole || "customer",
        };

        // Only update if server data differs from cache
        const hasChanged =
          !cachedData ||
          cachedData.isDriver !== newRoleData.isDriver ||
          cachedData.driverRole !== newRoleData.driverRole;

        if (hasChanged) {
          set({
            isDriver: newRoleData.isDriver,
            driverRole: newRoleData.driverRole as
              | "customer"
              | "driver"
              | "business",
            lastSync: new Date(),
            error: null,
          });

          // Cache the server response
          await AsyncStorage.setItem(
            DRIVER_ROLE_KEY,
            JSON.stringify(newRoleData),
          );
          await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

          
        } else {
          
          set({ lastSync: new Date() });
        }
      } catch (serverError: any) {
        

        // Handle timeout specifically - assume not a driver
        if (serverError.message === "Driver role check timeout") {
          
          set({
            isDriver: false,
            driverRole: "customer",
            error: "Verification timeout - assuming non-driver status",
          });
          return; // Exit early to prevent further processing
        }

        // If we have cached data, keep using it (offline mode)
        if (cachedData) {
          
          set({
            error: "Offline mode - using cached role data",
          });
        } else {
          // No cached data and server failed
          throw new Error(
            "Unable to verify driver role - no cached data available",
          );
        }
      }
    } catch (error: any) {
      

      // Try emergency offline check
      const emergencyCached = await AsyncStorage.getItem(DRIVER_ROLE_KEY);
      if (emergencyCached) {
        
        const emergencyData = JSON.parse(emergencyCached);
        set({
          isDriver: emergencyData.isDriver,
          driverRole: emergencyData.driverRole,
          error: "Emergency offline mode - limited functionality",
        });
      } else {
        // Complete failure
        set({
          error: error.message || "Failed to check driver role",
          isDriver: false,
          driverRole: "customer",
        });
      }
    } finally {
      state.setLoading(false);
    }
  },

  // Set driver role (used after onboarding completion)
  setDriverRole: async (role: "customer" | "driver" | "business") => {
    const state = get();
    

    try {
      const isDriver = role === "driver";
      const roleData = {
        isDriver,
        driverRole: role,
      };

      // Update state immediately
      set({
        isDriver,
        driverRole: role,
        lastSync: new Date(),
        error: null,
      });

      // Cache locally
      await AsyncStorage.setItem(DRIVER_ROLE_KEY, JSON.stringify(roleData));
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      

      // Note: Server sync would happen during next checkDriverRole call
      // or could be triggered here if needed
    } catch (error: any) {
      
      set({
        error: error.message || "Failed to set driver role",
      });
    }
  },

  // Sync local data with server (called when connection is restored)
  syncWithServer: async () => {
    const state = get();
    

    try {
      state.setLoading(true);
      state.setError(null);

      // Get current local data
      const localRole = await AsyncStorage.getItem(DRIVER_ROLE_KEY);
      const localSync = await AsyncStorage.getItem(LAST_SYNC_KEY);

      if (localRole) {
        const localData = JSON.parse(localRole);
        const lastSync = localSync ? new Date(localSync) : null;

        

        // Check if sync is needed (more than 5 minutes old)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const needsSync = !lastSync || lastSync < fiveMinutesAgo;

        if (needsSync) {
          
          await state.checkDriverRole();
        } else {
          
          set({
            error: null, // Clear any offline errors
          });
        }
      } else {
        // No local data, fetch from server
        
        await state.checkDriverRole();
      }
    } catch (error: any) {
      

      // Don't override existing offline functionality
      const currentError = get().error;
      if (!currentError || !currentError.includes("offline")) {
        set({
          error: error.message || "Failed to sync with server",
        });
      }
    } finally {
      state.setLoading(false);
    }
  },

  // Check if we're currently operating offline
  isOffline: () => {
    const state = get();
    return (
      state.error &&
      (state.error.includes("offline") ||
        state.error.includes("connection") ||
        state.error.includes("network"))
    );
  },

  // Force a fresh sync (ignore cache timestamps)
  forceSync: async () => {
    const state = get();
    

    try {
      state.setLoading(true);
      state.setError(null);

      // Clear sync timestamp to force refresh
      await AsyncStorage.removeItem(LAST_SYNC_KEY);

      // Perform fresh check
      await state.checkDriverRole();

      
    } catch (error: any) {
      
      set({
        error: error.message || "Failed to force sync",
      });
    } finally {
      state.setLoading(false);
    }
  },

  // Migrate user data to driver profile during onboarding
  migrateUserDataToDriver: async () => {
    

    try {
      // Import user store dynamically to avoid circular dependencies
      const { useUserStore } = await import("@/store/user");
      const userStore = useUserStore.getState();

      if (!userStore.user) {
        throw new Error("No user data available for migration");
      }

      const userData = userStore.user;
      

      // Map user fields to driver profile fields
      const driverProfileData = {
        // Basic info from user
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",

        // Default driver settings
        dateOfBirth: userData.dateOfBirth || null,
        address: userData.address || "",
        city: userData.city || "",
        state: userData.state || "",
        zipCode: userData.zipCode || "",

        // Driver-specific defaults
        licenseNumber: "",
        licenseExpiry: null,
        vehicleInfo: null,
        emergencyContact: {
          name: "",
          phone: "",
          relationship: "",
        },

        // Preferences
        language: userData.language || "en",
        currency: userData.currency || "USD",
        timezone: userData.timezone || "America/New_York",

        // Status
        isActive: false, // Will be activated after onboarding completion
        onboardingCompleted: false,
        documentsVerified: false,

        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      

      // Validate migrated data
      const validation = validateMigratedData(driverProfileData);
      if (!validation.isValid) {
        
        // Continue with migration but log warnings
      }

      // Cache migrated data locally for onboarding process
      const migrationKey = "@driver_migration_data";
      await AsyncStorage.setItem(
        migrationKey,
        JSON.stringify({
          userData: driverProfileData,
          migratedAt: new Date().toISOString(),
          validation,
        }),
      );

      

      return {
        success: true,
        data: driverProfileData,
        validation,
        migrationKey,
      };
    } catch (error: any) {
      
      throw new Error(`Failed to migrate user data: ${error.message}`);
    }
  },

  // Get migrated data for onboarding process
  getMigratedData: async () => {
    try {
      const migrationKey = "@driver_migration_data";
      const migratedData = await AsyncStorage.getItem(migrationKey);

      if (!migratedData) {
        return null;
      }

      const parsed = JSON.parse(migratedData);
      

      return parsed;
    } catch (error: any) {
      
      return null;
    }
  },

  // Clear migration data after successful onboarding
  clearMigrationData: async () => {
    try {
      const migrationKey = "@driver_migration_data";
      await AsyncStorage.removeItem(migrationKey);
      
    } catch (error: any) {
      
    }
  },

  // Clear all local data (logout/reset)
  clearLocalData: async () => {
    

    try {
      await AsyncStorage.removeItem(DRIVER_ROLE_KEY);
      await AsyncStorage.removeItem(LAST_SYNC_KEY);
      await AsyncStorage.removeItem("@driver_migration_data");

      set({
        isDriver: false,
        driverRole: "customer",
        lastSync: null,
        error: null,
      });

      
    } catch (error: any) {
      
      set({
        error: error.message || "Failed to clear local data",
      });
    }
  },

  // Helper actions
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
}));
