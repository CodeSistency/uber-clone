import React, { ReactNode, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolate,
  type SharedValue,
} from "react-native-reanimated";

import {
  useAnimatedDrawerLayout,
  UseAnimatedDrawerLayoutParams,
} from "./useAnimatedDrawerLayout";

interface AnimatedDrawerLayoutProps
  extends Omit<UseAnimatedDrawerLayoutParams, "openTranslateX" | "hiddenDrawerOffset"> {
  width: number;
  screenWidth: number;
  renderDrawer: (params: DrawerRenderParams) => ReactNode;
  renderContent: (params: ContentRenderParams) => ReactNode;
  drawerStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  secondaryLayerStyle?: ViewStyle;
  enableSecondaryLayer?: boolean;
  overflowMargin?: number;
  renderBackdrop?: (params: DrawerRenderParams) => ReactNode;
}

export interface DrawerRenderParams {
  progress: SharedValue<number>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface ContentRenderParams extends DrawerRenderParams {}

export const AnimatedDrawerLayout: React.FC<AnimatedDrawerLayoutProps> = (
  props,
) => {
  const {
    width,
    screenWidth,
    renderDrawer,
    renderContent,
    drawerStyle,
    contentContainerStyle,
    secondaryLayerStyle,
    enableSecondaryLayer = true,
    overflowMargin = 0,
    renderBackdrop,
    ...hookParams
  } = props;

  const openTranslateX = useMemo(() => width + overflowMargin, [width, overflowMargin]);
  const hiddenDrawerOffset = useMemo(() => -width * 0.45, [width]);

  const { sharedValues, isOpen, openDrawer, closeDrawer, toggleDrawer, setOpenState } =
    useAnimatedDrawerLayout({
      ...hookParams,
      openTranslateX,
      hiddenDrawerOffset,
      enableSecondaryLayer,
    });

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sharedValues.drawerOpacity.value,
    transform: [{ translateX: sharedValues.drawerTranslateX.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: sharedValues.scale.value },
      { translateX: sharedValues.translateX.value },
    ],
    borderRadius: sharedValues.borderRadius.value,
  }));

  const secondaryLayerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sharedValues.secondaryOpacity.value,
    transform: [
      { scale: sharedValues.secondaryScale.value },
      { translateX: sharedValues.secondaryTranslateX.value },
    ],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sharedValues.progress.value, [0, 1], [0, 1], Extrapolate.CLAMP),
  }));

  const renderParams: DrawerRenderParams = {
    progress: sharedValues.progress,
    isOpen,
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer,
  };

  return (
    <View style={styles.container}>
      <Animated.View pointerEvents={isOpen ? "auto" : "none"} style={[styles.backdrop, backdropAnimatedStyle]}>
      {renderBackdrop ? renderBackdrop(renderParams) : null}
      </Animated.View>

      <Animated.View
        pointerEvents={isOpen ? "auto" : "none"}
        style={[styles.drawer, { width }, drawerStyle, drawerAnimatedStyle]}
      >
        {renderDrawer(renderParams)}
      </Animated.View>

      {enableSecondaryLayer && (
        <Animated.View
          pointerEvents="none"
          style={[styles.secondaryLayer, secondaryLayerStyle, secondaryLayerAnimatedStyle]}
        >
          <View style={styles.secondaryInner} />
        </Animated.View>
      )}

      <Animated.View style={[styles.contentContainer, contentContainerStyle, contentAnimatedStyle]}>
        {renderContent(renderParams)}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  defaultBackdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 12, 23, 0.5)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    zIndex: 4,
    overflow: "hidden",
  },
  secondaryLayer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryInner: {
    width: "92%",
    height: "92%",
    borderRadius: 32,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
  },
});

export default AnimatedDrawerLayout;

