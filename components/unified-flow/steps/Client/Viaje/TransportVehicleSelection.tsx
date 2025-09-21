import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import { useMapFlow } from "@/hooks/useMapFlow";

import FlowHeader from "../../../FlowHeader";

const VEHICLE_TYPES = [
  {
    id: "car",
    name: "Carro",
    icon: "🚗",
    options: [
      { id: "basic", name: "Básico", price: "$5.000", time: "5 min" },
      { id: "premium", name: "Premium", price: "$8.000", time: "3 min" },
      { id: "xl", name: "XL", price: "$12.000", time: "4 min" },
    ],
  },
  {
    id: "motorcycle",
    name: "Moto",
    icon: "🏍️",
    options: [
      { id: "standard", name: "Estándar", price: "$3.000", time: "8 min" },
      { id: "express", name: "Express", price: "$4.500", time: "5 min" },
    ],
  },
];

const TransportVehicleSelection: React.FC = () => {
  const { next, back } = useMapFlow();
  const [selectedTab, setSelectedTab] = useState<"car" | "motorcycle">("car");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");

  const currentVehicles =
    VEHICLE_TYPES.find((v) => v.id === selectedTab)?.options || [];

  return (
    <View className="flex-1">
      <FlowHeader title="Seleccionar Vehículo" onBack={back} />

      {/* Tabs */}
      <View className="flex-row mb-4 bg-gray-100 rounded-lg p-1">
        {VEHICLE_TYPES.map((vehicleType) => (
          <TouchableOpacity
            key={vehicleType.id}
            onPress={() =>
              setSelectedTab(vehicleType.id as "car" | "motorcycle")
            }
            className={`flex-1 py-2 px-4 rounded-md ${
              selectedTab === vehicleType.id ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text className="text-center font-JakartaMedium">
              {vehicleType.icon} {vehicleType.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vehicle Options */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-3">
          {currentVehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              onPress={() => setSelectedVehicle(vehicle.id)}
              className={`bg-white rounded-xl p-4 shadow-sm border-2 ${
                selectedVehicle === vehicle.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-100"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Text className="text-2xl mr-3">
                    {VEHICLE_TYPES.find((v) => v.id === selectedTab)?.icon}
                  </Text>
                  <View className="flex-1">
                    <Text className="font-JakartaBold text-lg text-gray-800">
                      {vehicle.name}
                    </Text>
                    <Text className="font-Jakarta text-sm text-gray-600">
                      {vehicle.time} • {vehicle.price}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-JakartaBold text-xl text-primary-600">
                    {vehicle.price}
                  </Text>
                  <Text className="font-Jakarta text-xs text-gray-500">
                    {vehicle.time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => selectedVehicle && next()}
        disabled={!selectedVehicle}
        className={`rounded-lg p-4 mt-4 ${
          selectedVehicle ? "bg-primary-500" : "bg-gray-300"
        }`}
      >
        <Text className="text-white font-JakartaBold text-center">
          Continuar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TransportVehicleSelection;
