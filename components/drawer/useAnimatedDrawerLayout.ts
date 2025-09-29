import { useCallback, useMemo, useState, useEffect } from "react";
import type { SharedValue } from "react-native-reanimated";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

export type EasingFunction = (value: number) => number;

export type DrawerAnimationSharedValues = {
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  borderRadius: SharedValue<number>;
  drawerOpacity: SharedValue<number>;
  drawerTranslateX: SharedValue<number>;
  secondaryScale: SharedValue<number>;
  secondaryTranslateX: SharedValue<number>;
  secondaryOpacity: SharedValue<number>;
  progress: SharedValue<number>;
};

export interface UseAnimatedDrawerLayoutParams {
  initialOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  animationDuration?: number;
  easing?: EasingFunction;
  scaleFactor?: number;
  borderRadius?: number;
  openTranslateX: number;
  hiddenDrawerOffset: number;
  secondaryScaleFactor?: number;
  secondaryTranslateMultiplier?: number;
  enableSecondaryLayer?: boolean;
}

export interface UseAnimatedDrawerLayoutResult {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setOpenState: (open: boolean) => void;
  sharedValues: DrawerAnimationSharedValues;
}

const defaultAnimationDuration = 320;
const defaultEasing = Easing.inOut(Easing.cubic);

const defaultSecondaryOptions = {
  scale: 0.75,
  translateMultiplier: 0.75,
};

export const useAnimatedDrawerLayout = (
  params: UseAnimatedDrawerLayoutParams,
): UseAnimatedDrawerLayoutResult => {
  const {
    initialOpen = false,
    isOpen,
    onOpenChange,
    animationDuration = defaultAnimationDuration,
    easing = defaultEasing,
    scaleFactor = 0.58,
    borderRadius = 28,
    openTranslateX,
    hiddenDrawerOffset,
    secondaryScaleFactor = defaultSecondaryOptions.scale,
    secondaryTranslateMultiplier = defaultSecondaryOptions.translateMultiplier,
    enableSecondaryLayer = true,
  } = params;

  const isControlled = typeof isOpen === "boolean";
  const [internalOpen, setInternalOpen] = useState(initialOpen);

  const resolvedOpen = isControlled ? Boolean(isOpen) : internalOpen;

  const timingConfig = useMemo(
    () => ({ duration: animationDuration, easing }),
    [animationDuration, easing],
  );

  const scale = useSharedValue(resolvedOpen ? scaleFactor : 1);
  const translateX = useSharedValue(resolvedOpen ? openTranslateX : 0);
  const borderRadiusValue = useSharedValue(resolvedOpen ? borderRadius : 0);
  const drawerOpacity = useSharedValue(resolvedOpen ? 1 : 0);
  const drawerTranslateX = useSharedValue(resolvedOpen ? 0 : hiddenDrawerOffset);
  const secondaryScale = useSharedValue(
    enableSecondaryLayer ? (resolvedOpen ? secondaryScaleFactor : 1) : 1,
  );
  const secondaryTranslateX = useSharedValue(
    enableSecondaryLayer
      ? resolvedOpen
        ? openTranslateX * secondaryTranslateMultiplier
        : 0
      : 0,
  );
  const secondaryOpacity = useSharedValue(
    enableSecondaryLayer ? (resolvedOpen ? 1 : 0) : 0,
  );
  const progress = useSharedValue(resolvedOpen ? 1 : 0);

  const setOpenState = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const openDrawer = useCallback(() => setOpenState(true), [setOpenState]);
  const closeDrawer = useCallback(() => setOpenState(false), [setOpenState]);
  const toggleDrawer = useCallback(
    () => setOpenState(!resolvedOpen),
    [resolvedOpen, setOpenState],
  );

  useEffect(() => {
    const isDrawerOpen = resolvedOpen;

    progress.value = withTiming(isDrawerOpen ? 1 : 0, timingConfig);
    scale.value = withTiming(isDrawerOpen ? scaleFactor : 1, timingConfig);
    translateX.value = withTiming(
      isDrawerOpen ? openTranslateX : 0,
      timingConfig,
    );
    borderRadiusValue.value = withTiming(
      isDrawerOpen ? borderRadius : 0,
      timingConfig,
    );
    drawerOpacity.value = withTiming(isDrawerOpen ? 1 : 0, timingConfig);
    drawerTranslateX.value = withTiming(
      isDrawerOpen ? 0 : hiddenDrawerOffset,
      timingConfig,
    );

    if (enableSecondaryLayer) {
      secondaryScale.value = withTiming(
        isDrawerOpen ? secondaryScaleFactor : 1,
        timingConfig,
      );
      secondaryTranslateX.value = withTiming(
        isDrawerOpen ? openTranslateX * secondaryTranslateMultiplier : 0,
        timingConfig,
      );
      secondaryOpacity.value = withTiming(
        isDrawerOpen ? 1 : 0,
        timingConfig,
      );
    } else {
      secondaryOpacity.value = 0;
      secondaryScale.value = 1;
      secondaryTranslateX.value = 0;
    }
  }, [
    resolvedOpen,
    scale,
    translateX,
    borderRadiusValue,
    drawerOpacity,
    drawerTranslateX,
    secondaryScale,
    secondaryTranslateX,
    secondaryOpacity,
    progress,
    timingConfig,
    scaleFactor,
    borderRadius,
    openTranslateX,
    hiddenDrawerOffset,
    secondaryScaleFactor,
    secondaryTranslateMultiplier,
    enableSecondaryLayer,
  ]);

  return {
    isOpen: resolvedOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    setOpenState,
    sharedValues: {
      scale,
      translateX,
      borderRadius: borderRadiusValue,
      drawerOpacity,
      drawerTranslateX,
      secondaryScale,
      secondaryTranslateX,
      secondaryOpacity,
      progress,
    },
  };
};


