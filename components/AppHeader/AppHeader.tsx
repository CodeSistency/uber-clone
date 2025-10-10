import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useDrawer } from "@/components/drawer";

interface ActionButton {
  icon: React.ComponentType<any>;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface AppHeaderProps {
  // Configuración básica
  title: string;
  subtitle?: string;
  
  // Navegación
  onBack?: () => void;
  showBackButton?: boolean;
  
  // Drawer
  showHamburgerMenu?: boolean;
  
  // Búsqueda
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
  
  // Action buttons
  actionButtons?: ActionButton[];
  
  // Estilos
  variant?: "default" | "transparent" | "gradient";
  className?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBackButton = false,
  showHamburgerMenu = false,
  showSearch = false,
  searchPlaceholder = "Buscar...",
  onSearchChange,
  actionButtons = [],
  variant = "default",
  className,
}) => {
  const router = useRouter();
  
  // Usar el hook useDrawer que detecta automáticamente el módulo actual
  const drawer = useDrawer();
  
  const handleHamburgerPress = () => {
    console.log('[AppHeader] Hamburger pressed - opening drawer');
    if (showHamburgerMenu) {
      drawer.open();
    }
  };
  
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };
  
  const getHeaderStyle = () => {
    switch (variant) {
      case "transparent":
        return styles.transparentHeader;
      case "gradient":
        return styles.gradientHeader;
      default:
        return styles.defaultHeader;
    }
  };
  
  console.log('[AppHeader] Rendering with showHamburgerMenu:', showHamburgerMenu);

  return (
    <SafeAreaView style={[styles.container, getHeaderStyle()]} className={className}>
      <View style={styles.header}>
        {/* Left side - Back button or Hamburger */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          
          {showHamburgerMenu && (
            <Pressable 
              style={styles.hamburgerButton} 
              onPress={handleHamburgerPress}
            >
              <View style={styles.hamburgerLine} />
              <View style={[styles.hamburgerLine, styles.hamburgerLineMiddle]} />
              <View style={styles.hamburgerLine} />
            </Pressable>
          )}
        </View>
        
        {/* Center - Title and Subtitle */}
        <View style={styles.centerSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        {/* Right side - Action buttons */}
        <View style={styles.rightSection}>
          {actionButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                button.variant === "primary" && styles.primaryActionButton,
                button.variant === "danger" && styles.dangerActionButton,
              ]}
              onPress={button.onPress}
            >
              <button.icon />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Search bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Text style={styles.searchPlaceholder}>{searchPlaceholder}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  defaultHeader: {
    backgroundColor: "#FFFFFF",
  },
  transparentHeader: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },
  gradientHeader: {
    backgroundColor: "#1D4ED8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
    justifyContent: "flex-end",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#374151",
    fontWeight: "600",
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  primaryActionButton: {
    backgroundColor: "#1D4ED8",
  },
  dangerActionButton: {
    backgroundColor: "#EF4444",
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});

export default AppHeader;





