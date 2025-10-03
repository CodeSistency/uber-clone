import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";

import { icons } from "@/constants";

interface VehicleType {
  id: number;
  name: string;
  description: string;
  icon: any;
  capacity: string;
  suitableFor: string[];
}

interface VehicleTypeSelectorProps {
  selectedVehicleType: number | null;
  onSelectVehicleType: (vehicleTypeId: number) => void;
  className?: string;
}

const vehicleTypes: VehicleType[] = [
  {
    id: 1,
    name: "Standard",
    description: "Affordable rides for everyday travel",
    icon: icons.car,
    capacity: "4 passengers",
    suitableFor: ["Daily commute", "Airport transfers", "City rides"],
  },
  {
    id: 2,
    name: "SUV/Van",
    description: "More space for groups or extra luggage",
    icon: icons.car,
    capacity: "6-7 passengers",
    suitableFor: ["Group travel", "Family trips", "Extra luggage"],
  },
  {
    id: 3,
    name: "Motorcycle",
    description: "Quick rides through traffic",
    icon: icons.car,
    capacity: "1 passenger",
    suitableFor: ["Quick rides", "Traffic navigation", "Single passenger"],
  },
  {
    id: 4,
    name: "Bicycle",
    description: "Eco-friendly short distance rides",
    icon: icons.car,
    capacity: "1 passenger",
    suitableFor: ["Short distances", "Eco-conscious", "Exercise"],
  },
];

const VehicleTypeSelector: React.FC<VehicleTypeSelectorProps> = ({
  selectedVehicleType,
  onSelectVehicleType,
  className = "",
}) => {
  const renderVehicleType = ({ item }: { item: VehicleType }) => {
    const isSelected = selectedVehicleType === item.id;

    return (
      <TouchableOpacity
        onPress={() => onSelectVehicleType(item.id)}
        className={`mr-4 p-4 rounded-xl border-2 ${
          isSelected
            ? "border-primary bg-primary-50"
            : "border-gray-200 bg-white"
        } shadow-sm`}
        style={{ width: 140 }}
      >
        <View className="items-center mb-3">
          <Image
            source={item.icon}
            className={`w-8 h-8 ${isSelected ? "tint-primary" : "tint-gray-600"}`}
            resizeMode="contain"
          />
        </View>

        <Text
          className={`font-JakartaSemiBold text-sm mb-1 text-center ${
            isSelected ? "text-primary" : "text-gray-800"
          }`}
        >
          {item.name}
        </Text>

        <Text className="text-xs text-gray-600 text-center mb-2">
          {item.capacity}
        </Text>

        <Text className="text-xs text-gray-500 text-center leading-tight">
          {item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-xl font-JakartaBold mb-4 text-center">
        What type of vehicle do you need?
      </Text>

      <FlatList
        data={vehicleTypes}
        renderItem={renderVehicleType}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />

      {selectedVehicleType && (
        <View className="mt-4 p-3 bg-blue-50 rounded-lg mx-5">
          <Text className="text-sm font-JakartaSemiBold text-blue-800 mb-1">
            Selected:{" "}
            {vehicleTypes.find((v) => v.id === selectedVehicleType)?.name}
          </Text>
          <Text className="text-xs text-blue-600">
            {vehicleTypes.find((v) => v.id === selectedVehicleType)?.capacity}
          </Text>
        </View>
      )}
    </View>
  );
};

export default VehicleTypeSelector;
