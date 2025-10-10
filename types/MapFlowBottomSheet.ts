import { MapFlowStep } from '@/store';
import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface GorhomMapFlowBottomSheetProps {
  // Props del MapFlow (mantener compatibilidad)
  visible: boolean;
  minHeight: number;
  maxHeight: number;
  initialHeight: number;
  showHandle?: boolean;
  allowDrag?: boolean;
  onClose?: () => void;
  
  // Props adicionales de @gorhom/bottom-sheet
  snapPoints?: string[];
  enableOverDrag?: boolean;
  enablePanDownToClose?: boolean;
  
  // Props de contenido
  children: ReactNode;
  className?: string;
  
  // Props de configuración
  step?: MapFlowStep;
  useGradient?: boolean;
  useBlur?: boolean;
  bottomBar?: ReactNode;
}

export interface MapFlowBackgroundProps {
  step?: MapFlowStep;
  useGradient?: boolean;
  useBlur?: boolean;
  gradientColors?: string[];
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

export interface MapFlowFooterProps {
  step?: MapFlowStep;
  bottomBar?: ReactNode;
  bottomBarHeight?: number;
  showBottomBarAt?: number;
}

export interface MapFlowHandleProps {
  step?: MapFlowStep;
  style?: ViewStyle;
  children?: ReactNode;
}

export interface MapFlowContentProps {
  children: ReactNode;
  style?: ViewStyle;
  className?: string;
}



