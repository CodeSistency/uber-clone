import React, { useEffect, useMemo, useRef } from "react";
import { Animated, View } from "react-native";

import { Select, SelectOption } from "@/components/ui";

export interface SequentialSelectorProps {
  steps: {
    id: string;
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    value: string | null;
    onChange: (value: string) => void;
  }[];
  containerClassName?: string;
  delayBetween?: number;
}

const DEFAULT_DELAY = 220;

export const SequentialSelector: React.FC<SequentialSelectorProps> = ({
  steps,
  containerClassName = "space-y-3",
  delayBetween = DEFAULT_DELAY,
}) => {
  const animatedValuesRef = useRef<Animated.Value[]>([]);
  const prevStepsRef = useRef<typeof steps>([]);

  // Inicializar animated values si es necesario
  if (animatedValuesRef.current.length !== steps.length) {
    animatedValuesRef.current = steps.map(
      (_, index) =>
        animatedValuesRef.current[index] ||
        new Animated.Value(index === 0 ? 1 : 0),
    );
  }

  useEffect(() => {
    // Solo animar cuando cambie el estado de visibilidad de algún selector
    for (let i = 1; i < steps.length; i++) {
      const prevStep = steps[i - 1];
      const prevPrevStep = prevStepsRef.current[i - 1];
      const currentAnimatedValue = animatedValuesRef.current[i];

      const wasVisible = prevPrevStep?.value && prevPrevStep.value.trim();
      const isVisible = prevStep?.value && prevStep.value.trim();

      // Solo animar si el estado de visibilidad cambió
      if (!wasVisible && isVisible && currentAnimatedValue) {
        Animated.timing(currentAnimatedValue, {
          toValue: 1,
          duration: 280,
          delay: 0,
          useNativeDriver: true,
        }).start();
      } else if (wasVisible && !isVisible && currentAnimatedValue) {
        currentAnimatedValue.setValue(0);
      }
    }

    // Actualizar la referencia de los steps anteriores
    prevStepsRef.current = steps;
  }, [steps, delayBetween]);

  return (
    <View className={containerClassName}>
      {steps.map((step, index) => {
        const prevStep = steps[index - 1];
        const show =
          index === 0 || Boolean(prevStep?.value && prevStep.value.trim());
        const animatedValue = animatedValuesRef.current[index];
        const animatedStyle = animatedValue
          ? {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            }
          : {};

        if (!show) {
          return null;
        }

        return (
          <Animated.View key={step.id} style={animatedStyle}>
            <Select
              value={step.value || null}
              onChange={step.onChange}
              options={step.options || []}
              placeholder={step.placeholder}
              className="w-full"
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

export default SequentialSelector;
