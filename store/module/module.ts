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
    
    return get().switchToModuleWithSplash(module);
  },

  // Nueva acción para cambiar módulo con splash
  switchToModuleWithSplash: async (module: ModuleType) => {
    

    const current = get().currentModule;
    if (current === module) {
      
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
        
        const result = await dataLoader((completed, total, currentTask) => {
          const progress = Math.round((completed / total) * 100);
          
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
        

        if (!result.success) {
          
        }

        // Limpiar timeout de seguridad si la carga se completó antes
        if (safetyTimeout) clearTimeout(safetyTimeout);

        // Persistir en AsyncStorage
        await AsyncStorage.setItem("user_module", module);
        

        // Completar splash y transición
        splashStore.hideSplash(splashId);

        set({
          isTransitioning: false,
          isSplashActive: false,
          splashProgress: 100,
          currentTransition: null,
        });

        
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
    
    get().switchToModuleWithSplash("customer");
  },

  switchToBusiness: async () => {
    

    // Check business permissions (random for demo purposes)
    const hasBusinessPermissions = Math.random() > 0.5; // 50% chance

    

    if (hasBusinessPermissions) {
      // User has business permissions, proceed with splash transition
      
      await get().switchToModuleWithSplash("business");
    } else {
      // User doesn't have business permissions, redirect to registration after splash
      

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
          const { router } = await import("expo-router");
          router.replace("/(auth)/business-register" as any);
        } catch (error) {
          
        }
      }, 2000); // Show splash for 2 seconds before redirecting
    }
  },

  switchToDriver: () => {
    
    get().switchToModuleWithSplash("driver");
  },

  // Reset al módulo por defecto
  resetToDefault: () => {
    
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
      
      await moduleStore.switchToModuleWithSplash(module);
    },
    [moduleStore],
  );

  const switchToDriver = useCallback(async () => {
    
    await switchModule("driver");
  }, [switchModule]);
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
    
    const savedModule = await AsyncStorage.getItem("user_module");

    if (
      savedModule &&
      ["customer", "business", "driver"].includes(savedModule)
    ) {
      
      useModuleStore.getState().setModule(savedModule as ModuleType);
    } else {
      
    }
  } catch (error) {
    
  }
};

// Función para limpiar el módulo guardado (útil para logout)
export const clearModuleStore = async () => {
  try {
    
    await AsyncStorage.removeItem("user_module");
    useModuleStore.getState().resetToDefault();
  } catch (error) {
    
  }
};
