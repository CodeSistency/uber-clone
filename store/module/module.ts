import { useCallback } from "react";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ModuleState, ModuleType } from "@/components/drawer/types";
import { useSplashStore, splashConfigs } from "@/store/splash";
import {
  loadDriverData,
  loadBusinessData,
  loadCustomerData,
} from "@/app/services/moduleDataService";

// Extended ModuleState with splash integration
interface ExtendedModuleState extends ModuleState {
  // Splash-related properties
  isSplashActive: boolean;
  splashProgress: number;
  currentTransition: {
    fromModule: ModuleType | null;
    toModule: ModuleType | null;
    isDataLoading: boolean;
  } | null;

  // Splash-related actions
  switchToModuleWithSplash: (module: ModuleType) => Promise<void>;
}

// Store Zustand para manejar el módulo activo del usuario
export const useModuleStore = create<ExtendedModuleState>((set, get) => ({
  currentModule: "customer", // Default module
  previousModule: null,
  isTransitioning: false,

  // Splash-related state
  isSplashActive: false,
  splashProgress: 0,
  currentTransition: null,

  // Acción principal para cambiar módulo (legacy - use switchToModuleWithSplash)
  setModule: async (module: ModuleType) => {
    console.log("[ModuleStore] setModule called with:", module);
    return get().switchToModuleWithSplash(module);
  },

  // Nueva acción para cambiar módulo con splash
  switchToModuleWithSplash: async (module: ModuleType) => {
    console.log("[ModuleStore] switchToModuleWithSplash called with:", module);

    const current = get().currentModule;
    if (current === module) {
      console.log("[ModuleStore] Module already set to:", module);
      return;
    }

    const splashStore = useSplashStore.getState();
    const splashId = `module-transition-${Date.now()}`;
    let safetyTimeout: NodeJS.Timeout | undefined;

    try {
      // Iniciar transición con splash
      set({
        currentModule: module,
        previousModule: current,
        isTransitioning: true,
        isSplashActive: true,
        splashProgress: 0,
        currentTransition: {
          fromModule: current,
          toModule: module,
          isDataLoading: true,
        },
      });

      // Mostrar splash de transición con timeout máximo de 5 segundos
      const splashConfig = splashConfigs.moduleTransition(current, module);
      splashStore.showSplash({
        id: splashId,
        type: "module_transition",
        ...splashConfig,
        progress: 0,
        duration: 5000, // Máximo 5 segundos
        moduleSpecific: {
          fromModule: current,
          toModule: module,
          dataQueries: getDataQueriesForModule(module),
        },
      });

      // Timeout de seguridad para ocultar splash después de 5 segundos
      safetyTimeout = setTimeout(() => {
        console.log("[ModuleStore] Safety timeout: hiding splash after 5 seconds");
        splashStore.hideSplash(splashId);
        set({
          isTransitioning: false,
          isSplashActive: false,
          splashProgress: 100,
          currentTransition: null,
        });
      }, 5000);

      // Cargar datos del módulo en paralelo con splash
      const dataLoader = getDataLoaderForModule(module);
      if (dataLoader) {
        console.log(`[ModuleStore] Starting data loading for module: ${module}`);
        const result = await dataLoader((completed, total, currentTask) => {
          const progress = Math.round((completed / total) * 100);
          console.log(`[ModuleStore] Data loading progress: ${progress}% - ${currentTask}`);
          set({ splashProgress: progress });
          splashStore.updateProgress(progress, splashId);

          // Actualizar el título del splash con la tarea actual
          splashStore.showSplash({
            id: splashId,
            type: "module_transition",
            ...splashConfig,
            progress,
            subtitle: `Cargando: ${currentTask}`,
            moduleSpecific: {
              fromModule: current,
              toModule: module,
              dataQueries: getDataQueriesForModule(module),
            },
          });
        });
        console.log(`[ModuleStore] Data loading completed for module: ${module}, success: ${result.success}`);

        if (!result.success) {
          console.warn(
            "[ModuleStore] Some data failed to load, but continuing:",
            result.errors,
          );
        }

        // Limpiar timeout de seguridad si la carga se completó antes
        if (safetyTimeout) clearTimeout(safetyTimeout);

        // Persistir en AsyncStorage
        await AsyncStorage.setItem("user_module", module);
        console.log("[ModuleStore] Module persisted to AsyncStorage:", module);

        // Completar splash y transición
        splashStore.hideSplash(splashId);

        set({
          isTransitioning: false,
          isSplashActive: false,
          splashProgress: 100,
          currentTransition: null,
        });

        console.log("[ModuleStore] Module transition with splash completed");
      } else {
        // Si no hay dataLoader, completar inmediatamente
        if (safetyTimeout) clearTimeout(safetyTimeout);
        splashStore.hideSplash(splashId);
        set({
          isTransitioning: false,
          isSplashActive: false,
          splashProgress: 100,
          currentTransition: null,
        });
      }
    } catch (error) {
      console.error("[ModuleStore] Error in switchToModuleWithSplash:", error);

      // Limpiar timeout de seguridad
      if (safetyTimeout) clearTimeout(safetyTimeout);

      // Ocultar splash en caso de error
      splashStore.hideSplash(splashId);

      // Revertir cambios en caso de error
      set({
        currentModule: current,
        previousModule: get().previousModule,
        isTransitioning: false,
        isSplashActive: false,
        splashProgress: 0,
        currentTransition: null,
      });
    }
  },

  // Métodos específicos para cada módulo (con splash)
  switchToCustomer: () => {
    console.log("[ModuleStore] Switching to customer module with splash");
    get().switchToModuleWithSplash("customer");
  },

  switchToBusiness: async () => {
    console.log("[ModuleStore] Switching to business module - checking permissions");

    // Check business permissions (random for demo purposes)
    const hasBusinessPermissions = Math.random() > 0.5; // 50% chance

    console.log(`[ModuleStore] Business permissions check: ${hasBusinessPermissions ? 'GRANTED' : 'DENIED'}`);

    if (hasBusinessPermissions) {
      // User has business permissions, proceed with splash transition
      console.log("[ModuleStore] Business permissions granted, proceeding with splash");
      await get().switchToModuleWithSplash("business");
    } else {
      // User doesn't have business permissions, redirect to registration after splash
      console.log("[ModuleStore] Business permissions denied, redirecting to registration");

      // Show splash for business registration
      const splashStore = useSplashStore.getState();
      const splashId = `business-registration-${Date.now()}`;

      splashStore.showSplash({
        id: splashId,
        type: "module_transition",
        title: "Registrando Negocio",
        subtitle: "Configurando cuenta comercial...",
        backgroundColor: "#10B981", // Green for business
        showProgress: true,
        duration: 5000, // 5 seconds max
        moduleSpecific: {
          fromModule: get().currentModule,
          toModule: "business",
        },
      });

      // Redirect to business registration after showing splash
      setTimeout(async () => {
        try {
          const { router } = await import('expo-router');
          router.replace("/(auth)/business-register" as any);
        } catch (error) {
          console.error("[ModuleStore] Error redirecting to business registration:", error);
        }
      }, 2000); // Show splash for 2 seconds before redirecting
    }
  },

  switchToDriver: () => {
    console.log("[ModuleStore] Switching to driver module with splash");
    get().switchToModuleWithSplash("driver");
  },

  // Reset al módulo por defecto
  resetToDefault: () => {
    console.log(
      "[ModuleStore] Resetting to default module (customer) with splash",
    );
    get().switchToModuleWithSplash("customer");
  },

  // Splash-related getters
  getIsSplashActive: () => get().isSplashActive,
  getSplashProgress: () => get().splashProgress,
  getCurrentTransition: () => get().currentTransition,
}));

