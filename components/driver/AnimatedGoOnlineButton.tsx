import { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

interface AnimatedGoOnlineButtonProps {
  isOnline: boolean;
  onPress: () => void;
  isVisible: boolean;
}

const AnimatedGoOnlineButton = ({
  isOnline,
  onPress,
  isVisible,
}: AnimatedGoOnlineButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible && !isOnline) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, isOnline, scaleAnim, fadeAnim, pulseAnim]);

  const handlePress = () => {
    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotation animation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });

    onPress();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!isVisible || isOnline) return null;

  return (
    <Animated.View
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          { scale: pulseAnim },
          { rotate: rotateInterpolate },
        ],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        className="w-32 h-32 bg-yellow-500 rounded-full items-center justify-center shadow-2xl"
        activeOpacity={0.8}
      >
        <Text className="text-black font-JakartaBold text-lg">GO ONLINE</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedGoOnlineButton;
