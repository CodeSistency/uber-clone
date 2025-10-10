import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, animationDuration]);

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
    <Animated.View
      style={[
        getPositionStyle(),
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.button,
          {
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
          },
        ]}
        activeOpacity={0.8}
      >
        <Ionicons
          name={iconName}
          size={size * 0.4}
          color={color}
        />
      </TouchableOpacity>
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
