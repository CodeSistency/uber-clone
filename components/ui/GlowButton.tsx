import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { gradients } from "./tokens";

export interface GlowButtonProps extends TouchableOpacityProps {
  title: string;
  description?: string;
  loading?: boolean;
  LeftIcon?: React.ComponentType<{ color?: string }>;
  RightIcon?: React.ComponentType<{ color?: string }>;
  className?: string;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  title,
  description,
  loading,
  LeftIcon,
  RightIcon,
  className = "",
  disabled,
  style,
  ...props
}) => {
  const { background, glow, text } = gradients.glowButton;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      disabled={isDisabled}
      className={`${className} ${isDisabled ? "opacity-70" : ""}`}
      style={[styles.touchable, style]}
      {...props}
    >
      <LinearGradient
        colors={background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <LinearGradient
          colors={glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.glow}
        />

        <View style={styles.content}>
          {LeftIcon && (
            <View style={styles.iconWrapper}>
              <LeftIcon color={text} />
            </View>
          )}

          <View style={styles.textWrapper}>
            {loading ? (
              <ActivityIndicator color={text} />
            ) : (
              <>
                <Text style={[styles.title, { color: text }]}> {title} </Text>
                {description && (
                  <Text
                    style={[styles.description, { color: text }]}
                    numberOfLines={2}
                  >
                    {description}
                  </Text>
                )}
              </>
            )}
          </View>

          {RightIcon && !loading && (
            <View style={styles.iconWrapper}>
              <RightIcon color={text} />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 26,
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 26,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -40,
    height: 160,
    opacity: 0.95,
  },
  content: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  title: {
    fontFamily: "Jakarta-SemiBold",
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  description: {
    fontFamily: "Jakarta-Medium",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.9,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 28,
    height: 28,
  },
});

export default GlowButton;
