import { router } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";

import RatingSystem from "@/components/RatingSystem";

const RatingScreen = () => {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const tipOptions = [2, 5, 10];

  const handleTipSelect = (tip: number) => {
    setSelectedTip(tip);
    setShowCustomInput(false);
    setCustomTip("");
  };

  const handleCustomTip = () => {
    setSelectedTip(null);
    setShowCustomInput(true);
  };

  const handleSubmitRating = (rating: number, comment: string) => {
    const finalTip = showCustomInput
      ? parseFloat(customTip) || 0
      : selectedTip || 0;
    console.log("[RatingScreen] Rating submitted:", {
      rating,
      comment,
      tip: finalTip,
    });

    // Here you would typically send the rating to your backend
    // For now, we'll just navigate back to the rides list
    router.replace("/(root)/(tabs)/rides");
  };

  const handleSkip = () => {
    console.log("[RatingScreen] Rating skipped");
    router.replace("/(root)/(tabs)/rides");
  };

  return (
    <View className="flex-1 bg-general-500">
      {/* Spacer to push content to bottom */}
      <View className="flex-1" />

      {/* Main Content Container */}
      <View className="bg-white rounded-t-3xl p-6">
        {/* Driver Info */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
            <Text className="text-2xl">🚗</Text>
          </View>
          <Text className="text-lg font-JakartaBold mb-1">Sarah Johnson</Text>
          <Text className="text-sm text-gray-600">
            Toyota Camry 2020 • Comfort Service
          </Text>
        </View>

        {/* Rating Stars */}
        <View className="items-center mb-6">
          <Text className="text-lg font-JakartaSemiBold mb-3">
            How was your experience?
          </Text>
          <View className="flex-row mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} className="mx-1">
                <Text className="text-3xl">⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tip Section */}
        <View className="mb-6">
          <Text className="text-lg font-JakartaSemiBold mb-4 text-center">
            Add a Tip (Optional)
          </Text>

          {/* Tip Options */}
          <View className="flex-row justify-center mb-4">
            {tipOptions.map((tip) => (
              <TouchableOpacity
                key={tip}
                onPress={() => handleTipSelect(tip)}
                className={`mx-2 px-4 py-2 rounded-lg border-2 ${
                  selectedTip === tip
                    ? "border-primary bg-primary-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                <Text
                  className={`font-JakartaMedium ${
                    selectedTip === tip ? "text-primary" : "text-gray-700"
                  }`}
                >
                  ${tip}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleCustomTip}
              className={`mx-2 px-4 py-2 rounded-lg border-2 ${
                showCustomInput
                  ? "border-primary bg-primary-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <Text
                className={`font-JakartaMedium ${
                  showCustomInput ? "text-primary" : "text-gray-700"
                }`}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom Tip Input */}
          {showCustomInput && (
            <View className="mb-4">
              <TextInput
                placeholder="Enter tip amount"
                value={customTip}
                onChangeText={setCustomTip}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-4 py-3 text-center font-JakartaMedium"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            onPress={() => handleSubmitRating(5, "")}
            className="bg-primary py-4 rounded-lg"
          >
            <Text className="text-white text-center font-JakartaBold">
              Submit Rating
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} className="py-3">
            <Text className="text-gray-500 text-center font-JakartaMedium">
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RatingScreen;
