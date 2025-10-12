import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ColorValue,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ConfigBottomSheet from "@/components/driver/ConfigBottomSheet";
import DestinationBottomSheet from "@/components/driver/DestinationBottomSheet";
import EarningsBottomSheet from "@/components/driver/EarningsBottomSheet";
import FloatingIcons from "@/components/driver/FloatingIcons";
import PromotionsBottomSheet from "@/components/driver/PromotionsBottomSheet";
import RatingsBottomSheet from "@/components/driver/RatingsBottomSheet";
import SafetyBottomSheet from "@/components/driver/SafetyBottomSheet";
import Map from "@/components/Map";
import { useUI } from "@/components/UIWrapper";
import {
  useDriverStore,
  useEarningsStore,
  useSafetyStore,
  useRatingsStore,
  useDriverConfigStore,
  useMapFlowStore,
} from "@/store";
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
  showBottomBarAt?: number;
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
        <View {...panResponder.panHandlers} className="items-center pt-2 pb-1">
          <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500" />
        </View>
        {children}
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

const DriverDashboard = () => {
  const { theme } = useUI();
  const { drivers } = useDriverStore();
  const { dailyEarnings } = useEarningsStore();
  const { isInRide } = useSafetyStore();
  const { overallRating } = useRatingsStore();
  const { profile } = useDriverConfigStore();

  // Estados del conductor
  const [isOnline, setIsOnline] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeBottomSheet, setActiveBottomSheet] = useState<string | null>(
    null,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTitle, setMenuTitle] = useState<string>("");
  const [menuOptions, setMenuOptions] = useState<
    {
      label: string;
      route?: string;
      action?: () => void;
      emoji?: string;
    }[]
  >([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Datos de ejemplo para el conductor
  const [dailyStats] = useState({
    rides: 12,
    earnings: 144.5,
  });

  const handleGoOnline = () => {
    setIsOnline(true);
  };

  const handleGoOffline = () => {
    setIsOnline(false);
  };

  const handleIconPress = (iconId: string) => {
    // Build menu content instead of opening a bottom sheet
    const toOption = (
      label: string,
      route?: string,
      emoji?: string,
      action?: () => void,
    ) => ({ label, route, emoji, action });

    const menus: Record<
      string,
      {
        title: string;
        options: {
          label: string;
          route?: string;
          action?: () => void;
          emoji?: string;
        }[];
      }
    > = {
      safety: {
        title: "Seguridad",
        options: [
          toOption("Emergencia", "/(driver)/safety", "🆘"),
          toOption("Compartir Viaje", "/(driver)/safety", "📍"),
          toOption("Contactos Emergencia", "/(driver)/safety", "📞"),
          toOption("Reportar Incidente", "/(driver)/safety", "📋"),
        ],
      },
      earnings: {
        title: "Ganancias",
        options: [
          toOption("Ver Detalles", "/(driver)/earnings", "📊"),
          toOption("Pago Instantáneo", "/(driver)/earnings", "💳"),
          toOption("Gráficos por Hora", "/(driver)/earnings", "📈"),
          toOption("Promociones Activas", "/(driver)/earnings", "🎯"),
        ],
      },
      ratings: {
        title: "Calificaciones",
        options: [
          toOption("Métricas Completas", "/(driver)/ratings", "📊"),
          toOption("Comentarios Recientes", "/(driver)/ratings", "💬"),
          toOption("Soporte y Ayuda", "/(driver)/ratings", "🆘"),
        ],
      },
      config: {
        title: "Configuración",
        options: [
          toOption("Perfil del Conductor", "/(driver)/settings", "👤"),
          toOption("Mis Vehículos", "/(driver)/settings", "🚗"),
          toOption("Tipos de Servicio", "/(driver)/settings", "🎯"),
          toOption("Documentos", "/(driver)/settings", "📄"),
        ],
      },
      destination: {
        title: "Modo Destino",
        options: [
          toOption("Casa", "/(driver)/settings", "🏠"),
          toOption("Trabajo", "/(driver)/settings", "🏢"),
          toOption("Nuevo Destino", "/(driver)/settings", "📍"),
        ],
      },
      promotions: {
        title: "Promociones",
        options: [
          toOption("Weekend Warrior", "/(driver)/earnings", "🎯"),
          toOption("Bonificación por Zona", "/(driver)/earnings", "💰"),
          toOption("Ver Todas", "/(driver)/earnings", "📊"),
        ],
      },
    };

    const menu = menus[iconId];
    if (menu) {
      setMenuTitle(menu.title);
      setMenuOptions(menu.options);
      setIsMenuOpen(true);
    }
  };

  const handleCloseBottomSheet = () => {
    setActiveBottomSheet(null);
  };

  const handleNavigate = (route: string) => {
    setActiveBottomSheet(null);
    router.push(route as any);
  };

  const renderBottomSheetContent = () => {
    if (isExpanded) {
      return (
        <View className="px-4">
          <View className="flex-row items-center mb-4">
            <View
              className={`w-3 h-3 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-red-500"}`}
            />
            <Text className="text-white font-JakartaBold text-lg">
              {isOnline ? "En linea" : "Fuera de linea"}
            </Text>
          </View>

          <View className="flex-row mb-4 bg-black/30 rounded-xl p-1">
            {(["Video", "Photos", "Audio"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                className="flex-1 py-2 rounded-lg bg-yellow-500"
              >
                <Text className="text-center font-JakartaBold text-black">
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="space-y-2">
            {[
              { icon: "🔔", title: "Notificacion" },
              { icon: "🚕", title: "Carrera" },
              { icon: "📦", title: "Delivery" },
              { icon: "📦", title: "Delivery" },
              { icon: "📦", title: "Delivery" },
              { icon: "📦", title: "Delivery" },
              { icon: "🚕", title: "Carrera" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
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
        <View className="flex-row items-center mb-4">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-red-500"}`}
          />
          <Text className="text-white font-JakartaBold text-lg">
            {isOnline ? "En linea" : "Fuera de linea"}
          </Text>
        </View>

        <View className="bg-black/40 rounded-xl px-4 py-3 flex-row items-center">
          <Text className="text-xl mr-3">🔔</Text>
          <Text className="text-white font-JakartaBold flex-1">
            Notificacion
          </Text>
        </View>
      </View>
    );
  };

  const renderBottomBar = () => (
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
          <TouchableOpacity
            onPress={() => setIsDrawerOpen(true)}
            className="w-8 h-8 items-center justify-center"
          >
            <Text className="text-white text-2xl">☰</Text>
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

          {/* Floating Icons */}
          <FloatingIcons onIconPress={handleIconPress} />

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

          {/* Bottom sheet with conductor interface (hidden when an overlay sheet is open) */}
          {!activeBottomSheet && (
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
          )}
        </View>

        {/* Bottom navigation bar */}
        <View className="bg-gray-800 px-4 py-2 flex-row items-center justify-around">
          <TouchableOpacity
            onPress={() => router.push("/(driver)/ride-requests" as any)}
            className="items-center"
            activeOpacity={0.8}
          >
            <View className="w-8 h-8 bg-yellow-500 rounded-full items-center justify-center mb-1">
              <Text className="text-black text-lg">🧾</Text>
            </View>
            <Text className="text-yellow-500 text-xs font-JakartaBold">
              Solicitudes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(driver)/earnings" as any)}
            className="items-center"
            activeOpacity={0.8}
          >
            <View className="w-8 h-8 bg-gray-600 rounded-full items-center justify-center mb-1">
              <Text className="text-white text-lg">💰</Text>
            </View>
            <Text className="text-gray-200 text-xs font-JakartaBold">
              Ganancias
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(driver)/safety" as any)}
            className="items-center"
            activeOpacity={0.8}
          >
            <View className="w-8 h-8 bg-gray-600 rounded-full items-center justify-center mb-1">
              <Text className="text-white text-lg">🛡️</Text>
            </View>
            <Text className="text-gray-200 text-xs font-JakartaBold">
              Seguridad
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Bottom Sheet Overlay */}
      {/* Modern modal menu for floating icons */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View className="flex-1">
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
          />
          <View className="absolute left-4 right-4 bottom-6 bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-2xl border border-black/5 dark:border-white/10">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-JakartaBold text-lg text-black dark:text-white">
                {menuTitle}
              </Text>
              <TouchableOpacity
                onPress={() => setIsMenuOpen(false)}
                className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10"
              >
                <Text className="text-black dark:text-white">✕</Text>
              </TouchableOpacity>
            </View>
            <View className="mt-1">
              {menuOptions.map((opt, idx) => (
                <TouchableOpacity
                  key={`${opt.label}-${idx}`}
                  onPress={() => {
                    setIsMenuOpen(false);
                    opt.action
                      ? opt.action()
                      : opt.route && router.push(opt.route as any);
                  }}
                  className="flex-row items-center px-3 py-3 rounded-xl mb-2 bg-neutral-50 dark:bg-white/5"
                  activeOpacity={0.8}
                >
                  {opt.emoji ? (
                    <Text className="text-xl mr-3">{opt.emoji}</Text>
                  ) : null}
                  <Text className="font-JakartaMedium text-black dark:text-white">
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Drawer lateral con accesos rápidos */}
      <Modal
        visible={isDrawerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View className="flex-1 flex-row">
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setIsDrawerOpen(false)}
          />
          <View className="w-72 bg-white dark:bg-gray-900 h-full p-4 border-l border-black/5 dark:border-white/10">
            <Text className="font-JakartaBold text-lg mb-3 text-black dark:text-white">
              Menú Conductor
            </Text>
            {[
              { label: "Dashboard", route: "/(driver)/dashboard", emoji: "🏠" },
              {
                label: "Solicitudes",
                route: "/(driver)/ride-requests",
                emoji: "🧾",
              },
              {
                label: "Viaje Activo",
                route: "/(driver)/active-ride",
                emoji: "🚕",
              },
              { label: "Ganancias", route: "/(driver)/earnings", emoji: "💰" },
              { label: "Seguridad", route: "/(driver)/safety", emoji: "🛡️" },
              {
                label: "Calificaciones",
                route: "/(driver)/ratings",
                emoji: "⭐",
              },
              { label: "Perfil", route: "/(driver)/profile", emoji: "👤" },
              { label: "Ajustes", route: "/(driver)/settings", emoji: "⚙️" },
            ].map((item, idx) => (
              <TouchableOpacity
                key={`${item.label}-${idx}`}
                onPress={() => {
                  setIsDrawerOpen(false);
                  router.push(item.route as any);
                }}
                className="flex-row items-center px-3 py-3 rounded-xl mb-2 bg-neutral-50 dark:bg-white/5"
                activeOpacity={0.8}
              >
                <Text className="text-xl mr-3">{item.emoji}</Text>
                <Text className="font-JakartaMedium text-black dark:text-white">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DriverDashboard;
