import { LinearGradient } from "expo-linear-gradient";
import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Animated,
  PanResponder,
  ViewProps,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  ColorValue,
  TouchableWithoutFeedback,
} from "react-native";

const SPRING_BOUNCINESS = 6;
const SPRING_SPEED = 9;

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
    animationConfig = {},
  } = config;

  const heightAnim = useRef(new Animated.Value(initialHeight)).current;
  const currentHeight = useRef(initialHeight);
  const scrollEnabled = useRef(true);

  // Default animation config
  const defaultAnimConfig = {
    bounciness:
      animationConfig.bounciness !== undefined
        ? animationConfig.bounciness
        : SPRING_BOUNCINESS,
    speed:
      animationConfig.speed !== undefined
        ? animationConfig.speed
        : SPRING_SPEED,
    ...animationConfig,
  };

  // Listener para actualizar currentHeight
  useEffect(() => {
    const id = heightAnim.addListener(({ value }) => {
      currentHeight.current = value;
    });
    return () => heightAnim.removeListener(id);
  }, [heightAnim]);

  // Función de animación suave
  const animateTo = useCallback(
    (toValue: number, customConfig?: any) => {
      const clampedValue = Math.max(minHeight, Math.min(maxHeight, toValue));

      console.log(
        `[useBottomSheet] Animating from ${currentHeight.current} to ${clampedValue}`,
      );

      Animated.spring(heightAnim, {
        toValue: clampedValue,
        useNativeDriver: false,
        ...defaultAnimConfig,
        ...customConfig,
      }).start();
    },
    [heightAnim, minHeight, maxHeight, defaultAnimConfig],
  );

  // Métodos de control
  const scrollUpComplete = useCallback(() => {
    console.log("[useBottomSheet] scrollUpComplete called");
    animateTo(maxHeight);
  }, [animateTo, maxHeight]);

  const scrollDownComplete = useCallback(() => {
    console.log("[useBottomSheet] scrollDownComplete called");
    animateTo(minHeight);
  }, [animateTo, minHeight]);

  const goToSnapPoint = useCallback(
    (index: number) => {
      if (!snapPoints || snapPoints.length === 0) {
        console.warn("[useBottomSheet] No snap points defined");
        return;
      }

      if (index < 0 || index >= snapPoints.length) {
        console.warn(`[useBottomSheet] Invalid snap point index: ${index}`);
        return;
      }

      const targetHeight = snapPoints[index];
      console.log(
        `[useBottomSheet] Going to snap point ${index}: ${targetHeight}`,
      );
      animateTo(targetHeight);
    },
    [snapPoints, animateTo],
  );

  const goToHeight = useCallback(
    (height: number) => {
      console.log(`[useBottomSheet] Going to height: ${height}`);
      animateTo(height);
    },
    [animateTo],
  );

  const enableScroll = useCallback(() => {
    console.log("[useBottomSheet] Scroll enabled");
    scrollEnabled.current = true;
  }, []);

  const disableScroll = useCallback(() => {
    console.log("[useBottomSheet] Scroll disabled");
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
  // Gradient background props
  useGradient?: boolean;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  // Bottom bar props
  bottomBar?: React.ReactNode;
  bottomBarHeight?: number;
  showBottomBarAt?: number; // ratio 0..1
}

const InlineBottomSheet = forwardRef<
  BottomSheetMethods,
  InlineBottomSheetProps
>(
  (
    {
      visible,
      minHeight = 120,
      maxHeight = 600,
      initialHeight = 300,
      allowDrag = true,
      showHandle = true,
      onClose,
      snapPoints,
      className = "",
      // Gradient props
      useGradient = true,
      gradientColors = [
        "rgba(0,0,0,0.65)",
        "rgba(0,0,0,0.25)",
        "rgba(0,0,0,0.05)",
        "rgba(0,0,0,0)",
      ] as const,
      // Bottom bar props
      bottomBar,
      bottomBarHeight = 64,
      showBottomBarAt = 0.6,
      children,
      ...props
    },
    ref,
  ) => {
    console.log("[InlineBottomSheet] ===== COMPONENT MOUNTED =====");
    console.log("[InlineBottomSheet] Received props:", {
      visible,
      minHeight,
      maxHeight,
      initialHeight,
      allowDrag,
      showHandle,
      snapPoints,
      className,
      hasChildren: !!children,
      extraProps: Object.keys(props).length > 0 ? props : "none",
    });

    // Usar hook si se proporciona ref, sino usar lógica interna
    const useHook = !!ref;

    const hookData = useBottomSheet({
      minHeight,
      maxHeight,
      initialHeight,
      snapPoints,
    });

    const heightAnimFallback = useRef(
      new Animated.Value(initialHeight),
    ).current;
    const heightAnim = useHook ? hookData.heightAnim : heightAnimFallback;
    const startHeightRef = useRef(initialHeight);
    const currentHeightRef = useRef(initialHeight);
    const previousTargetHeightRef = useRef(initialHeight);

    const computeTargetHeight = useCallback(() => {
      const clampedInitial = Math.min(
        Math.max(initialHeight, minHeight),
        maxHeight,
      );

      if (snapPoints && snapPoints.length > 0) {
        const sorted = [...snapPoints].sort((a, b) => a - b);
        const closest = sorted.reduce((prev, curr) =>
          Math.abs(curr - clampedInitial) < Math.abs(prev - clampedInitial)
            ? curr
            : prev,
        );
        return Math.min(Math.max(closest, minHeight), maxHeight);
      }

      return clampedInitial;
    }, [initialHeight, minHeight, maxHeight, snapPoints]);

    useEffect(() => {
      console.log("[InlineBottomSheet] Setting up height listener");
      const id = heightAnim.addListener(({ value }) => {
        currentHeightRef.current = value;
        console.log("[InlineBottomSheet] Height changed to:", value);
      });
      return () => {
        console.log("[InlineBottomSheet] Removing height listener");
        heightAnim.removeListener(id);
      };
    }, [heightAnim]);

    useEffect(() => {
      if (!visible) {
        previousTargetHeightRef.current = initialHeight;
        return;
      }

      const nextTarget = computeTargetHeight();
      const prevTarget = previousTargetHeightRef.current;

      if (Math.abs(nextTarget - prevTarget) < 1) {
        return;
      }

      previousTargetHeightRef.current = nextTarget;

      if (useHook) {
        hookData.methods.goToHeight(nextTarget);
      } else {
        Animated.spring(heightAnim, {
          toValue: nextTarget,
          useNativeDriver: false,
          bounciness: SPRING_BOUNCINESS,
          speed: SPRING_SPEED,
        }).start();
      }
    }, [computeTargetHeight, visible, useHook, hookData.methods, heightAnim, initialHeight]);

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

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
          isAtMaxHeight: () =>
            Math.abs(currentHeightRef.current - maxHeight) < 5,
          isAtMinHeight: () =>
            Math.abs(currentHeightRef.current - minHeight) < 5,
        };
      }
    }, [useHook, hookData, maxHeight, minHeight, snapPoints, animateTo]);

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => {
          const canDrag =
            allowDrag && (useHook ? hookData.scrollEnabled : true);
          const verticalThreshold = 3;
          const horizontalThreshold = 6;
          const isVerticalEnough = Math.abs(g.dy) > verticalThreshold;
          const isMostlyVertical = Math.abs(g.dy) > Math.abs(g.dx);
          return canDrag && isVerticalEnough && isMostlyVertical;
        },
        onPanResponderGrant: () => {
          startHeightRef.current = currentHeightRef.current;
        },
        onPanResponderMove: (_, g) => {
          if (!allowDrag || (useHook && !hookData.scrollEnabled)) return;
          const next = clamp(
            startHeightRef.current - g.dy,
            minHeight,
            maxHeight,
          );
          heightAnim.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          if (!allowDrag || (useHook && !hookData.scrollEnabled)) return;
          const end = clamp(
            startHeightRef.current - g.dy,
            minHeight,
            maxHeight,
          );
          const mid = (minHeight + maxHeight) / 2;
          const snaps = [minHeight, mid, maxHeight, ...(snapPoints || [])];
          const nearest = snaps.reduce((a, b) =>
            Math.abs(b - end) < Math.abs(a - end) ? b : a,
          );
          animateTo(nearest);
        },
      }),
    ).current;

    // Animated bottom bar
    const screenHeight = Dimensions.get("window").height;
    const cappedMax = Math.min(maxHeight, Math.floor(screenHeight * 0.85));
    const threshold = minHeight + (cappedMax - minHeight) * showBottomBarAt;
    const barTranslate = heightAnim.interpolate({
      inputRange: [threshold - 40, threshold + 40],
      outputRange: [bottomBarHeight, 0],
      extrapolate: "clamp",
    });
    const barOpacity = heightAnim.interpolate({
      inputRange: [threshold - 20, threshold + 20],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    console.log("[InlineBottomSheet] ===== RENDERING =====");
    console.log("[InlineBottomSheet] visible:", visible);
    console.log(
      "[InlineBottomSheet] currentHeightRef.current:",
      currentHeightRef.current,
    );

    if (!visible) {
      console.log("[InlineBottomSheet] NOT RENDERING - visible is false");
      return null;
    }

    return (
      <View className={`absolute left-0 right-0 bottom-0 ${className}`}>
        <Animated.View
          style={{ height: heightAnim }}
          className="rounded-t-3xl overflow-hidden shadow-2xl"
        >
          {useGradient ? (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={{ ...StyleSheet.absoluteFillObject }}
            />
          ) : (
            <View className="absolute inset-0 bg-white dark:bg-brand-primary" />
          )}
          {/* Drag handle */}
          {showHandle && (
            <View
              accessibilityRole="adjustable"
              accessibilityLabel="Ajustar hoja"
              pointerEvents={allowDrag ? "auto" : "none"}
              className="w-full items-center pt-3 pb-3"
              {...(allowDrag ? panResponder.panHandlers : {})}
            >
              <View
                className={`w-9 h-1 rounded-full shadow-sm ${
                  allowDrag
                    ? "bg-gray-300/90 dark:bg-gray-400"
                    : "bg-gray-300/50 dark:bg-gray-600/50"
                }`}
              />
            </View>
          )}

          {/* Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: bottomBar ? bottomBarHeight + 24 : 16,
            }}
          >
            {children}
          </ScrollView>

          {bottomBar && (
            <Animated.View
              style={{
                transform: [{ translateY: barTranslate }],
                opacity: barOpacity,
              }}
              className="absolute left-0 right-0 bottom-0"
            >
              <View className="mx-4 mb-4 rounded-2xl px-4 py-3 bg-white/95 dark:bg-black/70 border border-black/5 dark:border-white/10">
                {bottomBar}
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    );
  },
);

// Export the hook and interfaces are already exported above

// Test component to verify drag functionality
export const TestInlineBottomSheet: React.FC = () => {
  const [visible, setVisible] = React.useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: "lightblue" }}>
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
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Test Bottom Sheet
          </Text>
          <Text style={{ fontSize: 14, color: "gray" }}>
            Drag this sheet up and down to test functionality
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "blue",
              padding: 10,
              marginTop: 20,
              borderRadius: 5,
            }}
            onPress={() => setVisible(!visible)}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              {visible ? "Hide" : "Show"} Sheet
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
      console.log("Current height:", currentHeight);
      console.log("Is at max height:", sheetRef.current.isAtMaxHeight());
      console.log("Is at min height:", sheetRef.current.isAtMinHeight());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "lightgray" }}>
      {/* Control buttons */}
      <View style={{ padding: 20, paddingTop: 60 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "green",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
          }}
          onPress={handleScrollUp}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Scroll Up Complete
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "red",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
          }}
          onPress={handleScrollDown}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Scroll Down Complete
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "blue",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
          }}
          onPress={() => handleGoToSnapPoint(0)}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Go to Snap Point 0
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "purple",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
          }}
          onPress={() => handleGoToSnapPoint(1)}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Go to Snap Point 1
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "orange",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
          }}
          onPress={handleToggleScroll}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Get Current Status
          </Text>
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
        // Gradient background
        useGradient={true}
        gradientColors={[
          "rgba(0,0,0,0.8)",
          "rgba(0,0,0,0.4)",
          "rgba(0,0,0,0.1)",
          "rgba(0,0,0,0)",
        ]}
        // Bottom bar
        bottomBar={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "black" }}>
              Hook Example Actions
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#0286FF",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
              onPress={handleScrollUp}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Expand</Text>
            </TouchableOpacity>
          </View>
        }
        bottomBarHeight={64}
        showBottomBarAt={0.7}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Bottom Sheet with Hook Control
          </Text>
          <Text style={{ fontSize: 14, color: "gray", marginBottom: 20 }}>
            Use the buttons above to control this bottom sheet with smooth
            animations. This example includes gradient background and animated
            bottom bar.
          </Text>
          <Text style={{ fontSize: 12, color: "red" }}>
            Drag functionality: {sheetRef.current ? "Enabled" : "Disabled"}
          </Text>
          <Text style={{ fontSize: 12, color: "blue", marginTop: 10 }}>
            Features: Gradient background + Animated bottom bar
          </Text>
        </View>
      </InlineBottomSheet>
    </View>
  );
};

