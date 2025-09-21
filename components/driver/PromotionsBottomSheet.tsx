import { View, Text, TouchableOpacity } from "react-native";

interface PromotionsBottomSheetProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const PromotionsBottomSheet = ({ onClose, onNavigate }: PromotionsBottomSheetProps) => (
  <View className="p-4">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-white font-JakartaBold text-lg">Promociones</Text>
      <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
        <Text className="text-white text-xl">✕</Text>
      </TouchableOpacity>
    </View>
    
    <View className="space-y-3">
      <View className="bg-black/40 rounded-xl px-4 py-3">
        <Text className="text-white font-JakartaBold">🎯 Weekend Warrior</Text>
        <Text className="text-white text-sm">12/20 viajes completados</Text>
      </View>
      
      <View className="bg-black/40 rounded-xl px-4 py-3">
        <Text className="text-white font-JakartaBold">💰 Bonificación por Zona</Text>
        <Text className="text-white text-sm">2.5x en Downtown hasta 6PM</Text>
      </View>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/earnings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">📊</Text>
        <Text className="text-white font-JakartaBold flex-1">Ver Todas las Promociones</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default PromotionsBottomSheet;
