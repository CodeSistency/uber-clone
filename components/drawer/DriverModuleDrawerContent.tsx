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

interface DriverModuleDrawerContentProps {
  drawerParams: DrawerParams;
}

const DriverModuleDrawerContent: React.FC<DriverModuleDrawerContentProps> = ({
  drawerParams,
}) => {
  const router = useRouter();

  const moduleItems = useMemo(
    () => [
      // Rutas principales del driver
      {
        emoji: "👨‍🚗",
        title: "Driver Demo",
        subtitle: "Demo del flujo unificado",
        route: "/(driver)/driver-unified-flow-demo",
      },
      {
        emoji: "📊",
        title: "Dashboard",
        subtitle: "Panel principal del conductor",
        route: "/(driver)/dashboard",
      },
      {
        emoji: "🚗",
        title: "Disponibilidad",
        subtitle: "Estado de disponibilidad",
        route: "/(driver)/available",
      },
      {
        emoji: "📋",
        title: "Solicitudes de Viaje",
        subtitle: "Ver solicitudes de viaje",
        route: "/(driver)/ride-requests",
      },
      {
        emoji: "💰",
        title: "Ganancias",
        subtitle: "Resumen de ganancias",
        route: "/(driver)/earnings",
      },
      {
        emoji: "👤",
        title: "Perfil",
        subtitle: "Mi perfil de conductor",
        route: "/(driver)/profile",
      },
      {
        emoji: "🛡️",
        title: "Seguridad",
        subtitle: "Herramientas de seguridad",
        route: "/(driver)/safety",
      },
      {
        emoji: "⭐",
        title: "Calificaciones",
        subtitle: "Ver mis calificaciones",
        route: "/(driver)/ratings",
      },
      {
        emoji: "📄",
        title: "Documentos",
        subtitle: "Gestionar documentos",
        route: "/(driver)/documents",
      },
      {
        emoji: "🚗",
        title: "Vehículos",
        subtitle: "Mis vehículos registrados",
        route: "/(driver)/vehicles",
      },
      {
        emoji: "🆘",
        title: "Emergencias",
        subtitle: "Sistema de emergencias",
        route: "/(driver)/emergency",
      },
      {
        emoji: "⚙️",
        title: "Configuración",
        subtitle: "Ajustes del conductor",
        route: "/(driver)/settings",
      },
      
      // Subrutas de Earnings
      {
        emoji: "📈",
        title: "Resumen de Ganancias",
        subtitle: "Vista general de ganancias",
        route: "/(driver)/earnings",
      },
      {
        emoji: "🚗",
        title: "Viajes y Ganancias",
        subtitle: "Historial de viajes",
        route: "/(driver)/earnings/trips",
      },
      {
        emoji: "💳",
        title: "Pagos",
        subtitle: "Historial de pagos",
        route: "/(driver)/earnings/payments",
      },
      {
        emoji: "⚡",
        title: "Pago Instantáneo",
        subtitle: "Retirar ganancias",
        route: "/(driver)/earnings/instant-pay",
      },
      {
        emoji: "🎯",
        title: "Promociones",
        subtitle: "Ofertas especiales",
        route: "/(driver)/earnings/promotions",
      },
      {
        emoji: "🏆",
        title: "Desafíos",
        subtitle: "Completar desafíos",
        route: "/(driver)/earnings/challenges",
      },
      
      // Subrutas de Documents
      {
        emoji: "📤",
        title: "Subir Documentos",
        subtitle: "Cargar nuevos documentos",
        route: "/(driver)/documents/upload",
      },
      
      // Subrutas de Emergency
      {
        emoji: "📜",
        title: "Historial de Emergencias",
        subtitle: "Ver emergencias anteriores",
        route: "/(driver)/emergency/history",
      },
      {
        emoji: "📝",
        title: "Reportar Emergencia",
        subtitle: "Crear nuevo reporte",
        route: "/(driver)/emergency/report",
      },
      {
        emoji: "📚",
        title: "Recursos de Emergencia",
        subtitle: "Guías y recursos",
        route: "/(driver)/emergency/resources",
      },
      {
        emoji: "👥",
        title: "Agregar Contacto",
        subtitle: "Nuevo contacto de emergencia",
        route: "/(driver)/emergency/contacts/add",
      },
      
      // Subrutas de Onboarding
      {
        emoji: "🚀",
        title: "Onboarding",
        subtitle: "Proceso de registro",
        route: "/(driver)/onboarding",
      },
      {
        emoji: "📝",
        title: "Paso 2",
        subtitle: "Información personal",
        route: "/(driver)/onboarding/step2",
      },
      {
        emoji: "📝",
        title: "Paso 3",
        subtitle: "Documentos",
        route: "/(driver)/onboarding/step3",
      },
      {
        emoji: "📝",
        title: "Paso 4",
        subtitle: "Vehículo",
        route: "/(driver)/onboarding/step4",
      },
      {
        emoji: "📝",
        title: "Paso 5",
        subtitle: "Verificación",
        route: "/(driver)/onboarding/step5",
      },
      {
        emoji: "✅",
        title: "Revisión",
        subtitle: "Revisar información",
        route: "/(driver)/onboarding/review",
      },
      
      // Subrutas de Vehicles
      {
        emoji: "➕",
        title: "Agregar Vehículo",
        subtitle: "Registrar nuevo vehículo",
        route: "/(driver)/vehicles/add",
      },
      
      // Separador
      {
        emoji: "---",
        title: "---",
        subtitle: "---",
        route: null,
      },
      
      // Otras rutas (no driver)
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
        route: "/(wallet)/home",
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

export default DriverModuleDrawerContent;







