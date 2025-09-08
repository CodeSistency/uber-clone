import { create } from 'zustand';

export type MapFlowRole = 'customer' | 'driver';

export type MapFlowStep =
  | 'idle'
  | 'travel_start'
  | 'set_locations'
  | 'confirm_origin'
  | 'choose_service'
  | 'choose_driver'
  | 'summary';

interface StepConfig {
  id: MapFlowStep;
  bottomSheet: {
    visible: boolean;
    minHeight: number;
    maxHeight: number;
    initialHeight: number;
    showHandle?: boolean;
    allowDrag?: boolean;
    className?: string;
    snapPoints?: number[];
    handleHeight?: number;
  };
  mapInteraction?: 'none' | 'pan_to_confirm' | 'follow_driver' | 'follow_route';
  transition?: {
    type: 'none' | 'fade' | 'slide';
    duration?: number; // ms
  };
}

export interface MapFlowState {
  role: MapFlowRole;
  step: MapFlowStep;
  history: MapFlowStep[];
  isActive: boolean;
  stepConfig: Record<MapFlowStep, StepConfig>;

  // Derived UI state
  bottomSheetVisible: boolean;
  bottomSheetMinHeight: number;
  bottomSheetMaxHeight: number;
  bottomSheetInitialHeight: number;
  bottomSheetAllowDrag: boolean;
  bottomSheetClassName?: string;
  bottomSheetSnapPoints?: number[];
  bottomSheetHandleHeight: number;
  mapInteraction: NonNullable<StepConfig['mapInteraction']>;
  transitionType: NonNullable<NonNullable<StepConfig['transition']>['type']> | 'none';
  transitionDuration: number;

  // Actions
  start: (role: MapFlowRole) => void;
  stop: () => void;
  reset: () => void;
  goTo: (step: MapFlowStep) => void;
  next: () => void;
  back: () => void;
  updateStepBottomSheet: (step: MapFlowStep, cfg: Partial<StepConfig['bottomSheet']>) => void;
  setMapInteraction: (step: MapFlowStep, interaction: NonNullable<StepConfig['mapInteraction']>) => void;
  updateStepTransition: (step: MapFlowStep, cfg: Partial<NonNullable<StepConfig['transition']>>) => void;
}

const DEFAULT_CONFIG: Record<MapFlowStep, StepConfig> = {
  idle: {
    id: 'idle',
    bottomSheet: { visible: false, minHeight: 0, maxHeight: 0, initialHeight: 0, showHandle: false, allowDrag: true },
    mapInteraction: 'none',
    transition: { type: 'none', duration: 0 },
  },
  travel_start: {
    id: 'travel_start',
    bottomSheet: { visible: true, minHeight: 140, maxHeight: 420, initialHeight: 200, showHandle: true, allowDrag: true },
    mapInteraction: 'none',
    transition: { type: 'slide', duration: 220 },
  },
  set_locations: {
    id: 'set_locations',
    bottomSheet: { visible: true, minHeight: 160, maxHeight: 520, initialHeight: 320, showHandle: true, allowDrag: true },
    mapInteraction: 'none',
    transition: { type: 'slide', duration: 220 },
  },
  confirm_origin: {
    id: 'confirm_origin',
    bottomSheet: { visible: true, minHeight: 100, maxHeight: 260, initialHeight: 120, showHandle: true, allowDrag: false },
    mapInteraction: 'pan_to_confirm',
    transition: { type: 'fade', duration: 180 },
  },
  choose_service: {
    id: 'choose_service',
    bottomSheet: { visible: true, minHeight: 200, maxHeight: 560, initialHeight: 440, showHandle: true, allowDrag: true },
    mapInteraction: 'none',
    transition: { type: 'slide', duration: 220 },
  },
  choose_driver: {
    id: 'choose_driver',
    bottomSheet: { visible: true, minHeight: 160, maxHeight: 520, initialHeight: 380, showHandle: true, allowDrag: true },
    mapInteraction: 'follow_route',
    transition: { type: 'fade', duration: 200 },
  },
  summary: {
    id: 'summary',
    bottomSheet: { visible: true, minHeight: 180, maxHeight: 520, initialHeight: 320, showHandle: true, allowDrag: true },
    mapInteraction: 'follow_route',
    transition: { type: 'slide', duration: 220 },
  },
};

