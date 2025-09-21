import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Animated, PanResponder, ViewProps, View, Text, TouchableOpacity } from 'react-native';

// Hook para controlar el BottomSheet
export interface BottomSheetMethods {
  scrollUpComplete: () => void;
  scrollDownComplete: () => void;
  goToSnapPoint: (index: number) => void;
  goToHeight: (height: number) => void;
  enableScroll: () => void;
  disableScroll: () => void;
  getCurrentHeight: () => number;
  isAtMaxHeight: () => boolean;
  isAtMinHeight: () => boolean;
}

interface BottomSheetConfig {
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
  snapPoints?: number[];
  animationConfig?: {
    duration?: number;
    easing?: any;
    bounciness?: number;
    speed?: number;
  };
}

export const useBottomSheet = (config: BottomSheetConfig = {}) => {
  const {
    minHeight = 120,
    maxHeight = 600,
    initialHeight = 300,
    snapPoints = [],
    animationConfig = {}
  } = config;

  const heightAnim = useRef(new Animated.Value(initialHeight)).current;
  const currentHeight = useRef(initialHeight);
  const scrollEnabled = useRef(true);

  // Default animation config
  const defaultAnimConfig = {
    bounciness: 8,
    speed: 12,
    ...animationConfig
  };

  // Listener para actualizar currentHeight
  useEffect(() => {
    const id = heightAnim.addListener(({ value }) => {
      currentHeight.current = value;
    });
    return () => heightAnim.removeListener(id);
  }, [heightAnim]);

  // Función de animación suave
  const animateTo = useCallback((toValue: number, customConfig?: any) => {
    const clampedValue = Math.max(minHeight, Math.min(maxHeight, toValue));

    console.log(`[useBottomSheet] Animating from ${currentHeight.current} to ${clampedValue}`);

    Animated.spring(heightAnim, {
      toValue: clampedValue,
      useNativeDriver: false,
      ...defaultAnimConfig,
      ...customConfig,
    }).start();
  }, [heightAnim, minHeight, maxHeight, defaultAnimConfig]);

  // Métodos de control
  const scrollUpComplete = useCallback(() => {
    console.log('[useBottomSheet] scrollUpComplete called');
    animateTo(maxHeight);
  }, [animateTo, maxHeight]);

  const scrollDownComplete = useCallback(() => {
    console.log('[useBottomSheet] scrollDownComplete called');
    animateTo(minHeight);
  }, [animateTo, minHeight]);

  const goToSnapPoint = useCallback((index: number) => {
    if (!snapPoints || snapPoints.length === 0) {
      console.warn('[useBottomSheet] No snap points defined');
      return;
    }

    if (index < 0 || index >= snapPoints.length) {
      console.warn(`[useBottomSheet] Invalid snap point index: ${index}`);
      return;
    }

    const targetHeight = snapPoints[index];
    console.log(`[useBottomSheet] Going to snap point ${index}: ${targetHeight}`);
    animateTo(targetHeight);
  }, [snapPoints, animateTo]);

  const goToHeight = useCallback((height: number) => {
    console.log(`[useBottomSheet] Going to height: ${height}`);
    animateTo(height);
  }, [animateTo]);

  const enableScroll = useCallback(() => {
    console.log('[useBottomSheet] Scroll enabled');
    scrollEnabled.current = true;
  }, []);

  const disableScroll = useCallback(() => {
    console.log('[useBottomSheet] Scroll disabled');
    scrollEnabled.current = false;
  }, []);

  const getCurrentHeight = useCallback(() => {
    return currentHeight.current;
  }, []);

  const isAtMaxHeight = useCallback(() => {
    return Math.abs(currentHeight.current - maxHeight) < 5; // 5px tolerance
  }, [maxHeight]);

  const isAtMinHeight = useCallback(() => {
    return Math.abs(currentHeight.current - minHeight) < 5; // 5px tolerance
  }, [minHeight]);

  const methods: BottomSheetMethods = {
    scrollUpComplete,
    scrollDownComplete,
    goToSnapPoint,
    goToHeight,
    enableScroll,
    disableScroll,
    getCurrentHeight,
    isAtMaxHeight,
    isAtMinHeight,
  };

  return {
    heightAnim,
    methods,
    currentHeight: currentHeight.current,
    scrollEnabled: scrollEnabled.current,
  };
};

