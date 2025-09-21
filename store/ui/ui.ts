import { create } from "zustand";
import React from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { themeStorage } from "@/app/lib/storage";

// Advanced UI Events Store
interface UIEvent {
  id: string;
  type: 'loading' | 'error' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  autoHide?: boolean;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  variant?: 'default' | 'filled' | 'outlined';
  action?: {
    label: string;
    onPress: () => void;
    variant?: 'default' | 'destructive';
  };
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'default' | 'destructive' | 'secondary';
  }>;
  persistent?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  icon?: string;
  progress?: number; // 0-100 for progress bars
  category?: string; // For grouping notifications
}

// Bottom Sheet Interface
interface BottomSheetConfig {
  id: string;
  title?: string;
  content: React.ReactNode;
  height?: 'auto' | 'half' | 'full' | number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  backdropClose?: boolean;
  draggable?: boolean;
  snapPoints?: number[];
  onClose?: () => void;
  onOpen?: () => void;
}

// Modal Interface
interface ModalConfig {
  id: string;
  title?: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  variant?: 'default' | 'confirmation' | 'destructive';
  showCloseButton?: boolean;
  backdropClose?: boolean;
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'default' | 'destructive' | 'secondary';
    disabled?: boolean;
  }>;
  onClose?: () => void;
  onOpen?: () => void;
}

// Snackbar Interface
interface SnackbarConfig {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  action?: {
    label: string;
    onPress: () => void;
  };
  showCloseButton?: boolean;
  persistent?: boolean;
}

// Loading States
interface LoadingState {
  id: string;
  type: 'spinner' | 'pulse' | 'bars' | 'dots' | 'skeleton';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  overlay?: boolean;
  progress?: number;
}

// Progress Indicator
interface ProgressConfig {
  id: string;
  type: 'linear' | 'circular' | 'steps';
  value: number;
  max?: number;
  label?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  steps?: Array<{
    label: string;
    completed: boolean;
    active: boolean;
  }>;
}

interface UIStore {
  // Events System
  events: UIEvent[];
  globalLoading: boolean;
  globalLoadingMessage: string;

  // Advanced UI Components
  bottomSheets: BottomSheetConfig[];
  modals: ModalConfig[];
  snackbars: SnackbarConfig[];
  loadingStates: LoadingState[];
  progressIndicators: ProgressConfig[];

  // Theme state
  theme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;

  // Event Actions
  showLoading: (message?: string, options?: Partial<Pick<UIEvent, 'position' | 'variant' | 'duration'>>) => string;
  hideLoading: (id?: string) => void;
  showError: (title: string, message: string, action?: UIEvent['action'], options?: Partial<Pick<UIEvent, 'position' | 'variant' | 'duration' | 'persistent' | 'autoHide'>>) => string;
  showSuccess: (title: string, message: string, action?: UIEvent['action'], options?: Partial<Pick<UIEvent, 'position' | 'variant' | 'duration' | 'persistent' | 'autoHide'>>) => string;
  showInfo: (title: string, message: string, action?: UIEvent['action'], options?: Partial<Pick<UIEvent, 'position' | 'variant' | 'duration' | 'persistent' | 'autoHide'>>) => string;
  showWarning: (title: string, message: string, action?: UIEvent['action'], options?: Partial<Pick<UIEvent, 'position' | 'variant' | 'duration' | 'persistent' | 'autoHide'>>) => string;

  // Advanced Event Actions
  showAdvancedToast: (config: Omit<UIEvent, 'id' | 'timestamp'>) => string;
  updateEvent: (id: string, updates: Partial<UIEvent>) => void;

  // Bottom Sheet Actions
  showBottomSheet: (config: Omit<BottomSheetConfig, 'id'>) => string;
  hideBottomSheet: (id: string) => void;
  updateBottomSheet: (id: string, updates: Partial<BottomSheetConfig>) => void;

  // Modal Actions
  showModal: (config: Omit<ModalConfig, 'id'>) => string;
  hideModal: (id: string) => void;
  updateModal: (id: string, updates: Partial<ModalConfig>) => void;

  // Snackbar Actions
  showSnackbar: (config: Omit<SnackbarConfig, 'id'>) => string;
  hideSnackbar: (id: string) => void;
  updateSnackbar: (id: string, updates: Partial<SnackbarConfig>) => void;

  // Loading State Actions
  showLoadingState: (config: Omit<LoadingState, 'id'>) => string;
  hideLoadingState: (id: string) => void;
  updateLoadingState: (id: string, updates: Partial<LoadingState>) => void;

  // Progress Indicator Actions
  showProgress: (config: Omit<ProgressConfig, 'id'>) => string;
  hideProgress: (id: string) => void;
  updateProgress: (id: string, updates: Partial<ProgressConfig>) => void;

  // General Actions
  dismissEvent: (id: string) => void;
  clearAllEvents: () => void;
  clearAllUI: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // State
  events: [],
  globalLoading: false,
  globalLoadingMessage: "Loading...",
  bottomSheets: [],
  modals: [],
  snackbars: [],
  loadingStates: [],
  progressIndicators: [],

