import { View, Text, TouchableOpacity } from "react-native";

interface ConfigBottomSheetProps {
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const ConfigBottomSheet = ({ onClose, onNavigate }: ConfigBottomSheetProps) => (
  <View className="p-4">
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-white font-JakartaBold text-lg">Configuración</Text>
      <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
        <Text className="text-white text-xl">✕</Text>
      </TouchableOpacity>
    </View>
    
    <View className="space-y-3">
      <TouchableOpacity onPress={() => onNavigate('/(driver)/settings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">👤</Text>
        <Text className="text-white font-JakartaBold flex-1">Perfil del Conductor</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/settings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">🚗</Text>
        <Text className="text-white font-JakartaBold flex-1">Mis Vehículos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/settings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">🎯</Text>
        <Text className="text-white font-JakartaBold flex-1">Tipos de Servicio</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onNavigate('/(driver)/settings')} className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
        <Text className="text-xl mr-3">📄</Text>
        <Text className="text-white font-JakartaBold flex-1">Documentos</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default ConfigBottomSheet;
