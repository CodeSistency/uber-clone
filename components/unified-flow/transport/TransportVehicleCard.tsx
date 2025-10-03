import React, { useEffect } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import CarTopView from "./CarTopView";
import MotoTopView from "./MotoTopView";

type TransportVehicleCardProps = {
  id: number;
  name: string;
  vehicleTypeName: string;
  icon: string;
  baseFare: number;
  perMinuteRate: number;
  perMileRate: number;
  rating?: number;
  etaMinutes?: number;
  isActive: boolean;
  delay?: number;
  onPress: (id: number) => void;
  accessibilityLabel: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const clampCurrency = (value: number) => {
  if (Number.isFinite(value)) {
    return value < 0 ? 0 : value;
  }

  return 0;
};

const formatPriceLabel = (
  perMileRate: number,
  perMinuteRate: number,
  baseFare: number,
) => {
  const mileRate = clampCurrency(perMileRate);
  if (mileRate > 0) {
    return `$${mileRate.toFixed(0)}/1mi`;
  }

  const minuteRate = clampCurrency(perMinuteRate);
  if (minuteRate > 0) {
    return `$${minuteRate.toFixed(0)}/1min`;
  }

  const base = clampCurrency(baseFare);
  return `$${base.toFixed(0)}`;
};

const TransportVehicleCard: React.FC<TransportVehicleCardProps> = ({
  id,
  name,
  vehicleTypeName,
  baseFare,
  perMinuteRate,
  perMileRate,
  rating,
  etaMinutes,
  isActive,
  delay = 0,
  onPress,
  accessibilityLabel,
  onLayout,
}) => {
  const scale = useSharedValue(0.94);
  const borderProgress = useSharedValue(0);
  const lightsProgress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(1, { duration: 280 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 220 }));
  }, [delay, opacity, scale]);

  useEffect(() => {
    const targetScale = isActive ? 1.05 : 1;
    const targetBorder = isActive ? 1 : 0;
    const targetLights = isActive ? 1 : 0;

    scale.value = withTiming(targetScale, { duration: 220 });
    borderProgress.value = withTiming(targetBorder, { duration: 200 });
    lightsProgress.value = withTiming(targetLights, { duration: 220 });
  }, [borderProgress, isActive, lightsProgress, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      ["rgba(255,255,255,0.12)", "#FFC300"],
    ),
    shadowOpacity: 0.08 + borderProgress.value * 0.24,
    shadowRadius: 8 + borderProgress.value * 6,
  }));

  const lightsStyle = useAnimatedStyle(() => ({
    opacity: lightsProgress.value,
  }));

  const etaLabel =
    etaMinutes && etaMinutes > 0 ? `${etaMinutes} min aprox.` : "ETA dinámico";
  const priceLabel = formatPriceLabel(perMileRate, perMinuteRate, baseFare);

  const accessibilityState = { selected: isActive } as const;

  const isMotorcycle = vehicleTypeName.toLowerCase().includes("moto");
  const VehicleIllustration = isMotorcycle ? MotoTopView : CarTopView;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPress={() => onPress(id)}
      className="mr-4"
      style={{ width: 180, minHeight: 285 }}
      onLayout={onLayout}
    >
      <Animated.View
        className="rounded-3xl border-[1.5px] bg-[#161616]"
        style={[
          containerStyle,
          {
            shadowColor: "#000000",
            paddingVertical: 28,
            paddingHorizontal: 18,
            paddingRight: 54,
            minHeight: 285,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute inset-x-4 top-3 h-20 rounded-3xl"
          style={[lightsStyle, { backgroundColor: "rgba(255,195,0,0.18)" }]}
        />

        <View className="flex-1 pr-6">
          <Text
            className="font-JakartaBold text-xl text-white"
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {name}
          </Text>
          <Text
            className="font-JakartaSemiBold text-sm text-[#FFD74A]"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            ({vehicleTypeName})
          </Text>

          {typeof rating === "number" && rating > 0 ? (
            <Text className="mt-3 font-JakartaSemiBold text-xs text-[#FFD74A]">
              {rating.toFixed(1)} ★
            </Text>
          ) : null}

          <Text
            className="mt-3 font-Jakarta text-xs leading-5 text-gray-300"
            numberOfLines={2}
          >
            {etaLabel}
          </Text>
        </View>

        <View className="mt-8">
          <Text className="font-JakartaMedium text-xs uppercase tracking-wide text-gray-400">
            Tarifa base
          </Text>
          <Text className="font-JakartaBold text-lg text-white">
            ${clampCurrency(baseFare).toFixed(2)}
          </Text>

          <Text className="mt-4 font-JakartaBold text-base text-white">
            {priceLabel}
          </Text>
        </View>

        <Animated.View
          pointerEvents="none"
          style={{ position: "absolute", right: -50, top: 48, zIndex: 10 }}
        >
          <VehicleIllustration
            width={isMotorcycle ? 86 : 120}
            height={isMotorcycle ? 172 : 188}
            primaryColor="#FDC741"
            accentColor="#1C1D22"
            lightsOn={isActive}
          />
        </Animated.View>
      </Animated.View>
    </AnimatedPressable>
  );
};

export type { TransportVehicleCardProps };
export default TransportVehicleCard;
