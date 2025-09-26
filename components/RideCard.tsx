import { Image, Text, View, TouchableOpacity } from "react-native";

import { icons } from "@/constants";
import { endpoints } from "@/lib/endpoints";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

const RideCard = ({ ride, onPress }: { ride: Ride; onPress?: () => void }) => {
  console.log("[RideCard] Rendering ride:", {
    rideId: ride.ride_id,
    origin: ride.origin_address,
    destination: ride.destination_address,
    originCoords: [ride.origin_latitude, ride.origin_longitude],
    destinationCoords: [ride.destination_latitude, ride.destination_longitude],
    paymentStatus: ride.payment_status,
  });

  const CardContent = () => (
    <View className="flex flex-row items-center justify-center bg-white dark:bg-brand-primaryDark rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: endpoints.geoapify.url(
                `staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14`,
              ),
            }}
            className="w-[80px] h-[90px] rounded-lg"
          />

          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text
                className="text-md font-JakartaMedium text-black dark:text-white"
                numberOfLines={1}
              >
                {ride.origin_address}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text
                className="text-md font-JakartaMedium text-black dark:text-white"
                numberOfLines={1}
              >
                {ride.destination_address}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-5 bg-general-500 dark:bg-brand-primary rounded-lg p-3 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500 dark:text-gray-300">
              Date & Time
            </Text>
            <Text
              className="text-md font-JakartaBold text-black dark:text-white"
              numberOfLines={1}
            >
              {formatDate(ride.created_at)}, {formatTime(ride.ride_time)}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500 dark:text-gray-300">
              Driver
            </Text>
            <Text className="text-md font-JakartaBold text-black dark:text-white">
              {ride.driver.first_name} {ride.driver.last_name}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500 dark:text-gray-300">
              Car Seats
            </Text>
            <Text className="text-md font-JakartaBold text-black dark:text-white">
              {ride.driver.car_seats}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500 dark:text-gray-300">
              Payment Status
            </Text>
            <Text
              className={`text-md capitalize font-JakartaBold ${ride.payment_status === "paid" ? "text-green-500" : "text-red-500"}`}
            >
              {ride.payment_status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress}>
      <CardContent />
    </TouchableOpacity>
  ) : (
    <CardContent />
  );
};

export default RideCard;
