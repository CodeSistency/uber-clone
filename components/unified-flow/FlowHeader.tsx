import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSequence,
  withSpring
} from 'react-native-reanimated';
import { useMapFlowBottomSheet } from '@/context/MapFlowBottomSheetContext';

interface FlowHeaderProps {
  title: string;
  onBack?: () => void;
  subtitle?: string;
  
  // 🆕 Nueva prop para modo de header
  mode?: 'back' | 'close'; // back = flecha atrás, close = X para cerrar
  onClose?: () => void; // Callback para cerrar con animación
}

const FlowHeader: React.FC<FlowHeaderProps> = ({ 
  title, 
  onBack, 
  subtitle,
  mode = 'back',
  onClose 
}) => {
  // 🆕 Obtener contexto del BottomSheet
  const { closeBottomSheet, isCloseable, mode: contextMode, isConnected } = useMapFlowBottomSheet();
  
  // 🆕 Usar modo del contexto si está disponible, sino usar prop
  const effectiveMode = contextMode || mode;
  
  // 🆕 Valores animados
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ]
  }));
  
  const handlePress = () => {
    if (effectiveMode === 'close' && (onClose || (isCloseable && isConnected))) {
      // Animación de feedback
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      
      rotation.value = withTiming(90, { duration: 200 }, () => {
        // Ejecutar cierre después de animación
        if (onClose) {
          onClose();
        } else if (isCloseable && isConnected) {
          closeBottomSheet();
        }
      });
    } else if (effectiveMode === 'back' && onBack) {
      scale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      onBack();
    }
  };
  
  const icon = effectiveMode === 'close' ? '×' : '←';
  const hasAction = (effectiveMode === 'close' && (onClose || (isCloseable && isConnected))) || 
                   (effectiveMode === 'back' && onBack);
  
  return (
    <View className="mb-4">
      {hasAction && (
        <View className="flex-row items-center mb-4">
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              onPress={handlePress}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-3"
              activeOpacity={0.7}
            >
              <Text className="text-2xl font-JakartaBold leading-none">
                {icon}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Text className="font-JakartaBold text-xl flex-1 text-center mr-10">
            {title}
          </Text>
        </View>
      )}

      {!hasAction && (
        <View className="items-center mb-6">
          <Text className="font-JakartaBold text-2xl text-center mb-2">
            {title}
          </Text>
          {subtitle && (
            <Text className="font-Jakarta text-sm text-gray-600 text-center px-4">
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default FlowHeader;