interface InlineBottomSheetProps extends ViewProps {
  visible: boolean;
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
  allowDrag?: boolean;
  showHandle?: boolean;
  onClose?: () => void;
  snapPoints?: number[];
  className?: string;
}

const InlineBottomSheet = forwardRef<BottomSheetMethods, InlineBottomSheetProps>(({
  visible,
  minHeight = 120,
  maxHeight = 600,
  initialHeight = 300,
  allowDrag = true,
  showHandle = true,
  onClose,
  snapPoints,
  className = '',
  children,
  ...props
}, ref) => {
  console.log('[InlineBottomSheet] ===== COMPONENT MOUNTED =====');
  console.log('[InlineBottomSheet] Received props:', {
    visible,
    minHeight,
    maxHeight,
    initialHeight,
    allowDrag,
    showHandle,
    snapPoints,
    className,
    hasChildren: !!children,
    extraProps: Object.keys(props).length > 0 ? props : 'none'
  });

  // Usar hook si se proporciona ref, sino usar lógica interna
  const useHook = !!ref;

  const hookData = useBottomSheet({
    minHeight,
    maxHeight,
    initialHeight,
    snapPoints,
  });

  const heightAnim = useHook ? hookData.heightAnim : useRef(new Animated.Value(initialHeight)).current;
  const startHeightRef = useRef(initialHeight);
  const currentHeightRef = useRef(initialHeight);

  useEffect(() => {
    console.log('[InlineBottomSheet] Setting up height listener');
    const id = heightAnim.addListener(({ value }) => {
      currentHeightRef.current = value;
      console.log('[InlineBottomSheet] Height changed to:', value);
    });
    return () => {
      console.log('[InlineBottomSheet] Removing height listener');
      heightAnim.removeListener(id);
    };
  }, [heightAnim]);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const animateTo = (toValue: number) => {
    if (useHook) {
      // Usar método del hook para animación suave
      hookData.methods.goToHeight(toValue);
    } else {
      // Usar animación interna
      Animated.spring(heightAnim, {
        toValue,
        useNativeDriver: false,
        bounciness: 0,
      }).start();
    }
  };

  // Exponer métodos del hook cuando se usa ref
  useImperativeHandle(ref, () => {
    if (useHook) {
      return hookData.methods;
    } else {
      // Crear métodos básicos cuando no se usa hook
      return {
        scrollUpComplete: () => animateTo(maxHeight),
        scrollDownComplete: () => animateTo(minHeight),
        goToSnapPoint: (index: number) => {
          if (snapPoints && snapPoints[index]) {
            animateTo(snapPoints[index]);
          }
        },
        goToHeight: animateTo,
        enableScroll: () => {},
        disableScroll: () => {},
        getCurrentHeight: () => currentHeightRef.current,
        isAtMaxHeight: () => Math.abs(currentHeightRef.current - maxHeight) < 5,
        isAtMinHeight: () => Math.abs(currentHeightRef.current - minHeight) < 5,
      };
    }
  }, [useHook, hookData, maxHeight, minHeight, snapPoints, animateTo]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        const canDrag = allowDrag && (useHook ? hookData.scrollEnabled : true);
        return canDrag && Math.abs(g.dy) > 6;
      },
      onPanResponderGrant: () => {
        startHeightRef.current = currentHeightRef.current;
      },
      onPanResponderMove: (_, g) => {
        if (!allowDrag || (useHook && !hookData.scrollEnabled)) return;
        const next = clamp(startHeightRef.current - g.dy, minHeight, maxHeight);
        heightAnim.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        if (!allowDrag || (useHook && !hookData.scrollEnabled)) return;
        const end = clamp(startHeightRef.current - g.dy, minHeight, maxHeight);
        const mid = (minHeight + maxHeight) / 2;
        const snaps = [minHeight, mid, maxHeight, ...(snapPoints || [])];
        const nearest = snaps.reduce((a, b) => (Math.abs(b - end) < Math.abs(a - end) ? b : a));
        animateTo(nearest);
      },
    })
  ).current;

  console.log('[InlineBottomSheet] ===== RENDERING =====');
  console.log('[InlineBottomSheet] visible:', visible);
  console.log('[InlineBottomSheet] currentHeightRef.current:', currentHeightRef.current);

  if (!visible) {
    console.log('[InlineBottomSheet] NOT RENDERING - visible is false');
    return null;
  }

  return (
    <View className={`absolute left-0 right-0 bottom-0 ${className}`}>
      <Animated.View
        style={{ height: heightAnim }}
        className="rounded-t-3xl overflow-hidden shadow-2xl bg-white dark:bg-brand-primary"
      >
        {/* Drag handle */}
        {showHandle && (
          <View
            {...(allowDrag ? panResponder.panHandlers : {})}
            className="items-center pt-2 pb-1"
          >
            <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500" />
          </View>
        )}

        {/* Content */}
        <View className="flex-1 overflow-hidden">
          {children}
        </View>
      </Animated.View>
    </View>
  );
});

