import React from "react";
import { StyleSheet, Pressable } from "react-native";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface AnimatedBackdropProps {
  progress: SharedValue<number>;
  onPress?: () => void;
}

const AnimatedBackdrop: React.FC<AnimatedBackdropProps> = ({ progress, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const handlePress = () => {
    console.log('[AnimatedBackdrop] Pressed - calling onPress');
    if (onPress) {
      onPress();
    } else {
      console.log('[AnimatedBackdrop] No onPress handler provided');
    }
  };

  return (
    <Reanimated.View
      style={[styles.backdrop, animatedStyle]}
    >
      <Pressable
        style={styles.pressable}
        onPress={handlePress}
        pointerEvents="auto"
      />
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 12, 23, 0.5)",
  },
  pressable: {
    flex: 1,
  },
});

export default AnimatedBackdrop;








