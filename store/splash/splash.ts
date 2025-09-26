import { create } from "zustand";

// Splash Types and Interfaces
export type SplashType = "main" | "module_transition" | "data_loading";

export interface SplashConfig {
  id: string;
  type: SplashType;
  title?: string;
  subtitle?: string;
  image?: any; // Image source
  backgroundColor?: string;
  duration?: number; // Auto-hide duration in ms
  showProgress?: boolean;
  progress?: number; // 0-100
  actions?: {
    primary?: {
      label: string;
      onPress: () => void;
    };
    secondary?: {
      label: string;
      onPress: () => void;
    };
  };
  moduleSpecific?: {
    fromModule?: string;
    toModule?: string;
    dataQueries?: string[]; // List of data being loaded
  };
}

interface SplashState {
  // State
  activeSplash: SplashConfig | null;
  splashQueue: SplashConfig[];
  isVisible: boolean;
  globalProgress: number;

  // Actions
  showSplash: (config: SplashConfig) => void;
  hideSplash: (id?: string) => void;
  updateProgress: (progress: number, id?: string) => void;
  queueSplash: (config: SplashConfig) => void;
  clearQueue: () => void;
  setGlobalProgress: (progress: number) => void;
}

// Splash Store Implementation
export const useSplashStore = create<SplashState>((set, get) => ({
  // Initial State
  activeSplash: null,
  splashQueue: [],
  isVisible: false,
  globalProgress: 0,

  // Actions
  showSplash: (config: SplashConfig) => {
    console.log("[SplashStore] 🚀 showSplash called with:", config);

    const state = get();
    const currentSplash = state.activeSplash;

    // If there's already an active splash, queue the new one
    if (currentSplash && currentSplash.id !== config.id) {
      console.log(
        "[SplashStore] Queueing splash, active splash exists:",
        currentSplash.id,
      );
      state.queueSplash(config);
      return;
    }

    set(() => ({
      activeSplash: config,
      isVisible: true,
      globalProgress: config.progress || 0,
    }));

    // Auto-hide if duration is specified
    if (config.duration && config.duration > 0) {
      setTimeout(() => {
        state.hideSplash(config.id);
      }, config.duration);
    }
  },

  hideSplash: (id?: string) => {
    console.log("[SplashStore] 👁️ hideSplash called for id:", id);

    const state = get();
    const currentSplash = state.activeSplash;

    // If no specific id provided, hide current splash
    if (!id || (currentSplash && currentSplash.id === id)) {
      // Check if there are queued splashes
      const nextSplash =
        state.splashQueue.length > 0 ? state.splashQueue[0] : null;

      set(() => ({
        activeSplash: nextSplash,
        splashQueue: nextSplash
          ? state.splashQueue.slice(1)
          : state.splashQueue,
        isVisible: !!nextSplash,
        globalProgress: nextSplash ? nextSplash.progress || 0 : 0,
      }));

      console.log(
        "[SplashStore] Hidden splash, next in queue:",
        nextSplash?.id || "none",
      );
    }
  },

  updateProgress: (progress: number, id?: string) => {
    console.log(
      "[SplashStore] 📊 updateProgress called with:",
      progress,
      "for id:",
      id,
    );

    const state = get();
    const currentSplash = state.activeSplash;

    // Update progress for specific splash or current one
    if (!id || (currentSplash && currentSplash.id === id)) {
      set(() => ({
        activeSplash: currentSplash ? { ...currentSplash, progress } : null,
        globalProgress: progress,
      }));
    }
  },

  queueSplash: (config: SplashConfig) => {
    console.log("[SplashStore] 📋 queueSplash called with:", config.id);

    set((state) => ({
      splashQueue: [...state.splashQueue, config],
    }));
  },

  clearQueue: () => {
    console.log("[SplashStore] 🗑️ clearQueue called");

    set(() => ({
      splashQueue: [],
    }));
  },

  setGlobalProgress: (progress: number) => {
    console.log("[SplashStore] 🌍 setGlobalProgress called with:", progress);

    set(() => ({
      globalProgress: progress,
    }));
  },
}));

// Helper functions for common splash configurations
export const splashConfigs = {
  // Module transition splash
  moduleTransition: (
    fromModule: string,
    toModule: string,
  ): Partial<SplashConfig> => ({
    type: "module_transition",
    title: `Cambiando a ${toModule}`,
    subtitle: "Cargando configuración...",
    backgroundColor: "#0286FF",
    showProgress: true,
    moduleSpecific: {
      fromModule,
      toModule,
    },
  }),

  // Data loading splash
  dataLoading: (
    title: string,
    dataQueries: string[],
  ): Partial<SplashConfig> => ({
    type: "data_loading",
    title,
    subtitle: "Cargando información...",
    backgroundColor: "#10B981",
    showProgress: true,
    moduleSpecific: {
      dataQueries,
    },
  }),

  // Generic loading splash
  loading: (
    title: string = "Cargando...",
    subtitle?: string,
  ): Partial<SplashConfig> => ({
    type: "data_loading",
    title,
    subtitle: subtitle || "Por favor espera...",
    backgroundColor: "#6B7280",
    showProgress: true,
  }),
};
