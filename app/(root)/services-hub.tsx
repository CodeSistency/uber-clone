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
import { useUI } from "@/components/UIWrapper";
import { icons } from "@/constants";
import { Restaurant, loadNearbyRestaurants } from "@/constants/dummyData";
import { useDriverStore } from "@/store";

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

// Lightweight bottom sheet implemented locally for this screen
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const BottomSheet = ({
  children,
  minHeight = 140,
  maxHeight = 560,
  initialHeight = 320,
  useGradient = true,
  gradientColors = [
    "rgba(0,0,0,0.65)",
    "rgba(0,0,0,0.25)",
    "rgba(0,0,0,0.05)",
    "rgba(0,0,0,0)",
  ] as const,
  bottomBar,
  bottomBarHeight = 64,
  showBottomBarAt = 0.6,
}: {
  children: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
  initialHeight?: number;
  useGradient?: boolean;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  bottomBar?: React.ReactNode;
  bottomBarHeight?: number;
  showBottomBarAt?: number; // ratio 0..1
}) => {
  const screenHeight = Dimensions.get("window").height;
  const cappedMax = Math.min(maxHeight, Math.floor(screenHeight * 0.85));

  const heightAnim = useRef(new Animated.Value(initialHeight)).current;
  const startHeightRef = useRef(initialHeight);
  const currentHeightRef = useRef(initialHeight);

  useEffect(() => {
    const id = heightAnim.addListener(({ value }) => {
      currentHeightRef.current = value;
    });
    return () => heightAnim.removeListener(id);
  }, [heightAnim]);

  const animateTo = (toValue: number) => {
    Animated.spring(heightAnim, {
      toValue,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        startHeightRef.current = currentHeightRef.current;
      },
      onPanResponderMove: (_, g) => {
        const next = clamp(startHeightRef.current - g.dy, minHeight, cappedMax);
        heightAnim.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const end = clamp(startHeightRef.current - g.dy, minHeight, cappedMax);
        const mid = (minHeight + cappedMax) / 2;
        const snaps = [minHeight, mid, cappedMax];
        const nearest = snaps.reduce((a, b) =>
          Math.abs(b - end) < Math.abs(a - end) ? b : a,
        );
        animateTo(nearest);
      },
    }),
  ).current;

  // Animated bottom bar
  const threshold = minHeight + (cappedMax - minHeight) * showBottomBarAt;
  const barTranslate = heightAnim.interpolate({
    inputRange: [threshold - 40, threshold + 40],
    outputRange: [bottomBarHeight, 0],
    extrapolate: "clamp",
  });
  const barOpacity = heightAnim.interpolate({
    inputRange: [threshold - 20, threshold + 20],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View className="absolute left-0 right-0 bottom-0">
      <Animated.View
        style={{ height: heightAnim }}
        className="rounded-t-3xl overflow-hidden shadow-2xl"
      >
        {useGradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={{ ...StyleSheet.absoluteFillObject }}
          />
        ) : (
          <View className="absolute inset-0 bg-white dark:bg-brand-primary" />
        )}
        {/* Drag handle */}
        <View {...panResponder.panHandlers} className="items-center pt-2 pb-1">
          <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500" />
        </View>

        {/* Scrollable content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: bottomBar ? bottomBarHeight + 24 : 16,
          }}
        >
          {children}
        </ScrollView>

        {bottomBar && (
          <Animated.View
            style={{
              transform: [{ translateY: barTranslate }],
              opacity: barOpacity,
            }}
            className="absolute left-0 right-0 bottom-0"
          >
            <View className="mx-4 mb-4 rounded-2xl px-4 py-3 bg-white/95 dark:bg-black/70 border border-black/5 dark:border-white/10">
              {bottomBar}
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

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
          />

          {/* Bottom sheet with service lists */}
          <BottomSheet
            minHeight={140}
            maxHeight={560}
            initialHeight={320}
            useGradient
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
          </BottomSheet>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ServicesHub;
