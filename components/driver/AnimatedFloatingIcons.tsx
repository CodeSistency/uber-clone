import { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";

interface AnimatedFloatingIconsProps {
  onIconPress: (icon: string) => void;
  isVisible: boolean;
}

interface AnimatedIconProps {
  item: { id: string; icon: string; label: string };
  index: number;
  isVisible: boolean;
  onIconPress: (icon: string) => void;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  item,
  index,
  isVisible,
  onIconPress,
}) => {
  const iconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(iconAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(iconAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, index, iconAnim]);

  return (
    <Animated.View
      style={{
        opacity: iconAnim,
        transform: [
          {
            scale: iconAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={() => onIconPress(item.id)}
        className="w-12 h-12 bg-black/70 rounded-full items-center justify-center"
        activeOpacity={0.7}
      >
        <Text className="text-lg">{item.icon}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AnimatedFloatingIcons = ({
  onIconPress,
  isVisible,
}: AnimatedFloatingIconsProps) => {
  const icons = [
    { id: "safety", icon: "🚨", label: "Seguridad" },
    { id: "earnings", icon: "💰", label: "Ganancias" },
    { id: "ratings", icon: "⭐", label: "Calificaciones" },
    { id: "config", icon: "⚙️", label: "Configuración" },
    { id: "destination", icon: "📍", label: "Destino" },
    { id: "promotions", icon: "🎯", label: "Promociones" },
  ];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim, translateYAnim]);

  return (
    <Animated.View
      className="absolute top-4 right-4 z-10"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
      }}
    >
      <View className="flex-row flex-wrap gap-2">
        {icons.map((item, index) => (
          <AnimatedIcon
            key={item.id}
            item={item}
            index={index}
            isVisible={isVisible}
            onIconPress={onIconPress}
          />
        ))}
      </View>
    </Animated.View>
  );
};

export default AnimatedFloatingIcons;
