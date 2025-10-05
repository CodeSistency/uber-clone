import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColorValue,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useMapFlow } from "@/hooks/useMapFlow";
import {
  AVAILABLE_SERVICES,
  type ServiceType,
} from "@/lib/unified-flow/constants";

import VehicleIllustration from "../../VehicleIllustration";

import FlowHeader from "../../FlowHeader";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

type ServiceCardProps = {
  title: string;
  subtitle: string;
  description: string;
  serviceId: ServiceType;
  onPress: () => void;
  onHighlight?: () => void;
  isActive: boolean;
  accessibilityLabel: string;
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  subtitle,
  description,
  serviceId,
  onPress,
  onHighlight,
  isActive,
  accessibilityLabel,
}) => {
  const shake = useSharedValue(0);
  const driveProgress = useSharedValue(0);
  const lightsIntensity = useSharedValue(0);
  const smokeIntensity = useSharedValue(0);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    shake.value = withSequence(
      withTiming(-1, { duration: 260, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 260, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) }),
    );

    return () => {
      cancelAnimation(shake);
      shake.value = 0;
    };
  }, [shake]);

  const resetAnimations = useCallback(() => {
    driveProgress.value = 0;
    lightsIntensity.value = 0;
    smokeIntensity.value = 0;
  }, [driveProgress, lightsIntensity, smokeIntensity]);

  const handlePress = useCallback(() => {
    if (onHighlight) {
      onHighlight();
    }

    cancelAnimation(shake);
    shake.value = 0;
    lightsIntensity.value = withSequence(
      withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) }),
      withDelay(
        440,
        withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) }),
      ),
    );

    smokeIntensity.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) }),
    );

    driveProgress.value = withSequence(
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
      withDelay(
        200,
        withTiming(
          2,
          {
            duration: 420,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(onPress)();
              runOnJS(resetAnimations)();
            }
          },
        ),
      ),
    );
  }, [
    driveProgress,
    lightsIntensity,
    smokeIntensity,
    shake,
    resetAnimations,
    onPress,
  ]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const highlightScale = isActive ? 1.02 : 1;
    return {
      transform: [
        {
          scale: withTiming(highlightScale, {
            duration: 220,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
      shadowOpacity: interpolate(isActive ? 1 : 0, [0, 1], [0.12, 0.22]),
      shadowRadius: interpolate(isActive ? 1 : 0, [0, 1], [8, 18]),
    };
  }, [isActive]);

  const vehicleStyle = useAnimatedStyle(() => {
    const progress = driveProgress.value;
    const exitProgress = Math.min(progress, 1);
    const returnProgress = Math.max(progress - 1, 0);

    const shakeOffset = interpolate(shake.value, [-1, 1], [-4, 4]);

    const exitX = interpolate(exitProgress, [0, 1], [0, 184]);
    const exitY = interpolate(exitProgress, [0, 1], [0, 112]);
    const exitRotate = interpolate(exitProgress, [0, 1], [0, 24]);

    const returnX = interpolate(returnProgress, [0, 1], [-168, 0]);
    const returnY = interpolate(returnProgress, [0, 1], [-108, 0]);
    const returnRotate = interpolate(returnProgress, [0, 1], [-18, 0]);

    const translateX = progress <= 1 ? exitX : returnX;
    const translateY = progress <= 1 ? exitY : returnY;
    const rotation = progress <= 1 ? exitRotate : returnRotate;

    return {
      transform: [
        { translateX: translateX + shakeOffset },
        { translateY },
        { rotateZ: `${rotation}deg` },
      ],
    };
  });

  const lightsStyle = useAnimatedStyle(() => ({
    opacity: lightsIntensity.value,
  }));

  const smokeStyle = useAnimatedStyle(() => ({
    opacity: smokeIntensity.value * (driveProgress.value <= 1 ? 1 : 0),
    transform: [
      {
        translateX: interpolate(
          Math.min(driveProgress.value, 1),
          [0, 1],
          [0, 42],
        ),
      },
      {
        translateY: interpolate(
          Math.min(driveProgress.value, 1),
          [0, 1],
          [0, 30],
        ),
      },
      {
        scale: interpolate(Math.min(driveProgress.value, 1), [0, 1], [1, 1.45]),
      },
    ],
  }));

  const textWrapperStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isActive ? 1 : 0.92, {
      duration: 180,
      easing: Easing.out(Easing.ease),
    }),
  }));

  const colors = useMemo(() => {
    const border: ColorValue = "#FFC300";
    const cardBackground: ColorValue = isDark ? "#0F0F0F" : "#FFFFFF";
    const surfaceBackground: ColorValue = isDark ? "#1A1A17" : "#FFFDF5";
    const primaryText: ColorValue = isDark ? "#FFFFFF" : "#111111";
    const secondaryText: ColorValue = isDark
      ? "rgba(255,255,255,0.75)"
      : "rgba(17,17,17,0.75)";
    const tertiaryText: ColorValue = isDark
      ? "rgba(255,255,255,0.65)"
      : "rgba(17,17,17,0.55)";

    return {
      border,
      cardBackground,
      surfaceBackground,
      primaryText,
      secondaryText,
      tertiaryText,
    };
  }, [isDark]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Seleccionar servicio"
      onPress={handlePress}
      className="rounded-3xl"
      style={[
        cardAnimatedStyle,
        { backgroundColor: colors.cardBackground, shadowColor: "#000000" },
      ]}
    >
      <View
        className="rounded-3xl border-[1.5px]"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surfaceBackground,
          paddingVertical: 24,
          paddingHorizontal: 20,
          overflow: "hidden",
        }}
      >
        <AnimatedView
          pointerEvents="none"
          className="absolute -left-6 -top-8 h-28 w-28 rounded-full"
          style={[lightsStyle, { backgroundColor: "rgba(255, 195, 0, 0.28)" }]}
        />

        <AnimatedView
          pointerEvents="none"
          className="absolute bottom-6 right-4 h-12 w-20 rounded-full"
          style={[smokeStyle, { backgroundColor: "rgba(240, 240, 240, 0.55)" }]}
        />

        <View className="flex-row items-center justify-between gap-6">
          <AnimatedView style={textWrapperStyle} className="flex-1 mr-4">
            <AnimatedText
              className="font-JakartaBold text-2xl"
              style={{ color: colors.primaryText }}
            >
              {title}
            </AnimatedText>
            <AnimatedText
              className="mt-1 font-JakartaSemiBold text-sm"
              style={{ color: colors.secondaryText }}
            >
              {subtitle}
            </AnimatedText>
            <AnimatedText
              className="mt-2 font-Jakarta text-xs leading-5"
              style={{ color: colors.tertiaryText }}
            >
              {description}
            </AnimatedText>
          </AnimatedView>

          <AnimatedView
            className="items-center justify-center"
            style={[vehicleStyle, { width: 92, height: 92 }]}
          >
            <VehicleIllustration
              variant={serviceId}
              size={68}
              isDark={isDark}
            />
          </AnimatedView>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const ServiceSelection: React.FC = () => {
  
  const { startService, role } = useMapFlow();
  const [activeService, setActiveService] = useState<string | null>(null);

  const handleServicePress = useCallback(
    (serviceId: string) => {
      
      startService(serviceId as any, role);
    },
    [role, startService],
  );

  return (
    <View className="flex-1">
      <FlowHeader
        title="¿Qué necesitas hoy?"
        subtitle="Selecciona el servicio que mejor se adapte a tus necesidades"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 32,
          paddingHorizontal: 20,
          paddingTop: 4,
        }}
      >
        <View className="space-y-5">
          {AVAILABLE_SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              subtitle={service.subtitle}
              description={service.description}
              serviceId={service.id as ServiceType}
              isActive={activeService === service.id}
              accessibilityLabel={`${service.title}: ${service.subtitle}`}
              onHighlight={() => setActiveService(service.id)}
              onPress={() => handleServicePress(service.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceSelection;