// Export the hook and interfaces are already exported above

// Test component to verify drag functionality
export const TestInlineBottomSheet: React.FC = () => {
  const [visible, setVisible] = React.useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: 'lightblue' }}>
      <InlineBottomSheet
        visible={visible}
        minHeight={120}
        maxHeight={400}
        initialHeight={200}
        allowDrag={true}
        showHandle={true}
        className="bg-white"
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Test Bottom Sheet
          </Text>
          <Text style={{ fontSize: 14, color: 'gray' }}>
            Drag this sheet up and down to test functionality
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: 'blue', padding: 10, marginTop: 20, borderRadius: 5 }}
            onPress={() => setVisible(!visible)}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {visible ? 'Hide' : 'Show'} Sheet
            </Text>
          </TouchableOpacity>
        </View>
      </InlineBottomSheet>
    </View>
  );
};

// Componente de ejemplo que demuestra el uso del hook
export const ExampleBottomSheetWithHook: React.FC = () => {
  const sheetRef = React.useRef<BottomSheetMethods>(null);

  const handleScrollUp = () => {
    sheetRef.current?.scrollUpComplete();
  };

  const handleScrollDown = () => {
    sheetRef.current?.scrollDownComplete();
  };

  const handleGoToSnapPoint = (index: number) => {
    sheetRef.current?.goToSnapPoint(index);
  };

  const handleToggleScroll = () => {
    if (sheetRef.current) {
      const currentHeight = sheetRef.current.getCurrentHeight();
      console.log('Current height:', currentHeight);
      console.log('Is at max height:', sheetRef.current.isAtMaxHeight());
      console.log('Is at min height:', sheetRef.current.isAtMinHeight());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'lightgray' }}>
      {/* Control buttons */}
      <View style={{ padding: 20, paddingTop: 60 }}>
        <TouchableOpacity
          style={{ backgroundColor: 'green', padding: 10, marginBottom: 10, borderRadius: 5 }}
          onPress={handleScrollUp}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Scroll Up Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: 'red', padding: 10, marginBottom: 10, borderRadius: 5 }}
          onPress={handleScrollDown}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Scroll Down Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: 'blue', padding: 10, marginBottom: 10, borderRadius: 5 }}
          onPress={() => handleGoToSnapPoint(0)}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Go to Snap Point 0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: 'purple', padding: 10, marginBottom: 10, borderRadius: 5 }}
          onPress={() => handleGoToSnapPoint(1)}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Go to Snap Point 1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: 'orange', padding: 10, marginBottom: 10, borderRadius: 5 }}
          onPress={handleToggleScroll}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Get Current Status</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <InlineBottomSheet
        ref={sheetRef}
        visible={true}
        minHeight={150}
        maxHeight={500}
        initialHeight={250}
        allowDrag={true}
        showHandle={true}
        snapPoints={[200, 350]}
        className="bg-white"
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Bottom Sheet with Hook Control
          </Text>
          <Text style={{ fontSize: 14, color: 'gray', marginBottom: 20 }}>
            Use the buttons above to control this bottom sheet with smooth animations
          </Text>
          <Text style={{ fontSize: 12, color: 'red' }}>
            Drag functionality: {sheetRef.current ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
      </InlineBottomSheet>
    </View>
  );
};

export default InlineBottomSheet;


