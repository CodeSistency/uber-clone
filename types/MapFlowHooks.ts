import { SharedValue } from 'react-native-reanimated';
import { StepConfig } from '@/store/mapFlow';

export interface MapFlowBottomSheetReturn {
  // Métodos de control
  goToSnapPoint: (index: number) => void;
  goToHeight: (height: number) => void;
  scrollUpComplete: () => void;
  scrollDownComplete: () => void;
  
  // Métodos de estado
  getCurrentHeight: () => number;
  isAtMaxHeight: () => boolean;
  isAtMinHeight: () => boolean;
  
  // Control de scroll
  enableScroll: () => void;
  disableScroll: () => void;
  scrollEnabled: boolean;
  
  // Estado actual
  isActive: boolean;
  isClosed: boolean;
  isExpanded: boolean;
  isCollapsed: boolean;
  
  // Valores animados
  animatedIndex: SharedValue<number>;
  animatedPosition: SharedValue<number>;
  animatedContentHeight: SharedValue<number>;
}

export interface MapFlowAnimatedValuesReturn {
  animatedIndex: SharedValue<number>;
  animatedPosition: SharedValue<number>;
  animatedContentHeight: SharedValue<number>;
  animatedHeight: any;
  animatedOpacity: any;
  animatedTranslateY: any;
}

export interface MapFlowScrollControlReturn {
  scrollEnabled: boolean;
  handlePanningEnabled: boolean;
  contentPanningEnabled: boolean;
  enableScroll: () => void;
  disableScroll: () => void;
  enableHandlePanning: () => void;
  disableHandlePanning: () => void;
  enableContentPanning: () => void;
  disableContentPanning: () => void;
}

export interface MapFlowBackgroundReturn {
  useGradient: boolean;
  useBlur: boolean;
  gradientColors: string[];
  blurIntensity: number;
  blurTint: 'light' | 'dark' | 'default';
  gradientBackground: any;
  blurBackground: any;
}

export interface MapFlowFooterReturn {
  footerStyle: any;
  bottomBar: React.ReactNode;
  bottomBarHeight: number;
  showBottomBarAt: number;
}

export interface MapFlowSnapPointsReturn {
  snapPoints: string[];
  calculateSnapPoints: () => string[];
}

export interface MapFlowAnimationConfigReturn {
  animationConfig: {
    duration: number;
    easing: any;
  };
  transitionType: string;
  transitionDuration: number;
}



