import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring,
  withSequence
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface FloatingReopenButtonProps {
  visible: boolean;
  onPress: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: number;
  color?: string;
  backgroundColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  animationDuration?: number;
}

const FloatingReopenButton: React.FC<FloatingReopenButtonProps> = ({
  visible,
  onPress,
  position = 'bottom-right',
  size = 56,
  color = '#FFFFFF',
  backgroundColor = '#0286FF',
  iconName = 'chevron-up',
  animationDuration = 300,
}) => {
  // 🔧 Valores animados con Reanimated
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(20);
  
  // Efecto de aparición/desaparición
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: animationDuration });
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: animationDuration });
      scale.value = withTiming(0.8, { duration: animationDuration });
      translateY.value = withTiming(20, { duration: animationDuration });
    }
  }, [visible, animationDuration, opacity, scale, translateY]);
  
  // 🔧 Gesture para feedback táctil
  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSequence(
        withTiming(0.85, { duration: 100 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    })
    .onEnd(() => {
      onPress();
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: 20,
          right: 20,
        };
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: 20,
          left: 20,
        };
      case 'top-right':
        return {
          ...baseStyle,
          top: 20,
          right: 20,
        };
      case 'top-left':
        return {
          ...baseStyle,
          top: 20,
          left: 20,
        };
      default:
        return {
          ...baseStyle,
          bottom: 20,
          right: 20,
        };
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[getPositionStyle(), animatedStyle]}>
      <GestureDetector gesture={tap}>
        <Animated.View style={[styles.button, { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }]}>
          <Ionicons name={iconName} size={size * 0.4} color={color} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default FloatingReopenButton;
