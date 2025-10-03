import React, { useMemo, useCallback } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RideCard from "@/components/RideCard";
import { images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { transformRideData } from "@/lib/utils";
import { useUserId } from "@/store/user";
import { Ride } from "@/types/type";

const Rides = () => {
  const userId = useUserId();

  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(userId ? `ride/${userId}` : null);

  // Memoize transformed rides to prevent unnecessary re-transformations
  const transformedRides = useMemo(() => {
    if (!Array.isArray(recentRides)) return [];

    console.log("[Rides] Transforming rides data:", recentRides.length);

    return recentRides.map((item, index) => {
      console.log("[Rides] Raw item from backend:", item);
      const transformedRide = transformRideData(item);
      console.log("[Rides] Transformed ride:", transformedRide);
      return transformedRide as Ride;
    });
  }, [recentRides]);

  // Memoize render item function to prevent recreation on every render
  const renderRideItem = useCallback(({ item }: { item: Ride }) => {
    return <RideCard ride={item} />;
  }, []);

  // Memoize key extractor for better performance
  const keyExtractor = useCallback((item: Ride, index: number) => {
    return item?.ride_id?.toString() || index.toString();
  }, []);

  // Memoize empty component
  const ListEmptyComponent = useMemo(
    () => (
      <View className="flex flex-col items-center justify-center px-5">
        <Image
          source={images.noResult}
          className="w-40 h-40"
          alt="No recent rides found"
          resizeMode="contain"
        />
        <Text className="text-sm">No recent rides found</Text>
        <Text className="text-primary text-sm font-JakartaBold">
          Book your first ride now!
        </Text>
      </View>
    ),
    [],
  );

  console.log("[Rides] Page data:", {
    userId,
    recentRidesCount: Array.isArray(recentRides) ? recentRides.length : 0,
    transformedRidesCount: transformedRides.length,
    loading,
    error,
  });

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark items-center justify-center">
        <ActivityIndicator size="large" color="#0286FF" />
        <Text className="text-white mt-4">Loading your rides...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark items-center justify-center px-5">
        <Text className="text-white text-center mb-4">
          Unable to load rides
        </Text>
        <Text className="text-white/70 text-center text-sm">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
      <FlatList
        data={transformedRides}
        renderItem={renderRideItem}
        keyExtractor={keyExtractor}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={
          <Text className="text-2xl font-JakartaBold my-5 text-black dark:text-white">
            All Rides
          </Text>
        }
        // Performance optimizations
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate height of RideCard
          offset: 120 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

export default Rides;
