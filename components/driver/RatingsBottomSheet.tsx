import { View, Text, TouchableOpacity } from "react-native";

interface RatingsBottomSheetProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const RatingsBottomSheet = ({
  onClose,
  onNavigate,
}: RatingsBottomSheetProps) => (
  <View className="p-4">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-white font-JakartaBold text-lg">
        Calificaciones
      </Text>
      <TouchableOpacity
        onPress={onClose}
        className="w-8 h-8 items-center justify-center"
      >
        <Text className="text-white text-xl">✕</Text>
      </TouchableOpacity>
    </View>

    <View className="space-y-3">
      <View className="bg-black/40 rounded-xl px-4 py-3">
        <Text className="text-white font-JakartaBold text-center">
          ⭐ 4.8 (1,247 calificaciones)
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onNavigate("/(driver)/ratings")}
        className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center"
      >
        <Text className="text-xl mr-3">📊</Text>
        <Text className="text-white font-JakartaBold flex-1">
          Ver Métricas Completas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onNavigate("/(driver)/ratings")}
        className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center"
      >
        <Text className="text-xl mr-3">💬</Text>
        <Text className="text-white font-JakartaBold flex-1">
          Comentarios Recientes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onNavigate("/(driver)/ratings")}
        className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center"
      >
        <Text className="text-xl mr-3">🆘</Text>
        <Text className="text-white font-JakartaBold flex-1">
          Soporte y Ayuda
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default RatingsBottomSheet;
