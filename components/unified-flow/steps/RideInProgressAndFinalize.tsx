import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";

import FlowHeader from "../FlowHeader";

const RideInProgressAndFinalize: React.FC = () => {
  const { back, rideId } = useMapFlow() as any;
  const { showSuccess } = useUI();
  const [progress, setProgress] = React.useState(0);
  const [rating, setRating] = React.useState<number>(5);
  const [comment, setComment] = React.useState<string>("");

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 100));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async () => {
    const id = rideId || 101;
    await transportClient.rate(id, { rating, comment });
    showSuccess("¡Gracias!", "Tu calificación fue enviada");
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Viaje en curso"
        subtitle="Seguimos tu ruta en tiempo real"
        onBack={back}
      />

      <View className="px-5 py-4">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaBold text-lg text-gray-800 mb-2">
            Progreso
          </Text>
          <View className="w-full bg-gray-200 rounded-full h-3">
            <View
              className="bg-primary-500 h-3 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="font-Jakarta text-gray-600 mt-2">{progress}%</Text>
        </View>
      </View>

      {/* Rating */}
      <View className="px-5">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="font-JakartaBold text-lg text-gray-800 mb-2">
            Califica tu viaje
          </Text>
          <View className="flex-row items-center mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity
                key={i}
                className="mr-2"
                onPress={() => setRating(i)}
              >
                <Text style={{ fontSize: 24 }}>{i <= rating ? "⭐" : "☆"}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Cuéntanos cómo fue tu viaje..."
            className="bg-gray-50 rounded-lg px-4 py-3 font-Jakarta min-h-[60px]"
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>
      </View>

      <View className="px-5 pb-4 mt-2">
        <TouchableOpacity
          onPress={handleComplete}
          className="rounded-xl p-4 bg-primary-500"
          activeOpacity={0.8}
        >
          <Text className="text-white font-JakartaBold text-center">
            Finalizar y calificar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RideInProgressAndFinalize;
