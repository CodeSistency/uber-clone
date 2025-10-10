import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useMapFlowStore } from '../../store/mapFlow';
import { useMapFlowBackground } from '../../hooks/useMapFlowBackground';
  import { MapFlowStep } from '@/store/mapFlow';

interface MapFlowBackgroundProps {
  step?: MapFlowStep;
  useGradient?: boolean;
  useBlur?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

const MapFlowBackground: React.FC<MapFlowBackgroundProps> = ({
  step,
  useGradient = false,
  useBlur = false,
  gradientColors,
  blurIntensity = 20,
  blurTint = 'default',
}) => {
  const background = useMapFlowBackground(step);
  
  if (useGradient || background.useGradient) {
    return (
      <LinearGradient
        colors={gradientColors || (background.gradientColors as any)}
        style={[StyleSheet.absoluteFillObject, background.gradientBackground]}
      />
    );
  }
  
  if (useBlur || background.useBlur) {
    return (
      <BlurView
        intensity={blurIntensity || background.blurIntensity}
        tint={blurTint || background.blurTint}
        style={[StyleSheet.absoluteFillObject, background.blurBackground]}
      />
    );
  }
  
  return <View style={StyleSheet.absoluteFillObject} />;
};

export default MapFlowBackground;
