import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { DriverCardProps } from "@/types/type";

const DriverCard = ({
  item,
  selected,
  setSelected,
  onDetailPress,
}: DriverCardProps) => {
  console.log("[DriverCard] Rendering driver:", {
    driverId: item.id,
    driverTitle: item.title,
    driverKeys: Object.keys(item),
    firstName: item.first_name,
    lastName: item.last_name,
    name: `${item.first_name} ${item.last_name}`,
    currentlySelected: selected,
    isThisSelected: selected === item.id,
  });

  const handlePress = () => {
    console.log("[DriverCard] Driver pressed:", {
      driverId: item.id,
      driverTitle: item.title,
      callingSetSelected: typeof setSelected,
    });
    setSelected();
  };

  return (
    <View className="relative">
      {/* Botón de detalle en esquina superior derecha */}
      {onDetailPress && (
        <TouchableOpacity
          onPress={() => onDetailPress(item)}
          className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full w-8 h-8 items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Text className="text-gray-600 dark:text-gray-300 text-lg">ℹ️</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handlePress}
        className={`${
          selected === item.id
            ? "bg-brand-secondary/20"
            : "bg-white dark:bg-brand-primaryDark"
        } flex flex-row items-center justify-between py-5 px-3 rounded-xl`}
      >
        <Image
          source={{ uri: item.profile_image_url }}
          className="w-14 h-14 rounded-full"
        />

        <View className="flex-1 flex flex-col items-start justify-center mx-3">
          <View className="flex flex-row items-center justify-start mb-1">
            <Text className="text-lg font-JakartaRegular text-black dark:text-white">
              {item.title}
            </Text>

            <View className="flex flex-row items-center space-x-1 ml-2">
              <Image source={icons.star} className="w-3.5 h-3.5" />
              <Text className="text-sm font-JakartaRegular text-black dark:text-white">
                4
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center justify-start">
            <View className="flex flex-row items-center">
              <Image source={icons.dollar} className="w-4 h-4" />
              <Text className="text-sm font-JakartaRegular ml-1 text-black dark:text-white">
                ${item.price}
              </Text>
            </View>

            <Text className="text-sm font-JakartaRegular text-general-800 dark:text-gray-300 mx-1">
              |
            </Text>

            <Text className="text-sm font-JakartaRegular text-general-800 dark:text-gray-300">
              {formatTime(item.time!)}
            </Text>

            <Text className="text-sm font-JakartaRegular text-general-800 dark:text-gray-300 mx-1">
              |
            </Text>

            <Text className="text-sm font-JakartaRegular text-general-800 dark:text-gray-300">
              {item.car_seats} seats
            </Text>
          </View>
        </View>

        <Image
          source={{ uri: item.car_image_url }}
          className="h-14 w-14"
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default DriverCard;
