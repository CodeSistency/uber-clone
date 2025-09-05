import { router } from "expo-router";
import { View, Text } from "react-native";

import RatingSystem from "@/components/RatingSystem";

const RatingScreen = () => {
  const handleSubmitRating = (rating: number, comment: string, tip: number) => {
    console.log("[RatingScreen] Rating submitted:", { rating, comment, tip });

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
      {/* Spacer to push rating component to bottom */}
      <View className="flex-1" />

      {/* Rating Component */}
      <RatingSystem
        driverName="Sarah Johnson"
        driverImage="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100"
        vehicleInfo="Toyota Camry 2020 • Comfort Service"
        onSubmitRating={handleSubmitRating}
        onSkip={handleSkip}
      />
    </View>
  );
};

export default RatingScreen;