export const useMapFlowStore = create<MapFlowState>((set, get) => ({
  role: 'customer',
  step: 'idle',
  history: [],
  isActive: false,
  stepConfig: DEFAULT_CONFIG,

  bottomSheetVisible: false,
  bottomSheetMinHeight: 0,
  bottomSheetMaxHeight: 0,
  bottomSheetInitialHeight: 0,
  bottomSheetAllowDrag: true,
  bottomSheetClassName: undefined,
  bottomSheetSnapPoints: undefined,
  bottomSheetHandleHeight: 44,
  mapInteraction: 'none',
  transitionType: 'none',
  transitionDuration: 0,

  start: (role) => {
    console.log('[MapFlowStore] Starting flow with role:', role);
    const cfg = get().stepConfig['travel_start'];
    console.log('[MapFlowStore] Step config for travel_start:', cfg);
    const newState = {
      role,
      isActive: true,
      step: 'travel_start',
      history: ['travel_start'],
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || 'none',
      transitionType: cfg.transition?.type || 'none',
      transitionDuration: cfg.transition?.duration || 0,
    };
    console.log('[MapFlowStore] Setting new state:', newState);
    set(() => newState as MapFlowState);
  },

  stop: () => {
    set(() => ({
      isActive: false,
      step: 'idle',
      history: [],
      bottomSheetVisible: false,
      bottomSheetMinHeight: 0,
      bottomSheetMaxHeight: 0,
      bottomSheetInitialHeight: 0,
      bottomSheetAllowDrag: true,
      bottomSheetClassName: undefined,
      bottomSheetSnapPoints: undefined,
      bottomSheetHandleHeight: 44,
      mapInteraction: 'none',
      transitionType: 'none',
      transitionDuration: 0,
    }));
  },

  reset: () => {
    const cfg = get().stepConfig['idle'];
    set(() => ({
      step: 'idle',
      history: [],
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || 'none',
      transitionType: cfg.transition?.type || 'none',
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  goTo: (step) => {
    const cfg = get().stepConfig[step];
    set((state) => ({
      step,
      history: [...state.history, step],
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      bottomSheetSnapPoints: cfg.bottomSheet.snapPoints,
      bottomSheetHandleHeight: cfg.bottomSheet.handleHeight ?? 44,
      mapInteraction: cfg.mapInteraction || 'none',
      transitionType: cfg.transition?.type || 'none',
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  next: () => {
    const order: MapFlowStep[] = [
      'travel_start',
      'set_locations',
      'confirm_origin',
      'choose_service',
      'choose_driver',
      'summary',
    ];
    const current = get().step;
    const idx = order.indexOf(current);
    const nextStep = order[Math.min(idx + 1, order.length - 1)];
    get().goTo(nextStep);
  },

  back: () => {
    const state = get();
    const history = [...state.history];
    history.pop(); // remove current
    const previous = history[history.length - 1] || 'travel_start';
    const cfg = state.stepConfig[previous];
    set(() => ({
      step: previous,
      history,
      bottomSheetVisible: cfg.bottomSheet.visible,
      bottomSheetMinHeight: cfg.bottomSheet.minHeight,
      bottomSheetMaxHeight: cfg.bottomSheet.maxHeight,
      bottomSheetInitialHeight: cfg.bottomSheet.initialHeight,
      bottomSheetAllowDrag: cfg.bottomSheet.allowDrag ?? true,
      bottomSheetClassName: cfg.bottomSheet.className,
      mapInteraction: cfg.mapInteraction || 'none',
      transitionType: cfg.transition?.type || 'none',
      transitionDuration: cfg.transition?.duration || 0,
    }));
  },

  updateStepBottomSheet: (step, cfg) => {
    set((state) => {
      const prev = state.stepConfig[step];
      const nextCfg: StepConfig = {
        ...prev,
        bottomSheet: { ...prev.bottomSheet, ...cfg },
      };
      const stepConfig = { ...state.stepConfig, [step]: nextCfg };
      const isCurrent = state.step === step;
      return {
        stepConfig,
        ...(isCurrent
          ? {
              bottomSheetVisible: nextCfg.bottomSheet.visible,
              bottomSheetMinHeight: nextCfg.bottomSheet.minHeight,
              bottomSheetMaxHeight: nextCfg.bottomSheet.maxHeight,
              bottomSheetInitialHeight: nextCfg.bottomSheet.initialHeight,
              bottomSheetAllowDrag: nextCfg.bottomSheet.allowDrag ?? true,
              bottomSheetClassName: nextCfg.bottomSheet.className,
              bottomSheetSnapPoints: nextCfg.bottomSheet.snapPoints,
              bottomSheetHandleHeight: nextCfg.bottomSheet.handleHeight ?? 44,
            }
          : {}),
      } as Partial<MapFlowState> as MapFlowState;
    });
  },

  setMapInteraction: (step, interaction) => {
    set((state) => {
      const prev = state.stepConfig[step];
      const nextCfg: StepConfig = { ...prev, mapInteraction: interaction };
      const stepConfig = { ...state.stepConfig, [step]: nextCfg };
      const isCurrent = state.step === step;
      return {
        stepConfig,
        ...(isCurrent ? { mapInteraction: interaction } : {}),
      } as Partial<MapFlowState> as MapFlowState;
    });
  },

  updateStepTransition: (step, cfg) => {
    set((state) => {
      const prev = state.stepConfig[step];
      const nextCfg: StepConfig = {
        ...prev,
        transition: { ...(prev.transition || { type: 'none', duration: 0 }), ...cfg },
      };
      const stepConfig = { ...state.stepConfig, [step]: nextCfg };
      const isCurrent = state.step === step;
      return {
        stepConfig,
        ...(isCurrent
          ? {
              transitionType: nextCfg.transition?.type || 'none',
              transitionDuration: nextCfg.transition?.duration || 0,
            }
          : {}),
      } as Partial<MapFlowState> as MapFlowState;
    });
  },
}));


