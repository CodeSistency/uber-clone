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
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

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
import { DUMMY_RESTAURANTS, loadNearbyRestaurants, DELIVERY_CATEGORIES, TRANSPORT_QUICK_ACCESS, Restaurant } from "../../../constants/dummyData";
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
  const [showTrafficOverlay, setShowTrafficOverlay] = useState(true);

  // Delivery mode state
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

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

  // Load restaurants when delivery mode is selected
  useEffect(() => {
    if (serviceType === "delivery") {
      loadDeliveryData();
    }
  }, [serviceType]);

  const loadDeliveryData = async () => {
    setIsLoadingRestaurants(true);
    try {
      console.log("[Home] 📦 Loading nearby restaurants...");
      const restaurants = await loadNearbyRestaurants();
      setNearbyRestaurants(restaurants);
      console.log(`[Home] ✅ Loaded ${restaurants.length} restaurants`);
    } catch (error) {
      console.error("[Home] ❌ Error loading restaurants:", error);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

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
    console.log("[Home] 📋 Current serviceType:", serviceType);

    setDestinationLocation(location);

    // Navegación condicional basada en serviceType
    if (serviceType === "delivery") {
      console.log("[Home] 🛵 Navigating to marketplace (delivery flow)");
      router.push("/(marketplace)" as any);
    } else {
      console.log("[Home] 🚗 Navigating to find-ride (transport flow)");
      router.push("/(root)/find-ride" as any);
    }
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
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View className="flex-1 bg-general-500">
      {/* Mapa completo ocupando toda la pantalla */}
      <View className="flex-1 relative">
        <Map
          serviceType={serviceType}
          restaurants={nearbyRestaurants}
          isLoadingRestaurants={isLoadingRestaurants}
        />

        {/* Live Traffic Overlay */}
        {showTrafficOverlay && (
          <View className="absolute top-20 right-4 z-10">
            <View className="bg-black/70 rounded-lg p-3">
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                <Text className="text-white text-xs font-JakartaMedium">Light Traffic</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                <Text className="text-white text-xs font-JakartaMedium">Moderate</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                <Text className="text-white text-xs font-JakartaMedium">Heavy Traffic</Text>
              </View>
            </View>

            {/* Traffic Toggle Button */}
            <TouchableOpacity
              onPress={() => setShowTrafficOverlay(!showTrafficOverlay)}
              className="bg-white rounded-full w-8 h-8 items-center justify-center mt-2 shadow-lg"
            >
              <Text className="text-xs">🚦</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Traffic Congestion Indicators - Mock Data */}
        {showTrafficOverlay && (
          <>
            {/* Highway Congestion */}
            <View className="absolute top-1/3 left-1/4 z-5">
              <View className="bg-red-500/80 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-JakartaBold">5 min delay</Text>
              </View>
            </View>

            {/* City Center Congestion */}
            <View className="absolute top-1/2 right-1/3 z-5">
              <View className="bg-yellow-500/80 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-JakartaBold">2 min delay</Text>
              </View>
            </View>
          </>
        )}


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

        {/* Grupo flotante: Tabs + Input, sin wrapper blanco */}
        <View
          className="absolute left-4 right-4 z-10"
          style={{ bottom: tabBarHeight + 12 }}
          pointerEvents="box-none"
        >
          {/* Selector de tipo de servicio (Transport/Delivery) */}
          <View className="flex-row bg-neutral-100 rounded-full p-1 mb-2">
            <TouchableOpacity
              onPress={() => setServiceType("transport")}
              className={`flex-1 py-2 rounded-full ${
                serviceType === "transport" ? "bg-primary" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center font-JakartaSemiBold ${
                  serviceType === "transport" ? "text-white" : "text-gray-600"
                }`}
              >
                🚗 Transport
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setServiceType("delivery")}
              className={`flex-1 py-2 rounded-full ${
                serviceType === "delivery" ? "bg-primary" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center font-JakartaSemiBold ${
                  serviceType === "delivery" ? "text-white" : "text-gray-600"
                }`}
              >
                🛵 Delivery
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input de destino dinámico */}
          <View className="bg-neutral-100 rounded-full border-0">
            <TouchableOpacity
              className="flex-row items-center p-4"
              onPress={() => handleDestinationPress({
                latitude: 0,
                longitude: 0,
                address: "Search location"
              })}
            >
              <Image source={icons.search} className="w-5 h-5 mr-3" />
              <Text className="flex-1 text-gray-600">
                {serviceType === "transport" ? "Where to go?" : "Search restaurants, cuisines..."}
              </Text>
              <Text className="text-gray-400 text-sm">📍</Text>
            </TouchableOpacity>
          </View>

          {/* Accesos rápidos dinámicos */}
          <View className="mt-3">
            <View className="flex-row justify-between">
              {serviceType === "transport" ? (
                // Transport mode quick access
                <>
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
                </>
              ) : (
                // Delivery mode quick access
                <>
                  <TouchableOpacity className="items-center">
                    <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-1">
                      <Text className="text-lg">🍕</Text>
                    </View>
                    <Text className="text-xs text-gray-600">Pizza</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="items-center">
                    <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-1">
                      <Text className="text-lg">🍔</Text>
                    </View>
                    <Text className="text-xs text-gray-600">Burgers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="items-center">
                    <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-1">
                      <Text className="text-lg">🥗</Text>
                    </View>
                    <Text className="text-xs text-gray-600">Healthy</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Bottom navigation is provided by the existing Tabs navigator */}
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
