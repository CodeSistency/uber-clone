import { View, Text, TouchableOpacity } from "react-native";

interface FloatingIconsProps {
  onIconPress: (icon: string) => void;
}

const FloatingIcons = ({ onIconPress }: FloatingIconsProps) => {
  const icons = [
    { id: 'safety', icon: '🚨', label: 'Seguridad' },
    { id: 'earnings', icon: '💰', label: 'Ganancias' },
    { id: 'ratings', icon: '⭐', label: 'Calificaciones' },
    { id: 'config', icon: '⚙️', label: 'Configuración' },
    { id: 'destination', icon: '📍', label: 'Destino' },
    { id: 'promotions', icon: '🎯', label: 'Promociones' },
  ];

  return (
    <View pointerEvents={onIconPress ? 'auto' : 'none'} className="absolute top-4 right-4 z-30">
      <View className="flex-row flex-wrap gap-2">
        {icons.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onIconPress(item.id)}
            className="w-12 h-12 bg-black/70 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-lg">{item.icon}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default FloatingIcons;
