import React, { useMemo } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface DrawerParams {
  close: () => void;
  open: () => void;
  isOpen: boolean;
}

interface CustomerModuleDrawerContentProps {
  drawerParams: DrawerParams;
}

const CustomerModuleDrawerContent: React.FC<CustomerModuleDrawerContentProps> = ({
  drawerParams,
}) => {
  const router = useRouter();

  const moduleItems = useMemo(
    () => [
      {
        emoji: "🏠",
        title: "Inicio",
        subtitle: "Pantalla principal",
        route: "/(root)/(tabs)/home",
      },
      {
        emoji: "🚗",
        title: "Transporte",
        subtitle: "Viajes y transporte",
        route: "/(customer)/unified-flow-demo",
      },
      {
        emoji: "👨‍🚗",
        title: "Conductor",
        subtitle: "Panel del conductor",
        route: "/(driver)/dashboard",
      },
      {
        emoji: "🏪",
        title: "Negocio",
        subtitle: "Panel de negocios",
        route: "/(business)/dashboard",
      },
      {
        emoji: "🛒",
        title: "Marketplace",
        subtitle: "Tienda y productos",
        route: "/(marketplace)/home",
      },
      {
        emoji: "💳",
        title: "Wallet",
        subtitle: "Billetera y pagos",
        route: "/(customer)/wallet",
      },
      {
        emoji: "🆘",
        title: "Emergencias",
        subtitle: "Sistema de emergencias",
        route: "/(emergency)/home",
      },
      {
        emoji: "⚙️",
        title: "Configuración",
        subtitle: "Ajustes de la app",
        route: "/(root)/(tabs)/profile",
      },
    ],
    [],
  );

  const handleModulePress = (item: any) => {
    if (item.route) {
      router.push(item.route as any);
      drawerParams.close();
    }
  };

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Navegación de Módulos</Text>
      <View style={styles.drawerDivider} />
      <ScrollView contentContainerStyle={styles.drawerContent}>
        {moduleItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.drawerItem}
            onPress={() => handleModulePress(item)}
          >
            <Text style={styles.drawerEmoji}>{item.emoji}</Text>
            <View style={styles.drawerItemTextWrapper}>
              <Text style={styles.drawerItemTitle}>{item.title}</Text>
              <Text style={styles.drawerItemSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
});

export default CustomerModuleDrawerContent;
