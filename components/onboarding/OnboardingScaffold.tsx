import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";

import { Button } from "@/components/ui";

import { IllustrationComponent, IllustrationProps } from "./illustrations";

const BUTTON_AREA_HEIGHT = 88;
const SKIP_BUTTON_TOP = 20;
const ILLUSTRATION_TOP = "5%";
const ILLUSTRATION_HEIGHT = "30%";
const CONTENT_TOP = "40%";

interface SkipButtonProps {
  label?: string;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

export interface OnboardingScaffoldProps {
  illustration: IllustrationComponent;
  illustrationProps?: IllustrationProps;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onContinue: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  continueButtonText?: string;
  backButtonText?: string;
  skipButtonText?: string;
  showBackButton?: boolean;
  isContinueDisabled?: boolean;
  isBackDisabled?: boolean;
  isLoading?: boolean;
  containerClassName?: string;
  contentContainerClassName?: string;
  illustrationContainerClassName?: string;
}

const SkipButton: React.FC<SkipButtonProps> = ({
  label = "Saltar",
  disabled,
  onPress,
  className = "",
}) => {
  if (!onPress) return null;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={styles.skipButton}
      className={`px-3 py-2 rounded-full bg-black/5 dark:bg-white/10 ${disabled ? "opacity-40" : ""} ${className}`}
    >
      <Text className="text-xs font-JakartaSemiBold text-gray-600 dark:text-gray-200">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const OnboardingScaffold: React.FC<OnboardingScaffoldProps> = ({
  illustration: Illustration,
  illustrationProps,
  title,
  subtitle,
  children,
  onContinue,
  onBack,
  onSkip,
  continueButtonText = "Continuar",
  backButtonText = "Atrás",
  skipButtonText = "Saltar",
  showBackButton = false,
  isContinueDisabled,
  isBackDisabled,
  isLoading,
  containerClassName = "",
  contentContainerClassName = "",
  illustrationContainerClassName = "",
}) => {
  return (
    <View
      className={`flex-1 bg-brand-primary dark:bg-brand-primaryDark ${containerClassName}`}
    >
      <View className="flex-1">
        <SkipButton
          label={skipButtonText}
          onPress={onSkip}
          disabled={isLoading}
        />

        <Animated.View
          className={`absolute left-0 right-0 items-center justify-center px-5 ${illustrationContainerClassName}`}
          style={[styles.illustrationContainer]}
        >
          <Illustration className="w-full h-full" {...illustrationProps} />
        </Animated.View>

        <Animated.View
          className={`absolute left-0 right-0 px-4 ${contentContainerClassName}`}
          style={styles.contentContainer}
        >
          {title ? (
            <Text className="text-2xl font-Jakarta-Bold text-gray-900 dark:text-white">
              {title}
            </Text>
          ) : null}

          {subtitle ? (
            <Text className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {subtitle}
            </Text>
          ) : null}

          <View className="mt-4">{children}</View>
        </Animated.View>

        <View
          style={styles.buttonContainer}
          className="px-4 pb-6 bg-brand-primary dark:bg-brand-primaryDark"
        >
          {showBackButton ? (
            <Button
              title={backButtonText}
              variant="ghost"
              size="md"
              className="flex-1 border border-black/10 dark:border-white/10"
              onPress={onBack}
              disabled={isLoading || isBackDisabled}
            />
          ) : (
            <View className="flex-1" />
          )}

          <View className="w-3" />

          <Button
            title={continueButtonText}
            variant="primary"
            size="md"
            className="flex-1"
            onPress={onContinue}
            disabled={isContinueDisabled || isLoading}
            loading={isLoading}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  illustrationContainer: {
    top: ILLUSTRATION_TOP,
    height: ILLUSTRATION_HEIGHT,
  },
  contentContainer: {
    top: CONTENT_TOP,
    bottom: BUTTON_AREA_HEIGHT,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    height: BUTTON_AREA_HEIGHT,
  },
  skipButton: {
    position: "absolute",
    right: 20,
    top: SKIP_BUTTON_TOP,
    zIndex: 10,
  },
});

export default OnboardingScaffold;

export { default as EmergencyContactModal } from "./EmergencyContactModal";
