import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { SplashConfig } from "@/store";

const { width } = Dimensions.get("window");

interface MiniSplashProps {
  config: SplashConfig;
  onComplete?: () => void;
  visible: boolean;
}

// Progress indicator component
const ProgressIndicator: React.FC<{
  progress: number;
  color?: string;
  showPercentage?: boolean;
}> = ({ progress, color = "#FFFFFF", showPercentage = true }) => {
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: (progress / 100) * (width * 0.8),
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <View className="w-full max-w-xs">
      <View className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
        <Animated.View
          className="h-full rounded-full"
          style={{
            width: progressWidth,
            backgroundColor: color,
          }}
        />
      </View>
      {showPercentage && (
        <Text className="text-white text-sm font-JakartaMedium text-center mt-2">
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
};

// Module-specific icons and colors
const getModuleConfig = (module?: string) => {
  switch (module) {
    case "driver":
      return {
        icon: "🚗",
        gradient: ["#0286FF", "#0056CC"],
        titleColor: "#FFFFFF",
        subtitleColor: "#E6F3FF",
      };
    case "business":
      return {
        icon: "🏢",
        gradient: ["#10B981", "#059669"],
        titleColor: "#FFFFFF",
        subtitleColor: "#ECFDF5",
      };
    case "customer":
      return {
        icon: "👤",
        gradient: ["#F59E0B", "#D97706"],
        titleColor: "#FFFFFF",
        subtitleColor: "#FFFBEB",
      };
    default:
      return {
        icon: "⏳",
        gradient: ["#6B7280", "#4B5563"],
        titleColor: "#FFFFFF",
        subtitleColor: "#F9FAFB",
      };
  }
};

const MiniSplash: React.FC<MiniSplashProps> = ({
  config,
  onComplete,
  visible,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const moduleConfig = getModuleConfig(config.moduleSpecific?.toModule);

  useEffect(() => {
    if (visible) {
      // Animate in with optimized performance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350, // Reduced for snappier feel
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100, // Bouncier spring animation
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.2)), // Subtle bounce
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out with smooth exit
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250, // Faster exit
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 30, // Subtle slide down
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // Removed animation refs from deps for performance

  // Auto-hide if duration is specified
  useEffect(() => {
    if (visible && config.duration && config.duration > 0) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, config.duration);
      return () => clearTimeout(timer);
    }
  }, [visible, config.duration, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      className="absolute inset-0 z-50"
      style={{
        opacity: fadeAnim,
      }}
    >
      <LinearGradient
        colors={
          config.backgroundColor
            ? [config.backgroundColor, config.backgroundColor]
            : (moduleConfig.gradient as any)
        }
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            className="items-center"
            style={{
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            }}
          >
            {/* Icon/Image */}
            {config.image ? (
              <Image
                source={config.image}
                className="w-24 h-24 mb-6"
                resizeMode="contain"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-6">
                <Text className="text-4xl">{moduleConfig.icon}</Text>
              </View>
            )}

            {/* Title */}
            {config.title && (
              <Text
                className="text-2xl font-JakartaBold text-center mb-2"
                style={{ color: moduleConfig.titleColor }}
              >
                {config.title}
              </Text>
            )}

            {/* Subtitle */}
            {config.subtitle && (
              <Text
                className="text-base font-JakartaMedium text-center mb-8 max-w-sm"
                style={{ color: moduleConfig.subtitleColor }}
              >
                {config.subtitle}
              </Text>
            )}

            {/* Progress Indicator */}
            {config.showProgress && (
              <ProgressIndicator
                progress={config.progress || 0}
                color={moduleConfig.titleColor}
                showPercentage={true}
              />
            )}

            {/* Loading indicator if no progress */}
            {!config.showProgress && (
              <ActivityIndicator
                size="large"
                color={moduleConfig.titleColor}
                className="mt-4"
              />
            )}

            {/* Data queries info */}
            {config.moduleSpecific?.dataQueries &&
              config.moduleSpecific.dataQueries.length > 0 && (
                <View className="mt-6 max-w-xs">
                  <Text
                    className="text-sm font-JakartaMedium text-center mb-2"
                    style={{ color: moduleConfig.subtitleColor }}
                  >
                    Cargando:
                  </Text>
                  {config.moduleSpecific.dataQueries
                    .slice(0, 3)
                    .map((query, index) => (
                      <Text
                        key={index}
                        className="text-xs font-JakartaRegular text-center"
                        style={{ color: moduleConfig.subtitleColor }}
                      >
                        • {query}
                      </Text>
                    ))}
                  {config.moduleSpecific.dataQueries.length > 3 && (
                    <Text
                      className="text-xs font-JakartaRegular text-center"
                      style={{ color: moduleConfig.subtitleColor }}
                    >
                      • y {config.moduleSpecific.dataQueries.length - 3} más...
                    </Text>
                  )}
                </View>
              )}

            {/* Actions */}
            {config.actions && (
              <View className="mt-8 w-full max-w-xs">
                {config.actions.primary && (
                  <TouchableOpacity
                    onPress={config.actions.primary.onPress}
                    className="bg-white/20 rounded-full py-3 px-6 mb-3"
                  >
                    <Text
                      className="text-center font-JakartaMedium"
                      style={{ color: moduleConfig.titleColor }}
                    >
                      {config.actions.primary.label}
                    </Text>
                  </TouchableOpacity>
                )}
                {config.actions.secondary && (
                  <TouchableOpacity
                    onPress={config.actions.secondary.onPress}
                    className="bg-transparent border border-white/30 rounded-full py-3 px-6"
                  >
                    <Text
                      className="text-center font-JakartaMedium"
                      style={{ color: moduleConfig.titleColor }}
                    >
                      {config.actions.secondary.label}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default MiniSplash;
