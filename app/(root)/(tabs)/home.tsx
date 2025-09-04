import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HamburgerMenu } from "@/app/components/DrawerContent";
import DrawerContent from "@/app/components/DrawerContent";

import GoogleTextInput from "../../../components/GoogleTextInput";
import Map from "../../../components/Map";
import RideCard from "../../../components/RideCard";
import { icons, images } from "../../../constants";
import { useFetch } from "../../../lib/fetch";
import { useLocationStore } from "../../../store";
import { Ride } from "../../../types/type";
import { logoutUser } from "../../../lib/auth";
import { useUserStore } from "../../../store";
// Hamburger menu and drawer are now in the layout

const Home = () => {
  const { user } = useUserStore();
  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const handleSignOut = async () => {
    try {
      await logoutUser();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still navigate even if logout fails
      router.replace("/(auth)/sign-in");
    }
  };

  // Function to handle mode changes from drawer
  const handleModeChange = (newMode: "customer" | "driver" | "business") => {
    console.log("Mode changed from drawer to:", newMode);
    setCurrentMode(newMode);
    setDrawerVisible(false);
  };
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<
    "customer" | "driver" | "business"
  >("customer");

  useEffect(() => {
    const loadCurrentMode = async () => {
      try {
        const savedMode = (await AsyncStorage.getItem("user_mode")) as
          | "customer"
          | "driver"
          | "business"
          | null;
        if (savedMode) {
          setCurrentMode(savedMode);
        }
      } catch (error) {
        console.error("Error loading current mode:", error);
      }
    };
    loadCurrentMode();
  }, []);

  const [hasPermission, setHasPermission] = useState<boolean>(false);


  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(user?.id ? `/(api)/ride/${user.id}` : null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    console.log("[Home] 🎯 handleDestinationPress called with:", location);

    setDestinationLocation(location);

    console.log("[Home] 🧭 Navigating to find-ride page");
    router.push("/(root)/find-ride" as any);
  };

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={Array.isArray(recentRides) ? recentRides.slice(0, 5) : []}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <HamburgerMenu
                onPress={() => {
                  console.log("Global hamburger menu pressed!");
                  setDrawerVisible(true);
                }}
              />
              <Text className="text-2xl font-JakartaExtraBold">
                Welcome {user?.name || "User"}👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Your current location
              </Text>
              <View className="flex flex-row items-center bg-transparent h-[300px]">
                <Map />
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </>
        }
      />
      <DrawerContent
        visible={drawerVisible}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onClose={() => {
          console.log("Global drawer closed");
          setDrawerVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default Home;
