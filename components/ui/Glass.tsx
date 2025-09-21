import React from "react";
import { Platform, View, ViewProps } from "react-native";

export interface GlassProps extends ViewProps {
  intensity?: number; // 0-100
  tint?: "light" | "dark" | "default";
  className?: string;
}

// Pure CSS fallback using semi-transparent background + border + backdrop-like effect
const FallbackGlass: React.FC<GlassProps> = ({
  className = "",
  children,
  ...props
}) => (
  <View
    className={`rounded-2xl border border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20 ${className}`}
    style={
      {
        // Best effort backdrop on Android pre-Blur; RN doesn't support CSS backdrop-filter
        // but layered translucency + borders works acceptably
      }
    }
    {...props}
  >
    {children}
  </View>
);

export const Glass: React.FC<GlassProps> = ({
  intensity = 30,
  tint = "default",
  className = "",
  children,
  ...props
}) => {
  // We avoid bringing expo-blur as a dependency; fallback implementation works cross-platform.
  return (
    <FallbackGlass className={className} {...props}>
      {children}
    </FallbackGlass>
  );
};

export default Glass;
