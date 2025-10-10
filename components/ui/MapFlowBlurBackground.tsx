import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';

/**
 * Fondo con blur + gradiente para el BottomSheet
 * En Android usa solo gradiente oscuro vertical
 * En iOS usa blur + gradiente
 */
const MapFlowBlurBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
  // En Android usar solo gradiente oscuro vertical
  if (Platform.OS === 'android') {
    return (
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.8)']}
        locations={[0, 1]}
        style={[StyleSheet.absoluteFill, style]}
      />
    );
  }

  // En iOS usar blur + gradiente
  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      {/* Gradiente detrás para dar profundidad */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.08)', 'rgba(0, 0, 0, 0.25)']}
        style={StyleSheet.absoluteFill}
      />
      {/* Blur encima del gradiente */}
      <BlurView
        intensity={75}
        tint="dark"
        blurReductionFactor={4}
        experimentalBlurMethod={"dimezisBlurView"}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

export default MapFlowBlurBackground;