// Helper functions for module transitions
const getDataQueriesForModule = (module: ModuleType): string[] => {
  switch (module) {
    case "driver":
      return [
        "Perfil de conductor",
        "Estado del vehículo",
        "Ubicación GPS",
        "Disponibilidad",
        "Historial de viajes",
      ];
    case "business":
      return [
        "Perfil del negocio",
        "Productos activos",
        "Estadísticas de ventas",
        "Inventario",
        "Pedidos pendientes",
      ];
    case "customer":
      return ["Historial de viajes", "Preferencias", "Métodos de pago"];
    default:
      return [];
  }
};

const getDataLoaderForModule = (module: ModuleType) => {
  switch (module) {
    case "driver":
      return loadDriverData;
    case "business":
      return loadBusinessData;
    case "customer":
      return loadCustomerData;
    default:
      return null;
  }
};

// Hook personalizado para transiciones de módulo con splash
export const useModuleTransition = () => {
  const moduleStore = useModuleStore();

  const switchModule = useCallback(
    async (module: ModuleType) => {
      console.log("[useModuleTransition] Switching to module:", module);
      await moduleStore.switchToModuleWithSplash(module);
    },
    [moduleStore],
  );

  const switchToDriver = useCallback(
    async () => {
      console.log("[useModuleTransition] Switching to driver module");
      await switchModule("driver");
    },
    [switchModule],
  );
  const switchToBusiness = useCallback(
    () => switchModule("business"),
    [switchModule],
  );
  const switchToCustomer = useCallback(
    () => switchModule("customer"),
    [switchModule],
  );

  return {
    // Estado
    currentModule: moduleStore.currentModule,
    previousModule: moduleStore.previousModule,
    isTransitioning: moduleStore.isTransitioning,
    isSplashActive: moduleStore.isSplashActive,
    splashProgress: moduleStore.splashProgress,
    currentTransition: moduleStore.currentTransition,

    // Acciones
    switchModule,
    switchToDriver,
    switchToBusiness,
    switchToCustomer,
    resetToDefault: () => moduleStore.resetToDefault(),
  };
};

// Función para inicializar el store desde AsyncStorage
export const initializeModuleStore = async () => {
  try {
    console.log("[ModuleStore] Initializing from AsyncStorage");
    const savedModule = await AsyncStorage.getItem("user_module");

    if (
      savedModule &&
      ["customer", "business", "driver"].includes(savedModule)
    ) {
      console.log("[ModuleStore] Loaded saved module:", savedModule);
      useModuleStore.getState().setModule(savedModule as ModuleType);
    } else {
      console.log("[ModuleStore] No saved module found, using default");
    }
  } catch (error) {
    console.error("[ModuleStore] Error initializing from AsyncStorage:", error);
  }
};

// Función para limpiar el módulo guardado (útil para logout)
export const clearModuleStore = async () => {
  try {
    console.log("[ModuleStore] Clearing saved module");
    await AsyncStorage.removeItem("user_module");
    useModuleStore.getState().resetToDefault();
  } catch (error) {
    console.error("[ModuleStore] Error clearing module:", error);
  }
};
