import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";

import { icons } from "@/constants";

interface RatingSystemProps {
  driverName: string;
  driverImage?: string;
  vehicleInfo: string;
  onSubmitRating: (rating: number, comment: string, tip: number) => void;
  onSkip?: () => void;
  className?: string;
}

const RatingSystem: React.FC<RatingSystemProps> = ({
  driverName,
  driverImage,
  vehicleInfo,
  onSubmitRating,
  onSkip,
  className = "",
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState<string>("");

  const tipOptions = [2, 5, 10];

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleTipSelect = (tip: number) => {
    setSelectedTip(tip);
    setCustomTip("");
  };

  const handleCustomTipChange = (text: string) => {
    setCustomTip(text);
    setSelectedTip(null);
  };

  const getFinalTip = (): number => {
    if (selectedTip) return selectedTip;
    if (customTip) return parseFloat(customTip) || 0;
    return 0;
  };

  const handleSubmit = () => {
    onSubmitRating(rating, comment.trim(), getFinalTip());
  };

  const renderStars = () => {
    return (
      <View className="flex-row justify-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            className="mx-2"
          >
            <Image
              source={icons.star}
              className={`w-8 h-8 ${
                star <= rating ? "tint-yellow-400" : "tint-gray-300"
              }`}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View className={`bg-white p-6 rounded-t-3xl ${className}`}>
      <Text className="text-xl font-JakartaBold text-center mb-6">
        Rate Your Ride
      </Text>

      {/* Driver Info */}
      <View className="flex-row items-center justify-center mb-6 p-4 bg-gray-50 rounded-lg">
        {driverImage && (
          <Image
            source={{ uri: driverImage }}
            className="w-12 h-12 rounded-full mr-3"
          />
        )}
        <View className="flex-1">
          <Text className="font-JakartaSemiBold text-base">{driverName}</Text>
          <Text className="text-sm text-gray-600">{vehicleInfo}</Text>
        </View>
      </View>

      {/* Rating Question */}
      <Text className="text-lg font-JakartaSemiBold text-center mb-4">
        How was your experience?
      </Text>

      {/* Stars */}
      {renderStars()}

      {/* Comment Input */}
      <View className="mb-6">
        <Text className="text-sm font-JakartaMedium text-gray-700 mb-2">
          Tell us more... (optional)
        </Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Share your feedback..."
          multiline
          numberOfLines={3}
          className="border border-gray-300 rounded-lg p-3 text-sm"
          style={{ minHeight: 80 }}
          maxLength={200}
        />
        <Text className="text-xs text-gray-500 text-right mt-1">
          {comment.length}/200
        </Text>
      </View>

      {/* Tip Section */}
      <View className="mb-6">
        <Text className="text-sm font-JakartaMedium text-gray-700 mb-3">
          Add a tip (optional)
        </Text>

        {/* Predefined Tips */}
        <View className="flex-row justify-center mb-3">
          {tipOptions.map((tip) => (
            <TouchableOpacity
              key={tip}
              onPress={() => handleTipSelect(tip)}
              className={`mx-2 px-4 py-2 rounded-full border-2 ${
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

          {/* Custom Tip Input */}
          <View className="mx-2 px-3 py-2 rounded-full border-2 border-gray-300 bg-white flex-row items-center">
            <Text className="text-gray-500 mr-1">$</Text>
            <TextInput
              value={customTip}
              onChangeText={handleCustomTipChange}
              placeholder="Custom"
              keyboardType="numeric"
              className="flex-1 text-center"
              maxLength={4}
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        {onSkip && (
          <TouchableOpacity
            onPress={onSkip}
            className="flex-1 py-3 px-6 rounded-lg border border-gray-300"
          >
            <Text className="text-center font-JakartaMedium text-gray-600">
              Skip
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={rating === 0}
          className={`flex-1 py-3 px-6 rounded-lg ${
            rating > 0 ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <Text
            className={`text-center font-JakartaBold ${
              rating > 0 ? "text-white" : "text-gray-500"
            }`}
          >
            Submit Rating
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating Summary */}
      {rating > 0 && (
        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
          <Text className="text-sm font-JakartaMedium text-blue-800 text-center">
            Rating: {rating} ⭐{" "}
            {getFinalTip() > 0 && `• Tip: $${getFinalTip()}`}
          </Text>
          {comment && (
            <Text className="text-xs text-blue-600 text-center mt-1">
              Comment added
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default RatingSystem;