// Componente de ejemplo que demuestra las nuevas características: gradiente y bottom bar
export const ExampleBottomSheetWithNewFeatures: React.FC = () => {
  const [showGradient, setShowGradient] = React.useState(true);
  const [showBottomBar, setShowBottomBar] = React.useState(true);

  const gradientColorsLight = [
    "rgba(255,255,255,0.9)",
    "rgba(255,255,255,0.6)",
    "rgba(255,255,255,0.3)",
    "rgba(255,255,255,0)",
  ] as const;

  const gradientColorsDark = [
    "rgba(0,0,0,0.8)",
    "rgba(0,0,0,0.4)",
    "rgba(0,0,0,0.1)",
    "rgba(0,0,0,0)",
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      {/* Control Panel */}
      <View
        style={{
          padding: 20,
          paddingTop: 60,
          backgroundColor: "white",
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
          New Features Demo
        </Text>

        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: showGradient ? "#10B981" : "#E5E7EB",
              padding: 10,
              marginRight: 5,
              borderRadius: 8,
            }}
            onPress={() => setShowGradient(!showGradient)}
          >
            <Text
              style={{
                color: showGradient ? "white" : "black",
                textAlign: "center",
              }}
            >
              {showGradient ? "✓" : "✗"} Gradient
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: showBottomBar ? "#10B981" : "#E5E7EB",
              padding: 10,
              marginLeft: 5,
              borderRadius: 8,
            }}
            onPress={() => setShowBottomBar(!showBottomBar)}
          >
            <Text
              style={{
                color: showBottomBar ? "white" : "black",
                textAlign: "center",
              }}
            >
              {showBottomBar ? "✓" : "✗"} Bottom Bar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet with New Features */}
      <InlineBottomSheet
        visible={true}
        minHeight={120}
        maxHeight={500}
        initialHeight={300}
        allowDrag={true}
        showHandle={true}
        // Gradient background
        useGradient={showGradient}
        gradientColors={gradientColorsDark}
        // Bottom bar (conditional)
        bottomBar={
          showBottomBar ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={{ fontWeight: "bold", color: "black", fontSize: 16 }}
                >
                  Services Hub
                </Text>
                <Text style={{ color: "gray", fontSize: 12 }}>
                  Find rides, delivery & more
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#0286FF",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Explore
                </Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
        bottomBarHeight={70}
        showBottomBarAt={0.6}
      >
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 10,
              color: showGradient ? "white" : "black",
            }}
          >
            🚗 Services Available
          </Text>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 15,
                color: showGradient ? "white" : "black",
              }}
            >
              Transportation
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: showGradient
                    ? "rgba(255,255,255,0.2)"
                    : "#F3F4F6",
                  padding: 15,
                  marginRight: 10,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 5 }}>🚕</Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: showGradient ? "white" : "black",
                  }}
                >
                  Ride
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: showGradient
                    ? "rgba(255,255,255,0.2)"
                    : "#F3F4F6",
                  padding: 15,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 5 }}>🚚</Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: showGradient ? "white" : "black",
                  }}
                >
                  Delivery
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 15,
                color: showGradient ? "white" : "black",
              }}
            >
              Popular Services
            </Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: showGradient
                    ? "rgba(255,255,255,0.2)"
                    : "#F3F4F6",
                  padding: 15,
                  marginRight: 10,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 5 }}>🍕</Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: showGradient ? "white" : "black",
                  }}
                >
                  Food
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: showGradient
                    ? "rgba(255,255,255,0.2)"
                    : "#F3F4F6",
                  padding: 15,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 5 }}>💊</Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: showGradient ? "white" : "black",
                  }}
                >
                  Pharmacy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text
            style={{
              fontSize: 12,
              color: showGradient ? "rgba(255,255,255,0.7)" : "gray",
              marginTop: 20,
              textAlign: "center",
            }}
          >
            Drag up to see more options • Toggle features above
          </Text>
        </View>
      </InlineBottomSheet>
    </View>
  );
};

export default InlineBottomSheet;