  // Theme state defaults to system preference
  theme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  systemTheme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',

  setTheme: async (theme) => {
    const resolved = theme === 'system' ? (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light') : theme;
    try {
      await themeStorage.saveTheme(theme);
    } catch {}
    set(() => ({ theme: resolved }));
  },

  toggleTheme: async () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    await get().setTheme(next);
  },

  loadTheme: async () => {
    try {
      const saved = await themeStorage.getTheme();
      const system = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
      set(() => ({ systemTheme: system }));
      if (saved) {
        await get().setTheme(saved);
      } else {
        set(() => ({ theme: system }));
      }
    } catch {
      const system = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
      set(() => ({ theme: system, systemTheme: system }));
    }
  },

  // Event Actions
  showLoading: (message = "Loading...", options = {}) => {
    console.log("[UIStore] Showing loading:", message);
    const id = `loading_${Date.now()}_${Math.random()}`;
    set((state) => ({
      events: [...state.events, {
        id,
        type: 'loading',
        title: 'Loading',
        message,
        timestamp: Date.now(),
        position: options.position || 'top',
        variant: options.variant || 'default',
        autoHide: false,
        duration: options.duration,
      }],
    }));
    return id;
  },

  hideLoading: (id) => {
    console.log("[UIStore] Hiding loading:", id);
    set((state) => ({
      events: id
        ? state.events.filter(event => event.id !== id)
        : state.events.filter(event => event.type !== 'loading'),
    }));
  },

  showError: (title, message, action, options = {}) => {
    console.log("[UIStore] Showing error:", title, message);
    const id = `error_${Date.now()}_${Math.random()}`;
    set((state) => ({
      events: [...state.events, {
        id,
        type: 'error',
        title,
        message,
        timestamp: Date.now(),
        autoHide: options.persistent ? false : (options.autoHide ?? false),
        duration: options.duration,
        position: options.position || 'top',
        variant: options.variant || 'default',
        persistent: options.persistent || true,
        priority: 'high',
        action,
      }],
    }));
    return id;
  },

  showSuccess: (title, message, action, options = {}) => {
    console.log("[UIStore] Showing success:", title, message);
    const id = `success_${Date.now()}_${Math.random()}`;
    set((state) => ({
      events: [...state.events, {
        id,
        type: 'success',
        title,
        message,
        timestamp: Date.now(),
        autoHide: options.persistent ? false : (options.autoHide ?? true),
        duration: options.duration || 3000,
        position: options.position || 'top',
        variant: options.variant || 'default',
        priority: 'normal',
        action,
      }],
    }));
    return id;
  },

  showInfo: (title, message, action, options = {}) => {
    console.log("[UIStore] Showing info:", title, message);
    const id = `info_${Date.now()}_${Math.random()}`;
    set((state) => ({
      events: [...state.events, {
        id,
        type: 'info',
        title,
        message,
        timestamp: Date.now(),
        autoHide: options.persistent ? false : (options.autoHide ?? true),
        duration: options.duration || 2000,
        position: options.position || 'top',
        variant: options.variant || 'default',
        priority: 'low',
        action,
      }],
    }));
    return id;
  },

  showWarning: (title, message, action, options = {}) => {
    console.log("[UIStore] Showing warning:", title, message);
    const id = `warning_${Date.now()}_${Math.random()}`;
    set((state) => ({
      events: [...state.events, {
        id,
        type: 'warning',
        title,
        message,
        timestamp: Date.now(),
        autoHide: options.persistent ? false : (options.autoHide ?? true),
        duration: options.duration || 4000,
        position: options.position || 'top',
        variant: options.variant || 'default',
        priority: 'normal',
        action,
      }],
    }));
    return id;
  },

  showAdvancedToast: (config) => {
    console.log("[UIStore] Showing advanced toast:", config.title);
    const id = `toast_${Date.now()}_${Math.random()}`;
    set((state) => ({
      events: [...state.events, {
        ...config,
        id,
        timestamp: Date.now(),
        autoHide: config.autoHide ?? true,
        duration: config.duration || 3000,
        position: config.position || 'top',
        variant: config.variant || 'default',
        priority: config.priority || 'normal',
      }],
    }));
    return id;
  },

  updateEvent: (id, updates) => {
    console.log("[UIStore] Updating event:", id, updates);
    set((state) => ({
      events: state.events.map(event =>
        event.id === id ? { ...event, ...updates } : event
      ),
    }));
  },

  // Bottom Sheet Actions
  showBottomSheet: (config) => {
    console.log("[UIStore] Showing bottom sheet:", config.title);
    const id = `bottomsheet_${Date.now()}_${Math.random()}`;
    set((state) => ({
      bottomSheets: [...state.bottomSheets, {
        ...config,
        id,
        height: config.height || 'auto',
        showHandle: config.showHandle ?? true,
        showCloseButton: config.showCloseButton ?? true,
        backdropClose: config.backdropClose ?? true,
        draggable: config.draggable ?? true,
      }],
    }));
    return id;
  },

