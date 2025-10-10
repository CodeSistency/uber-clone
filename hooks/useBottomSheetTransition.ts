/**
 * Hook para manejar transiciones suaves del BottomSheet
 * Utiliza react-native-reanimated para animaciones de altura y opacidad
 */

import { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
import { useCallback, useEffect, useRef } from 'react';
import { useMapFlowStore } from '@/store';
import { log } from '@/lib/logger';

interface BottomSheetTransitionConfig {
  duration?: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

interface BottomSheetTransitionState {
  height: number;
  opacity: number;
  isVisible: boolean;
  isAnimating: boolean;
}

export const useBottomSheetTransition = (config: BottomSheetTransitionConfig = {}) => {
  const {
    duration = 300,
    easing = 'ease-out',
    springConfig = { damping: 15, stiffness: 150, mass: 1 }
  } = config;

  // Valores animados
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  
  // Referencias para callbacks
  const onAnimationCompleteRef = useRef<(() => void) | null>(null);
  const onHeightChangeRef = useRef<((height: number) => void) | null>(null);

  // Obtener estado del store
  const { flow } = useMapFlowStore();
  const { bottomSheetVisible, bottomSheetMinHeight, bottomSheetMaxHeight, bottomSheetInitialHeight } = flow;

  // Configuración de animación basada en el easing
  const getAnimationConfig = useCallback((toValue: number) => {
    if (easing === 'spring') {
      return withSpring(toValue, springConfig);
    }
    
    const easingMap = {
      'linear': (t: number) => t,
      'ease': (t: number) => t * t * (3 - 2 * t),
      'ease-in': (t: number) => t * t,
      'ease-out': (t: number) => t * (2 - t),
      'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    };

    return withTiming(toValue, {
      duration,
      easing: easingMap[easing],
    });
  }, [duration, easing, springConfig]);

  // Función para animar la altura
  const animateHeight = useCallback((targetHeight: number, callback?: () => void) => {
    if (isAnimating.value) return;

    isAnimating.value = true;
    onAnimationCompleteRef.current = callback || null;

    log.bottomSheet.debug('Animating height', { data: { from: height.value, to: targetHeight } });

    height.value = getAnimationConfig(targetHeight);
    
    // Notificar cambio de altura
    if (onHeightChangeRef.current) {
      runOnJS(onHeightChangeRef.current)(targetHeight);
    }
  }, [height, isAnimating, getAnimationConfig]);

  // Función para animar la opacidad
  const animateOpacity = useCallback((targetOpacity: number, callback?: () => void) => {
    log.bottomSheet.debug('Animating opacity', { data: { from: opacity.value, to: targetOpacity } });

    opacity.value = getAnimationConfig(targetOpacity);
    
    if (callback) {
      setTimeout(() => {
        runOnJS(callback)();
      }, duration);
    }
  }, [opacity, getAnimationConfig, duration]);

  // Función para mostrar el BottomSheet
  const showBottomSheet = useCallback((targetHeight?: number, callback?: () => void) => {
    const finalHeight = targetHeight || bottomSheetInitialHeight;
    
    log.bottomSheet.debug('Showing BottomSheet', { data: { height: finalHeight } });
    
    // Animar opacidad primero
    animateOpacity(1, () => {
      // Luego animar altura
      animateHeight(finalHeight, callback);
    });
  }, [bottomSheetInitialHeight, animateOpacity, animateHeight]);

  // Función para ocultar el BottomSheet
  const hideBottomSheet = useCallback((callback?: () => void) => {
    log.bottomSheet.debug('Hiding BottomSheet');
    
    // Animar altura primero
    animateHeight(0, () => {
      // Luego animar opacidad
      animateOpacity(0, callback);
    });
  }, [animateHeight, animateOpacity]);

  // Función para cambiar altura sin ocultar
  const changeHeight = useCallback((targetHeight: number, callback?: () => void) => {
    if (targetHeight < bottomSheetMinHeight) {
      targetHeight = bottomSheetMinHeight;
    } else if (targetHeight > bottomSheetMaxHeight) {
      targetHeight = bottomSheetMaxHeight;
    }

    log.bottomSheet.debug('Changing height', { data: { to: targetHeight } });
    animateHeight(targetHeight, callback);
  }, [bottomSheetMinHeight, bottomSheetMaxHeight, animateHeight]);

  // Función para animar a una altura específica basada en porcentaje
  const animateToPercentage = useCallback((percentage: number, callback?: () => void) => {
    const targetHeight = (bottomSheetMaxHeight - bottomSheetMinHeight) * (percentage / 100) + bottomSheetMinHeight;
    changeHeight(targetHeight, callback);
  }, [bottomSheetMinHeight, bottomSheetMaxHeight, changeHeight]);

  // Efecto para sincronizar con el estado del store
  useEffect(() => {
    if (bottomSheetVisible) {
      showBottomSheet();
    } else {
      hideBottomSheet();
    }
  }, [bottomSheetVisible, showBottomSheet, hideBottomSheet]);

  // Efecto para manejar cambios en la altura inicial
  useEffect(() => {
    if (bottomSheetVisible && !isAnimating.value) {
      changeHeight(bottomSheetInitialHeight);
    }
  }, [bottomSheetInitialHeight, bottomSheetVisible, isAnimating, changeHeight]);

  // Callback para cuando la animación termina
  const handleAnimationComplete = useCallback(() => {
    isAnimating.value = false;
    
    if (onAnimationCompleteRef.current) {
      onAnimationCompleteRef.current();
      onAnimationCompleteRef.current = null;
    }
  }, [isAnimating]);

  // Estilos animados
  const animatedHeightStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });

  const animatedOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      opacity: opacity.value,
    };
  });

  // Estado actual
  const getCurrentState = useCallback((): BottomSheetTransitionState => {
    return {
      height: height.value,
      opacity: opacity.value,
      isVisible: bottomSheetVisible,
      isAnimating: isAnimating.value,
    };
  }, [height, opacity, bottomSheetVisible, isAnimating]);

  // Función para establecer callbacks
  const setOnHeightChange = useCallback((callback: (height: number) => void) => {
    onHeightChangeRef.current = callback;
  }, []);

  const setOnAnimationComplete = useCallback((callback: () => void) => {
    onAnimationCompleteRef.current = callback;
  }, []);

  return {
    // Valores animados
    height,
    opacity,
    isAnimating,
    
    // Estilos animados
    animatedHeightStyle,
    animatedOpacityStyle,
    animatedContainerStyle,
    
    // Funciones de control
    showBottomSheet,
    hideBottomSheet,
    changeHeight,
    animateToPercentage,
    
    // Utilidades
    getCurrentState,
    setOnHeightChange,
    setOnAnimationComplete,
    
    // Estado actual
    currentState: getCurrentState(),
  };
};

export default useBottomSheetTransition;
