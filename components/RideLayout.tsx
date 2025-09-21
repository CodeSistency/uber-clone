import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Map from "@/components/Map";
import { icons } from "@/constants";
import { useRealtimeStore } from "@/store";

const RideLayout = ({
  title,
  snapPoints,
  children,
  onReady,
}: {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
  onReady?: (api: { snapToIndex: (index: number) => void }) => void;
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const rideStatus = useRealtimeStore((s) => s.rideStatus);

  // Sync sheet position with ride status for active rides
  useEffect(() => {
    const ref = bottomSheetRef.current;
    if (!ref) return;

    // Map statuses to sheet index (0 = smaller sheet, more map)
    const statusToIndex: Record<string, number> = {
      requested: 1,
      accepted: 0,
      arriving: 0,
      arrived: 0,
      in_progress: 0,
      completed: 1,
      cancelled: 1,
      emergency: 1,
    };

    const nextIndex = statusToIndex[rideStatus as string] ?? 0;
    try {
      ref.snapToIndex(nextIndex);
    } catch (e) {
      // ignore
    }
  }, [rideStatus]);

  // Expose imperative snap method to parent
  useEffect(() => {
    if (!onReady) return;
    const ref = bottomSheetRef.current;
    if (!ref) return;
    onReady({
      snapToIndex: (index: number) => {
        try {
          ref.snapToIndex(index);
        } catch (e) {
          // ignore
        }
      },
    });
  }, [onReady]);

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <View className="flex flex-col h-screen bg-blue-500">
          <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image
                  source={icons.backArrow}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold ml-5">
              {title || "Go Back"}
            </Text>
          </View>

          <Map />
        </View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints || ["40%", "85%"]}
          index={0}
        >
          {title === "Choose a Rider" ? (
            <BottomSheetView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetView>
          ) : (
            <BottomSheetScrollView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;
