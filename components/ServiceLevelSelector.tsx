import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";

import CustomButton from "@/components/CustomButton";

interface ServiceLevel {
  id: number;
  name: string;
  description: string;
  baseFare: number;
  perMinuteRate: number;
  perMileRate: number;
  features: string[];
  estimatedTime?: number;
  color: string;
}

interface ServiceLevelSelectorProps {
  selectedServiceLevel: number | null;
  onSelectServiceLevel: (serviceLevelId: number) => void;
  estimatedDistance?: number;
  estimatedTime?: number;
  className?: string;
  onContinue?: () => void;
  continueLabel?: string;
  hideContinueButton?: boolean;
}

const serviceLevels: ServiceLevel[] = [
  {
    id: 1,
    name: "Economy",
    description: "Most affordable option",
    baseFare: 2.5,
    perMinuteRate: 0.15,
    perMileRate: 1.25,
    features: ["Basic vehicle", "Standard service", "Cash/Card payment"],
    color: "bg-green-50 border-green-200",
  },
  {
    id: 2,
    name: "Comfort",
    description: "Extra space, premium cars",
    baseFare: 4.0,
    perMinuteRate: 0.25,
    perMileRate: 2.0,
    features: ["Premium vehicle", "Extra space", "Professional driver"],
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: 3,
    name: "XL",
    description: "Large vehicles, 6+ seats",
    baseFare: 6.0,
    perMinuteRate: 0.35,
    perMileRate: 3.0,
    features: ["Large vehicle", "6+ seats", "Group friendly"],
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: 4,
    name: "Premium",
    description: "Luxury experience",
    baseFare: 8.0,
    perMinuteRate: 0.45,
    perMileRate: 4.0,
    features: ["Luxury vehicle", "Premium service", "Concierge support"],
    color: "bg-yellow-50 border-yellow-200",
  },
];

const ServiceLevelSelector: React.FC<ServiceLevelSelectorProps> = ({
  selectedServiceLevel,
  onSelectServiceLevel,
  estimatedDistance = 5.2,
  estimatedTime = 18,
  className = "",
  onContinue,
  continueLabel = "Continue",
  hideContinueButton = false,
}) => {
  const calculateFare = (service: ServiceLevel) => {
    const timeFare = service.perMinuteRate * estimatedTime;
    const distanceFare = service.perMileRate * estimatedDistance;
    return Math.round((service.baseFare + timeFare + distanceFare) * 100) / 100;
  };

  const renderServiceLevel = ({ item }: { item: ServiceLevel }) => {
    const isSelected = selectedServiceLevel === item.id;
    const estimatedFare = calculateFare(item);

    return (
      <TouchableOpacity
        onPress={() => onSelectServiceLevel(item.id)}
        className={`mb-3 p-4 rounded-xl border-2 mx-5 ${
          isSelected
            ? "border-primary bg-primary-50"
            : `border-gray-200 ${item.color}`
        } shadow-sm`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text
              className={`font-JakartaBold text-lg mb-1 ${
                isSelected ? "text-primary" : "text-gray-800"
              }`}
            >
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              {item.description}
            </Text>
          </View>
          <Text
            className={`font-JakartaBold text-lg ${
              isSelected ? "text-primary" : "text-gray-800"
            }`}
          >
            ${estimatedFare.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">
              ~{estimatedTime} min • {estimatedDistance} miles
            </Text>
            <View className="flex-row flex-wrap">
              {item.features.map((feature, index) => (
                <Text key={index} className="text-xs text-gray-600 mr-2 mb-1">
                  • {feature}
                </Text>
              ))}
            </View>
          </View>
          {isSelected && (
            <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
              <Text className="text-white text-sm font-bold">✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-xl font-JakartaBold mb-4 text-center px-5">
        Choose your service level
      </Text>

      <FlatList
        data={serviceLevels}
        renderItem={renderServiceLevel}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {selectedServiceLevel && (
        <View className="mt-4 p-4 bg-primary-50 rounded-lg mx-5">
          <Text className="text-sm font-JakartaSemiBold text-primary mb-2">
            Selected:{" "}
            {serviceLevels.find((s) => s.id === selectedServiceLevel)?.name}
          </Text>
          <Text className="text-xs text-primary-600">
            Estimated fare: $
            {calculateFare(
              serviceLevels.find((s) => s.id === selectedServiceLevel)!,
            ).toFixed(2)}
          </Text>
          <Text className="text-xs text-primary-600">
            ~{estimatedTime} min • {estimatedDistance} miles
          </Text>
        </View>
      )}

      {/* Inline Continue CTA */}
      {!hideContinueButton && (
        <View className="mx-5 mt-3">
          <CustomButton
            title={continueLabel}
            onPress={onContinue}
            disabled={!selectedServiceLevel}
          />
        </View>
      )}
    </View>
  );
};

export default ServiceLevelSelector;

