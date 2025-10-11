import React, { useEffect } from 'react';
import { Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import type { LatLng } from 'react-native-maps';

interface AnimatedMarkerProps {
  coordinate: LatLng;
  title?: string;
  description?: string;
  image?: any;
  onPress?: () => void;
  animateOnMount?: boolean;
  bounceOnPress?: boolean;
}

const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({
  coordinate,
  title,
  description,
  image,
  onPress,
  animateOnMount = true,
  bounceOnPress = true,
}) => {
  const scale = React.useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const opacity = React.useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;

  useEffect(() => {
    if (animateOnMount) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateOnMount]);

  const handlePress = () => {
    if (bounceOnPress) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onPress?.();
  };

  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      image={image}
      onPress={handlePress}
      opacity={opacity as any}
    />
  );
};

export default AnimatedMarker;
