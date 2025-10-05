import React from "react";
import { StyleSheet } from "react-native";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface AnimatedBackdropProps {
  progress: SharedValue<number>;
}

const AnimatedBackdrop: React.FC<AnimatedBackdropProps> = ({ progress }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Reanimated.View
      pointerEvents="none"
      style={[styles.backdrop, animatedStyle]}
    />
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 12, 23, 0.5)",
  },
});

export default AnimatedBackdrop;




