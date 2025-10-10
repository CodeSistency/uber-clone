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
      // Rutas principales del customer
      {
        emoji: "🚗",
        title: "Transporte",
        subtitle: "Viajes y transporte",
        route: "/(customer)/unified-flow-demo",
      },
      {
        emoji: "🧪",
        title: "Demo Gorhom",
        subtitle: "Prueba de @gorhom/bottom-sheet",
        route: "/(customer)/unified-flow-demo-gorhom",
      },
      {
        emoji: "👤",
        title: "Perfil",
        subtitle: "Mi perfil de usuario",
        route: "/(customer)/profile",
      },
      {
        emoji: "💳",
        title: "Wallet",
        subtitle: "Billetera y pagos",
        route: "/(customer)/wallet",
      },
      
      // Subrutas de Profile
      {
        emoji: "✏️",
        title: "Editar Info Básica",
        subtitle: "Nombre, fecha de nacimiento",
        route: "/(customer)/profile/edit-basic-info",
      },
      {
        emoji: "📧",
        title: "Cambiar Email",
        subtitle: "Actualizar dirección de email",
        route: "/(customer)/profile/change-email",
      },
      {
        emoji: "📱",
        title: "Cambiar Teléfono",
        subtitle: "Actualizar número de teléfono",
        route: "/(customer)/profile/change-phone",
      },
      {
        emoji: "📍",
        title: "Cambiar Ubicación",
        subtitle: "Actualizar ubicación",
        route: "/(customer)/profile/change-location",
      },
      {
        emoji: "🆔",
        title: "Verificar Cuenta",
        subtitle: "Subir documentos de identidad",
        route: "/(customer)/profile/verify-account",
      },
      {
        emoji: "⚙️",
        title: "Preferencias",
        subtitle: "Configuración personal",
        route: "/(customer)/profile/preferences",
      },
      {
        emoji: "🏠",
        title: "Mis Direcciones",
        subtitle: "Direcciones guardadas",
        route: "/(customer)/profile/addresses",
      },
      
      // Subrutas de Wallet
      {
        emoji: "💸",
        title: "Enviar Dinero",
        subtitle: "Transferir a otros usuarios",
        route: "/(customer)/wallet/send-money",
      },
      {
        emoji: "✅",
        title: "Confirmar Transferencia",
        subtitle: "Confirmar envío de dinero",
        route: "/(customer)/wallet/confirm-transfer",
      },
      {
        emoji: "📊",
        title: "Historial de Transacciones",
        subtitle: "Ver todas las transacciones",
        route: "/(customer)/wallet/transaction-history",
      },
      
      // Separador
      {
        emoji: "---",
        title: "---",
        subtitle: "---",
        route: null,
      },
      
      // Otras rutas (no customer)
      {
        emoji: "🏠",
        title: "Inicio",
        subtitle: "Pantalla principal",
        route: "/(root)/(tabs)/home",
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
        emoji: "🆘",
        title: "Emergencias",
        subtitle: "Sistema de emergencias",
        route: "/(emergency)/home",
      },
    ],
    [],
  );

  const handleModulePress = (item: any) => {
    if (item.route && item.route !== null) {
      router.push(item.route as any);
      drawerParams.close();
    }
  };

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <Text style={styles.drawerTitle}>Navegación de Módulos</Text>
      <View style={styles.drawerDivider} />
      <ScrollView contentContainerStyle={styles.drawerContent}>
        {moduleItems.map((item, index) => {
          // Si es un separador, renderizar diferente
          if (item.route === null) {
            return (
              <View key={index} style={styles.separator}>
                <View style={styles.separatorLine} />
              </View>
            );
          }
          
          return (
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
          );
        })}
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
  separator: {
    marginVertical: 16,
    alignItems: "center",
  },
  separatorLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    width: "80%",
  },
});

export default CustomerModuleDrawerContent;
