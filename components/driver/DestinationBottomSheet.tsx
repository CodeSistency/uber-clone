import { View, Text, TouchableOpacity } from "react-native";

interface DestinationBottomSheetProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const DestinationBottomSheet = ({ onClose, onNavigate }: DestinationBottomSheetProps) => (
  <View className="p-4">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-white font-JakartaBold text-lg">Modo Destino</Text>
      <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
        <Text className="text-white text-xl">✕</Text>
      </TouchableOpacity>
    </View>
    
    <View className="space-y-3">
      <TouchableOpacity onPress={() => onNavigate('/(driver)/settings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">🏠</Text>
        <Text className="text-white font-JakartaBold flex-1">Casa</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/settings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">🏢</Text>
        <Text className="text-white font-JakartaBold flex-1">Trabajo</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/settings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">📍</Text>
        <Text className="text-white font-JakartaBold flex-1">Establecer Nuevo Destino</Text>
      </TouchableOpacity>
      
      <View className="bg-black/40 rounded-xl px-4 py-3">
        <Text className="text-white font-JakartaBold text-center">⏰ Usos restantes: 2/3</Text>
      </View>
    </View>
  </View>
);

export default DestinationBottomSheet;
