import { View, Text, TouchableOpacity } from "react-native";

interface EarningsBottomSheetProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const EarningsBottomSheet = ({ onClose, onNavigate }: EarningsBottomSheetProps) => (
  <View className="p-4">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-white font-JakartaBold text-lg">Ganancias</Text>
      <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
        <Text className="text-white text-xl">✕</Text>
      </TouchableOpacity>
    </View>
    
    <View className="space-y-3">
      <TouchableOpacity onPress={() => onNavigate('/(driver)/earnings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">📊</Text>
        <Text className="text-white font-JakartaBold flex-1">Ver Detalles</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/earnings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">💳</Text>
        <Text className="text-white font-JakartaBold flex-1">Pago Instantáneo</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/earnings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">📈</Text>
        <Text className="text-white font-JakartaBold flex-1">Gráficos por Hora</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/earnings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">🎯</Text>
        <Text className="text-white font-JakartaBold flex-1">Promociones Activas</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default EarningsBottomSheet;
