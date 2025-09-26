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

      // Mostrar splash de transición
      const splashConfig = splashConfigs.moduleTransition(current, module);
      splashStore.showSplash({
        id: `module-transition-${Date.now()}`,
        type: "module_transition",
        ...splashConfig,
        progress: 0,
        moduleSpecific: {
          fromModule: current,
          toModule: module,
          dataQueries: getDataQueriesForModule(module),
        },
      });

      // Cargar datos del módulo en paralelo con splash
      const dataLoader = getDataLoaderForModule(module);
      if (dataLoader) {
        const result = await dataLoader((completed, total, currentTask) => {
          const progress = Math.round((completed / total) * 100);
          set({ splashProgress: progress });
          splashStore.updateProgress(
            progress,
            `module-transition-${Date.now()}`,
          );

          // Actualizar el título del splash con la tarea actual
          splashStore.showSplash({
            id: `module-transition-${Date.now()}`,
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

        if (!result.success) {
          console.warn(
            "[ModuleStore] Some data failed to load, but continuing:",
            result.errors,
          );
        }
      }

      // Persistir en AsyncStorage
      await AsyncStorage.setItem("user_module", module);
      console.log("[ModuleStore] Module persisted to AsyncStorage:", module);

      // Completar splash y transición
      splashStore.hideSplash(`module-transition-${Date.now()}`);

      set({
        isTransitioning: false,
        isSplashActive: false,
        splashProgress: 100,
        currentTransition: null,
      });

      console.log("[ModuleStore] Module transition with splash completed");
    } catch (error) {
      console.error("[ModuleStore] Error in switchToModuleWithSplash:", error);

      // Ocultar splash en caso de error
      splashStore.hideSplash(`module-transition-${Date.now()}`);

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

  switchToBusiness: () => {
    console.log("[ModuleStore] Switching to business module with splash");
    get().switchToModuleWithSplash("business");
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
    () => switchModule("driver"),
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
