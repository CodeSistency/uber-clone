import { useMemo } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AnimatedDrawerLayout,
  DrawerRenderParams,
} from "@/components/drawer";

const SCREEN_WIDTH = Dimensions.get("window").width;

const TestDrawerScreen = () => {
  const drawerWidth = SCREEN_WIDTH * 0.5;
  const overflowMargin = SCREEN_WIDTH * 0.08;

  const drawerItems = useMemo(
    () => [
      {
        emoji: "🎯",
        title: "Acciones clave",
        subtitle: "Describe entradas comunes del menú",
      },
      {
        emoji: "⚙️",
        title: "Configuraciones",
        subtitle: "Sección para ajustes generales",
      },
      {
        emoji: "📊",
        title: "Analíticas",
        subtitle: "Visualizaciones y métricas importantes",
      },
      {
        emoji: "💬",
        title: "Mensajes",
        subtitle: "Centro de comunicación en vivo",
      },
    ],
    [],
  );

  return (
    <AnimatedDrawerLayout
      width={drawerWidth}
      screenWidth={SCREEN_WIDTH}
      overflowMargin={overflowMargin}
      animationDuration={320}
      scaleFactor={0.58}
      borderRadius={28}
      secondaryScaleFactor={0.75}
      secondaryTranslateMultiplier={0.75}
      renderBackdrop={({ progress }) => <AnimatedBackdrop progress={progress} />}
      renderDrawer={(params) => (
        <DrawerContent items={drawerItems} drawerParams={params} />
      )}
      renderContent={(params) => <MainContent drawerParams={params} />}
    />
  );
};

const AnimatedBackdrop = ({ progress }: { progress: SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return <Animated.View pointerEvents="none" style={[styles.backdrop, animatedStyle]} />;
};

const DrawerContent = ({
  items,
  drawerParams,
}: {
  items: Array<{ emoji: string; title: string; subtitle: string }>;
  drawerParams: DrawerRenderParams;
}) => {
  return (
    <SafeAreaView style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Menú Demostración</Text>
      <View style={styles.drawerDivider} />
      <ScrollView contentContainerStyle={styles.drawerContent}>
        {items.map((item) => (
          <View key={item.title} style={styles.drawerItem}>
            <Text style={styles.drawerEmoji}>{item.emoji}</Text>
            <View style={styles.drawerItemTextWrapper}>
              <Text style={styles.drawerItemTitle}>{item.title}</Text>
              <Text style={styles.drawerItemSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const MainContent = ({ drawerParams }: { drawerParams: DrawerRenderParams }) => {
  return (
    <Pressable style={styles.flexOne} onPress={drawerParams.close} disabled={!drawerParams.isOpen}>
      <SafeAreaView style={styles.mainSafeArea}>
        <View style={styles.header}>
          <Pressable style={styles.hamburgerButton} onPress={drawerParams.open}>
            <View style={styles.hamburgerLine} />
            <View style={[styles.hamburgerLine, styles.hamburgerLineMiddle]} />
            <View style={styles.hamburgerLine} />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Demo Drawer</Text>
            <Text style={styles.headerSubtitle}>Escala + translación coordinadas</Text>
          </View>
        </View>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Contenido principal</Text>
          <Text style={styles.sectionDescription}>
            Toca el botón de menú para ver el efecto. Mientras el drawer está abierto, toda esta
            vista actúa como un área para cerrarlo.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transiciones coordinadas</Text>
            <Text style={styles.cardDescription}>
              La escala reduce la vista al 58% y la traslada lo suficiente para dejar libre el ancho
              del drawer más un margen extra.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Animaciones del Drawer</Text>
            <Text style={styles.cardDescription}>
              El menú lateral se desliza suavemente y aparece con un fade-in coordinado para que la
              transición se perciba como una sola interacción.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cierre intuitivo</Text>
            <Text style={styles.cardDescription}>
              Al tocar cualquier punto del contenido escalado se invierte la animación, restaurando
              la vista a escala 1 y ocultando el menú.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: "#111827",
    paddingHorizontal: 20,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F9FAFB",
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 12,
    marginBottom: 16,
  },
  drawerContent: {
    paddingBottom: 32,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  drawerEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  drawerItemTextWrapper: {
    flex: 1,
  },
  drawerItemTitle: {
    fontSize: 16,
    color: "#F9FAFB",
    fontWeight: "600",
  },
  drawerItemSubtitle: {
    fontSize: 13,
    color: "rgba(229,231,235,0.7)",
    marginTop: 4,
  },
  mainSafeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 18,
  },
  hamburgerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1D4ED8",
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerLine: {
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  hamburgerLineMiddle: {
    marginVertical: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 12, 23, 0.5)",
  },
});

export default TestDrawerScreen;


