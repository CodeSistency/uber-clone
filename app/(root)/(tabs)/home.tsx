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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HamburgerMenu } from "@/app/components/DrawerContent";
import DrawerContent from "@/app/components/DrawerContent";

import GoogleTextInput from "../../../components/GoogleTextInput";
import Map from "../../../components/Map";
import RideCard from "../../../components/RideCard";
import { icons, images } from "../../../constants";
import { logoutUser } from "../../../lib/auth";
import { useFetch } from "../../../lib/fetch";
import { transformRideData } from "../../../lib/utils";
import { useLocationStore } from "../../../store";
import { useUserStore } from "../../../store";
import { Ride } from "../../../types/type";
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
  const [serviceType, setServiceType] = useState<"transport" | "delivery">("transport");

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
  } = useFetch<Ride[]>(user?.id ? `ride/${user.id}` : null);

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

  // Hook personalizado para calcular el centro del mapa
  const useMapCenter = () => {
    const [screenDimensions] = useState(Dimensions.get('window'));

    const calculateMapCenter = () => {
      const bottomNavHeight = 80; // ~10%
      const inputAreaHeight = screenDimensions.height * 0.20; // 20%
      const visibleMapHeight = screenDimensions.height - bottomNavHeight - inputAreaHeight;
      const mapCenterY = visibleMapHeight / 2;

      return {
        centerY: mapCenterY,
        visibleMapHeight,
        totalOverlayHeight: bottomNavHeight + inputAreaHeight
      };
    };

    return { calculateMapCenter };
  };

  const { calculateMapCenter } = useMapCenter();

  return (
    <View className="flex-1 bg-general-500">
      {/* Mapa completo ocupando toda la pantalla */}
      <View className="flex-1 relative">
        <Map />

        {/* Service Type Tabs - Flotantes sobre el mapa */}
        <View className="absolute top-12 left-4 right-4 z-10">
          <View className="bg-white rounded-lg p-1 shadow-lg">
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setServiceType("transport")}
                className={`flex-1 py-2 px-4 rounded-md ${
                  serviceType === "transport" ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text className={`text-center font-JakartaSemiBold ${
                  serviceType === "transport" ? "text-white" : "text-gray-600"
                }`}>
                  🚗 Transport
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setServiceType("delivery")}
                className={`flex-1 py-2 px-4 rounded-md ${
                  serviceType === "delivery" ? "bg-primary" : "bg-transparent"
                }`}
              >
                <Text className={`text-center font-JakartaSemiBold ${
                  serviceType === "delivery" ? "text-white" : "text-gray-600"
                }`}>
                  🛵 Delivery
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Header con menú hamburguesa y logout */}
        <View className="absolute top-12 right-4 z-10">
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={handleSignOut}
              className="w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center"
            >
              <Image source={icons.out} className="w-4 h-4" />
            </TouchableOpacity>
            <HamburgerMenu
              onPress={() => {
                console.log("Global hamburger menu pressed!");
                setDrawerVisible(true);
              }}
            />
          </View>
        </View>

        {/* Input flotante posicionado sobre el bottom navigation (20% inferior) */}
        <View className="absolute bottom-20 left-4 right-4 z-10">
          <View className="bg-white rounded-lg shadow-lg p-4">
            <Text className="text-lg font-JakartaBold mb-3 text-center">
              Where to go?
            </Text>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-neutral-100 border-0"
              handlePress={handleDestinationPress}
            />

            {/* Popular destinations */}
            <View className="mt-4">
              <Text className="text-sm font-JakartaSemiBold text-gray-600 mb-2">
                Popular destinations
              </Text>
              <View className="flex-row justify-between">
                <TouchableOpacity className="items-center">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-1">
                    <Text className="text-lg">🏠</Text>
                  </View>
                  <Text className="text-xs text-gray-600">Home</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                  <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-1">
                    <Text className="text-lg">🏢</Text>
                  </View>
                  <Text className="text-xs text-gray-600">Work</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                  <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-1">
                    <Text className="text-lg">🛒</Text>
                  </View>
                  <Text className="text-xs text-gray-600">Mall</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <View className="flex-row justify-around py-2">
            <TouchableOpacity className="items-center py-2 px-4">
              <Image source={icons.home} className="w-6 h-6 mb-1" />
              <Text className="text-xs text-primary font-JakartaMedium">Home</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center py-2 px-4">
              <Image source={icons.list} className="w-6 h-6 mb-1 opacity-50" />
              <Text className="text-xs text-gray-500 font-JakartaMedium">Rides</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center py-2 px-4">
              <Image source={icons.chat} className="w-6 h-6 mb-1 opacity-50" />
              <Text className="text-xs text-gray-500 font-JakartaMedium">Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center py-2 px-4">
              <Image source={icons.profile} className="w-6 h-6 mb-1 opacity-50" />
              <Text className="text-xs text-gray-500 font-JakartaMedium">Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <DrawerContent
        visible={drawerVisible}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onClose={() => {
          console.log("Global drawer closed");
          setDrawerVisible(false);
        }}
      />
    </View>
  );
};

export default Home;
