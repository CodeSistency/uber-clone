import { LinearGradient } from "expo-linear-gradient";
import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ColorValue,
  StyleSheet,
} from "react-native";

interface AnimatedBottomSheetProps {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
  useGradient?: boolean;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  bottomBar?: React.ReactNode;
  bottomBarHeight?: number;
  showBottomBarAt?: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const AnimatedBottomSheet = ({
  children,
  isVisible,
  onClose,
  minHeight = 140,
  maxHeight = 560,
  initialHeight = 320,
  useGradient = true,
  gradientColors = [
    "rgba(0,0,0,0.65)",
    "rgba(0,0,0,0.25)",
    "rgba(0,0,0,0.05)",
    "rgba(0,0,0,0)",
  ] as const,
  bottomBar,
  bottomBarHeight = 64,
  showBottomBarAt = 0.6,
}: AnimatedBottomSheetProps) => {
  const screenHeight = Dimensions.get("window").height;
  const cappedMax = Math.min(maxHeight, Math.floor(screenHeight * 0.85));

  const heightAnim = useRef(new Animated.Value(initialHeight)).current;
  const startHeightRef = useRef(initialHeight);
  const currentHeightRef = useRef(initialHeight);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    const id = heightAnim.addListener(({ value }) => {
      currentHeightRef.current = value;
    });
    return () => heightAnim.removeListener(id);
  }, [heightAnim]);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, backdropAnim, slideAnim, screenHeight]);

  const animateTo = (toValue: number) => {
    Animated.spring(heightAnim, {
      toValue,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        startHeightRef.current = currentHeightRef.current;
      },
      onPanResponderMove: (_, g) => {
        const next = clamp(startHeightRef.current - g.dy, minHeight, cappedMax);
        heightAnim.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const end = clamp(startHeightRef.current - g.dy, minHeight, cappedMax);
        const mid = (minHeight + cappedMax) / 2;
        const snaps = [minHeight, mid, cappedMax];
        const nearest = snaps.reduce((a, b) =>
          Math.abs(b - end) < Math.abs(a - end) ? b : a,
        );
        animateTo(nearest);
      },
    }),
  ).current;

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

  if (!isVisible) return null;

  return (
    <View className="absolute inset-0 z-20">
      {/* Backdrop */}
      <Animated.View
        className="absolute inset-0 bg-black/50"
        style={{ opacity: backdropAnim }}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        className="absolute left-0 right-0 bottom-0"
        style={{
          transform: [{ translateY: slideAnim }],
        }}
      >
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
          <View
            {...panResponder.panHandlers}
            className="items-center pt-2 pb-1"
          >
            <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500" />
          </View>
          {children}
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
      </Animated.View>
    </View>
  );
};

export default AnimatedBottomSheet;
