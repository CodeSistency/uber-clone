import { View, Text, TouchableOpacity } from "react-native";

interface SafetyBottomSheetProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const SafetyBottomSheet = ({ onClose, onNavigate }: SafetyBottomSheetProps) => (
  <View className="p-4">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-white font-JakartaBold text-lg">Seguridad</Text>
      <TouchableOpacity
        onPress={onClose}
        className="w-8 h-8 items-center justify-center"
      >
        <Text className="text-white text-xl">✕</Text>
      </TouchableOpacity>
    </View>

    <View className="space-y-3">
      <TouchableOpacity
        onPress={() => onNavigate("/(driver)/safety")}
        className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center"
      >
        <Text className="text-xl mr-3">🆘</Text>
        <Text className="text-white font-JakartaBold flex-1">Emergencia</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onNavigate("/(driver)/safety")}
        className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center"
      >
        <Text className="text-xl mr-3">📍</Text>
        <Text className="text-white font-JakartaBold flex-1">
          Compartir Viaje
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onNavigate("/(driver)/safety")}
        className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center"
      >
        <Text className="text-xl mr-3">📞</Text>
        <Text className="text-white font-JakartaBold flex-1">
          Contactos Emergencia
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onNavigate("/(driver)/safety")}
        className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center"
      >
        <Text className="text-xl mr-3">📋</Text>
        <Text className="text-white font-JakartaBold flex-1">
          Reportar Incidente
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default SafetyBottomSheet;
