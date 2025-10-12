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
import { useDriverStore, useMapFlowStore } from "@/store";
import {
  DARK_MODERN_STYLE,
  type MapConfiguration,
} from "@/constants/mapStyles";

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

const Conductor = () => {
  const { theme } = useUI();
  const { drivers } = useDriverStore();

  // Estados del conductor
  const [isOnline, setIsOnline] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"Video" | "Photos" | "Audio">(
    "Video",
  );

  // Datos de ejemplo para el conductor
  const [dailyStats] = useState({
    rides: 12,
    earnings: 144.5,
  });

  const [notifications] = useState([
    { id: 1, type: "notification", title: "Notificacion", icon: "🔔" },
    { id: 2, type: "ride", title: "Carrera", icon: "🚕" },
    { id: 3, type: "delivery", title: "Delivery", icon: "📦" },
    { id: 4, type: "delivery", title: "Delivery", icon: "📦" },
    { id: 5, type: "delivery", title: "Delivery", icon: "📦" },
    { id: 6, type: "delivery", title: "Delivery", icon: "📦" },
    { id: 7, type: "ride", title: "Carrera", icon: "🚕" },
  ]);

  const handleGoOnline = () => {
    setIsOnline(true);
  };

  const handleGoOffline = () => {
    setIsOnline(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderBottomSheetContent = () => {
    if (isExpanded) {
      return (
        <View className="px-4">
          {/* Status indicator */}
          <View className="flex-row items-center mb-4">
            <View
              className={`w-3 h-3 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-red-500"}`}
            />
            <Text className="text-white font-JakartaBold text-lg">
              {isOnline ? "En linea" : "Fuera de linea"}
            </Text>
          </View>

          {/* Tabbed Navigation */}
          <View className="flex-row mb-4 bg-black/30 rounded-xl p-1">
            {(["Video", "Photos", "Audio"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg ${activeTab === tab ? "bg-yellow-500" : ""}`}
              >
                <Text
                  className={`text-center font-JakartaBold ${activeTab === tab ? "text-black" : "text-white"}`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* List of items */}
          <View className="space-y-2">
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center"
              >
                <Text className="text-xl mr-3">{item.icon}</Text>
                <Text className="text-white font-JakartaBold flex-1">
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View className="px-4">
        {/* Status indicator */}
        <View className="flex-row items-center mb-4">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-red-500"}`}
          />
          <Text className="text-white font-JakartaBold text-lg">
            {isOnline ? "En linea" : "Fuera de linea"}
          </Text>
        </View>

        {/* Notification card */}
        <View className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
          <Text className="text-xl mr-3">🔔</Text>
          <Text className="text-white font-JakartaBold flex-1">
            Notificacion
          </Text>
        </View>
      </View>
    );
  };

  const renderBottomBar = () => {
    if (isExpanded) {
      return (
        <View className="flex-row items-center justify-between">
          <Text className="font-JakartaBold text-black dark:text-white">
            Conductor
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(root)/(tabs)/home" as any)}
            className="px-3 py-2 bg-brand-secondary rounded-full"
          >
            <Text className="text-black font-JakartaBold">Ir a Home</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-row items-center justify-between">
        <Text className="font-JakartaBold text-black dark:text-white">
          Conductor
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(root)/(tabs)/home" as any)}
          className="px-3 py-2 bg-brand-secondary rounded-full"
        >
          <Text className="text-black font-JakartaBold">Ir a Home</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          <TouchableOpacity className="w-8 h-8 items-center justify-center">
            <View className="flex-col space-y-1">
              <View className="w-6 h-0.5 bg-white rounded-full" />
              <View className="w-6 h-0.5 bg-white rounded-full" />
              <View className="w-6 h-0.5 bg-white rounded-full" />
            </View>
          </TouchableOpacity>

          <Text className="text-white font-JakartaBold text-lg">
            {dailyStats.rides} RIDES | ${dailyStats.earnings} Today
          </Text>

          <TouchableOpacity className="w-8 h-8 items-center justify-center">
            <View className="w-6 h-6 bg-white rounded-full" />
          </TouchableOpacity>
        </View>

        {/* Map background */}
        <View className="flex-1">
          <Map serviceType="transport" mapConfig={mapConfig} />

          {/* GO ONLINE Button - Solo visible cuando está offline y no expandido */}
          {!isOnline && !isExpanded && (
            <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <TouchableOpacity
                onPress={handleGoOnline}
                className="w-32 h-32 bg-yellow-500 rounded-full items-center justify-center shadow-2xl"
              >
                <Text className="text-black font-JakartaBold text-lg">
                  GO ONLINE
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom sheet with conductor interface */}
          <BottomSheet
            minHeight={140}
            maxHeight={isExpanded ? 600 : 200}
            initialHeight={isExpanded ? 500 : 160}
            useGradient
            bottomBar={renderBottomBar()}
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
            {renderBottomSheetContent()}
          </BottomSheet>
        </View>

        {/* Bottom navigation bar */}
        <View className="bg-gray-800 px-4 py-2 flex-row items-center justify-around">
          <View className="items-center">
            <View className="w-8 h-8 bg-yellow-500 rounded-full items-center justify-center mb-1">
              <Text className="text-black text-lg">⭐</Text>
            </View>
            <Text className="text-yellow-500 text-xs font-JakartaBold">
              Label
            </Text>
          </View>
          <View className="items-center">
            <View className="w-8 h-8 bg-gray-600 rounded-full items-center justify-center mb-1">
              <Text className="text-white text-lg">📱</Text>
            </View>
            <Text className="text-gray-400 text-xs">Label</Text>
          </View>
          <View className="items-center">
            <View className="w-8 h-8 bg-gray-600 rounded-full items-center justify-center mb-1">
              <Text className="text-white text-lg">⚙️</Text>
            </View>
            <Text className="text-gray-400 text-xs">Label</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Conductor;
