import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  ColorValue,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Map from "@/components/Map";
import InlineBottomSheet from "@/components/ui/InlineBottomSheet";
import { useUI } from "@/components/UIWrapper";
import { icons } from "@/constants";
import { Restaurant, loadNearbyRestaurants } from "@/constants/dummyData";
import { useDriverStore } from "@/store";
import {
  DARK_MODERN_STYLE,
  type MapConfiguration,
} from "@/constants/mapStyles";

const ServicePill = ({
  title,
  icon,
  active = false,
  onPress,
}: {
  title: string;
  icon: string;
  active?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-5 py-3 rounded-xl mr-3 ${active ? "bg-brand-secondary" : "bg-white dark:bg-brand-primaryDark"}`}
  >
    <View className="flex-row items-center">
      <Text className="text-base font-JakartaBold mr-2">{title}</Text>
      <Text className="text-lg">{icon}</Text>
    </View>
  </TouchableOpacity>
);

// Using the enhanced InlineBottomSheet component with gradient and bottom bar features

const ServicesHub = () => {
  const { theme } = useUI();
  const { drivers } = useDriverStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoadingRestaurants(true);
      try {
        const data = await loadNearbyRestaurants();
        setRestaurants(data);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    run();
  }, []);

  // 🎨 Configuración del mapa con tema dark moderno
  const mapConfig: Partial<MapConfiguration> = {
    theme: "dark",
    customStyle: DARK_MODERN_STYLE,
    userInterfaceStyle: "dark",
    mapType: "standard",
    showsUserLocation: true,
    showsPointsOfInterest: false,
    showsBuildings: true,
    showsTraffic: false,
    showsCompass: true,
    showsScale: false,
    showsMyLocationButton: false,
    zoomEnabled: true,
    scrollEnabled: true,
    rotateEnabled: true,
    pitchEnabled: true,
    tintColor: "#00FF88",
    routeColor: "#4285F4",
    trailColor: "#FFE014",
    predictionColor: "#00FF88",
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
      <View className="flex-1">
        {/* Top bar */}
        <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
          <Text className="text-lg font-JakartaBold text-white">
            ¡Hola, Jose!
          </Text>
          <View className="flex-row items-center">
            <Text className="text-white mr-1">0.00 $</Text>
            <Text className="text-white">4.4/5 ⭐</Text>
          </View>
        </View>

        {/* Search bar mimic */}
        <View className="mx-4 mb-3 bg-white dark:bg-brand-primary rounded-full flex-row items-center px-4 py-3">
          <Image source={icons.search} className="w-4 h-4 mr-2" />
          <Text className="text-gray-500 flex-1">Busca tu destino</Text>
        </View>

        {/* Map background */}
        <View className="flex-1">
          <Map
            serviceType="transport"
            restaurants={restaurants}
            isLoadingRestaurants={loadingRestaurants}
            mapConfig={mapConfig}
          />

          {/* Bottom sheet with service lists */}
          <InlineBottomSheet
            visible={true}
            minHeight={140}
            maxHeight={560}
            initialHeight={320}
            useGradient
            useBlur
            blurIntensity={50}
            blurTint={theme === "dark" ? "dark" : "light"}
            blurFallbackColor={
              theme === "dark" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.25)"
            }
            bottomBar={
              <View className="flex-row items-center justify-between">
                <Text className="font-JakartaBold text-black dark:text-white">
                  Servicios
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(root)/(tabs)/home" as any)}
                  className="px-3 py-2 bg-brand-secondary rounded-full"
                >
                  <Text className="text-black font-JakartaBold">Ir a Home</Text>
                </TouchableOpacity>
              </View>
            }
            bottomBarHeight={64}
            showBottomBarAt={0.6}
            gradientColors={
              theme === "dark"
                ? ([
                    "rgba(0,0,0,0.92)",
                    "rgba(0,0,0,0.78)",
                    "rgba(18,18,18,0.66)",
                    "rgba(30,30,30,0.64)",
                  ] as const)
                : ([
                    "rgba(20,20,20,0.9)",
                    "rgba(50,50,50,0.75)",
                    "rgba(160,160,160,0.55)",
                    "rgba(235,235,235,0.55)",
                  ] as const)
            }
          >
            {/* Servicios */}
            <View className="px-4">
              <Text className="text-white font-JakartaBold text-lg mb-2">
                Servicios
              </Text>
              <View className="flex-row">
                <ServicePill
                  title="Viajes"
                  icon="🚕"
                  active
                  onPress={() => router.push("/(root)/find-ride" as any)}
                />
                <ServicePill
                  title="Envios"
                  icon="📦"
                  onPress={() => router.push("/(marketplace)" as any)}
                />
              </View>
            </View>

            {/* Compra */}
            <View className="px-4 mt-4">
              <Text className="text-white font-JakartaBold text-lg mb-2">
                Compra!
              </Text>
              <View className="flex-row">
                <ServicePill title="Comida" icon="🍔" />
                <ServicePill title="Medicina" icon="💊" />
              </View>
            </View>

            {/* Popular */}
            <View className="px-4 mt-4">
              <Text className="text-white font-JakartaBold text-lg mb-2">
                Popular!
              </Text>
              <View className="flex-row">
                <TouchableOpacity className="flex-1 h-28 mr-3 rounded-2xl bg-white/10 border border-white/20 items-center justify-center">
                  <Text className="text-white font-JakartaBold">Imagen</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 h-28 rounded-2xl bg-black items-center justify-center">
                  <Text className="text-white font-JakartaBold">Imagen</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Cerca de ti */}
            <View className="px-4 mt-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-JakartaBold text-lg">
                  Cerca de ti!
                </Text>
                <View className="px-3 py-1 rounded-full bg-black/70">
                  <Text className="text-white text-xs">transporte 🚗</Text>
                </View>
              </View>

              <View className="space-y-2">
                <FlatList
                  data={drivers}
                  keyExtractor={(item) => String(item.id)}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View className="bg-white/90 dark:bg-brand-primary rounded-xl px-4 py-3 mb-2 flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1 mr-3">
                        <Text className="text-xl mr-3">🚕</Text>
                        <View>
                          <Text className="font-JakartaBold text-black dark:text-white">
                            {item.first_name}
                          </Text>
                          <Text className="text-xs text-gray-600 dark:text-gray-300">
                            Nissan v1 • 6 min • 6 km
                          </Text>
                        </View>
                      </View>
                      <Text className="font-JakartaBold text-green-600">
                        6.5$
                      </Text>
                    </View>
                  )}
                  ListEmptyComponent={() => (
                    <Text className="text-gray-500 dark:text-gray-300">
                      No drivers nearby
                    </Text>
                  )}
                />
              </View>
            </View>
          </InlineBottomSheet>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ServicesHub;