  hideBottomSheet: (id) => {
    console.log("[UIStore] Hiding bottom sheet:", id);
    set((state) => ({
      bottomSheets: state.bottomSheets.filter(sheet => sheet.id !== id),
    }));
  },

  updateBottomSheet: (id, updates) => {
    console.log("[UIStore] Updating bottom sheet:", id, updates);
    set((state) => ({
      bottomSheets: state.bottomSheets.map(sheet =>
        sheet.id === id ? { ...sheet, ...updates } : sheet
      ),
    }));
  },

  // Modal Actions
  showModal: (config) => {
    console.log("[UIStore] Showing modal:", config.title);
    const id = `modal_${Date.now()}_${Math.random()}`;
    set((state) => ({
      modals: [...state.modals, {
        ...config,
        id,
        size: config.size || 'md',
        variant: config.variant || 'default',
        showCloseButton: config.showCloseButton ?? true,
        backdropClose: config.backdropClose ?? true,
      }],
    }));
    return id;
  },

  hideModal: (id) => {
    console.log("[UIStore] Hiding modal:", id);
    set((state) => ({
      modals: state.modals.filter(modal => modal.id !== id),
    }));
  },

  updateModal: (id, updates) => {
    console.log("[UIStore] Updating modal:", id, updates);
    set((state) => ({
      modals: state.modals.map(modal =>
        modal.id === id ? { ...modal, ...updates } : modal
      ),
    }));
  },

  // Snackbar Actions
  showSnackbar: (config) => {
    console.log("[UIStore] Showing snackbar:", config.message);
    const id = `snackbar_${Date.now()}_${Math.random()}`;
    set((state) => ({
      snackbars: [...state.snackbars, {
        ...config,
        id,
        type: config.type || 'info',
        duration: config.duration || 4000,
        position: config.position || 'bottom',
        showCloseButton: config.showCloseButton ?? true,
        persistent: config.persistent || false,
      }],
    }));
    return id;
  },

  hideSnackbar: (id) => {
    console.log("[UIStore] Hiding snackbar:", id);
    set((state) => ({
      snackbars: state.snackbars.filter(snackbar => snackbar.id !== id),
    }));
  },

  updateSnackbar: (id, updates) => {
    console.log("[UIStore] Updating snackbar:", id, updates);
    set((state) => ({
      snackbars: state.snackbars.map(snackbar =>
        snackbar.id === id ? { ...snackbar, ...updates } : snackbar
      ),
    }));
  },

  // Loading State Actions
  showLoadingState: (config) => {
    console.log("[UIStore] Showing loading state:", config.type);
    const id = `loading_${Date.now()}_${Math.random()}`;
    set((state) => ({
      loadingStates: [...state.loadingStates, {
        ...config,
        id,
        type: config.type || 'spinner',
        size: config.size || 'md',
        overlay: config.overlay || false,
      }],
    }));
    return id;
  },

  hideLoadingState: (id) => {
    console.log("[UIStore] Hiding loading state:", id);
    set((state) => ({
      loadingStates: state.loadingStates.filter(loading => loading.id !== id),
    }));
  },

  updateLoadingState: (id, updates) => {
    console.log("[UIStore] Updating loading state:", id, updates);
    set((state) => ({
      loadingStates: state.loadingStates.map(loading =>
        loading.id === id ? { ...loading, ...updates } : loading
      ),
    }));
  },

  // Progress Indicator Actions
  showProgress: (config) => {
    console.log("[UIStore] Showing progress:", config.type);
    const id = `progress_${Date.now()}_${Math.random()}`;
    set((state) => ({
      progressIndicators: [...state.progressIndicators, {
        ...config,
        id,
        type: config.type || 'linear',
        size: config.size || 'md',
        showPercentage: config.showPercentage || false,
      }],
    }));
    return id;
  },

  hideProgress: (id) => {
    console.log("[UIStore] Hiding progress:", id);
    set((state) => ({
      progressIndicators: state.progressIndicators.filter(progress => progress.id !== id),
    }));
  },

  updateProgress: (id, updates) => {
    console.log("[UIStore] Updating progress:", id, updates);
    set((state) => ({
      progressIndicators: state.progressIndicators.map(progress =>
        progress.id === id ? { ...progress, ...updates } : progress
      ),
    }));
  },

  // General Actions
  dismissEvent: (id) => {
    console.log("[UIStore] Dismissing event:", id);
    set((state) => ({
      events: state.events.filter(event => event.id !== id),
    }));
  },

  clearAllEvents: () => {
    console.log("[UIStore] Clearing all events");
    set(() => ({
      events: [],
    }));
  },

  clearAllUI: () => {
    console.log("[UIStore] Clearing all UI");
    set(() => ({
      events: [],
      bottomSheets: [],
      modals: [],
      snackbars: [],
      loadingStates: [],
      progressIndicators: [],
      globalLoading: false,
    }));
  },

  setGlobalLoading: (loading, message = "Loading...") => {
    console.log("[UIStore] Setting global loading:", loading, message);
    set(() => ({
      globalLoading: loading,
      globalLoadingMessage: message,
    }));
  },
}));
