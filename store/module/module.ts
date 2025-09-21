import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ModuleState, ModuleType } from "@/components/drawer/types";

// Store Zustand para manejar el módulo activo del usuario
export const useModuleStore = create<ModuleState>((set, get) => ({
  currentModule: 'customer', // Default module
  previousModule: null,
  isTransitioning: false,

  // Acción principal para cambiar módulo
  setModule: async (module: ModuleType) => {
    console.log('[ModuleStore] setModule called with:', module);

    const current = get().currentModule;
    if (current === module) {
      console.log('[ModuleStore] Module already set to:', module);
      return;
    }

    try {
      // Iniciar transición
      set({
        currentModule: module,
        previousModule: current,
        isTransitioning: true
      });

      // Persistir en AsyncStorage
      await AsyncStorage.setItem('user_module', module);
      console.log('[ModuleStore] Module persisted to AsyncStorage:', module);

      // Finalizar transición después de un breve delay para animaciones
      setTimeout(() => {
        set({ isTransitioning: false });
        console.log('[ModuleStore] Module transition completed');
      }, 300);

    } catch (error) {
      console.error('[ModuleStore] Error setting module:', error);
      // Revertir cambios en caso de error
      set({
        currentModule: current,
        previousModule: get().previousModule,
        isTransitioning: false
      });
    }
  },

  // Métodos específicos para cada módulo
  switchToCustomer: () => {
    console.log('[ModuleStore] Switching to customer module');
    get().setModule('customer');
  },

  switchToBusiness: () => {
    console.log('[ModuleStore] Switching to business module');
    get().setModule('business');
  },

  switchToDriver: () => {
    console.log('[ModuleStore] Switching to driver module');
    get().setModule('driver');
  },

  // Reset al módulo por defecto
  resetToDefault: () => {
    console.log('[ModuleStore] Resetting to default module (customer)');
    get().setModule('customer');
  },
}));

// Función para inicializar el store desde AsyncStorage
export const initializeModuleStore = async () => {
  try {
    console.log('[ModuleStore] Initializing from AsyncStorage');
    const savedModule = await AsyncStorage.getItem('user_module');

    if (savedModule && ['customer', 'business', 'driver'].includes(savedModule)) {
      console.log('[ModuleStore] Loaded saved module:', savedModule);
      useModuleStore.getState().setModule(savedModule as ModuleType);
    } else {
      console.log('[ModuleStore] No saved module found, using default');
    }
  } catch (error) {
    console.error('[ModuleStore] Error initializing from AsyncStorage:', error);
  }
};

// Función para limpiar el módulo guardado (útil para logout)
export const clearModuleStore = async () => {
  try {
    console.log('[ModuleStore] Clearing saved module');
    await AsyncStorage.removeItem('user_module');
    useModuleStore.getState().resetToDefault();
  } catch (error) {
    console.error('[ModuleStore] Error clearing module:', error);
  }
};
