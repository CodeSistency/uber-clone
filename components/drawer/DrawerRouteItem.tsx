import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { DrawerRouteItemProps } from "./types";
import { icons } from "@/constants";

// Componente para cada item de ruta en el drawer
export const DrawerRouteItem: React.FC<DrawerRouteItemProps> = ({
  route,
  isActive = false,
  isExpanded = false,
  level = 0,
  onPress,
  onToggleExpanded,
  currentModule,
}) => {
  // Si es un separador
  if (route.divider) {
    return (
      <View className="my-2 mx-4 border-t border-gray-200 dark:border-gray-700" />
    );
  }

  // Calcular indentación para rutas anidadas
  const indentStyle = {
    paddingLeft: level * 16,
  };

  // Mapear nombres de iconos de configuración a assets reales
  const getIconFromConfig = (iconName: string | any) => {
    const iconMap: Record<string, any> = {
      home: icons.home,
      car: icons.map,
      "message-circle": icons.chat,
      "shopping-bag": icons.search,
      search: icons.search,
      "utensils-crossed": icons.home,
      "shopping-cart": icons.search,
      heart: icons.star,
      wallet: icons.dollar,
      "alert-triangle": icons.marker,
      building: icons.home,
      user: icons.profile,
      settings: icons.list,
      "help-circle": icons.person,
    };

    if (typeof iconName === "string") {
      return iconMap[iconName] || icons.marker;
    }

    return iconName; // Si ya es un asset o componente
  };

  // Icono por defecto basado en el módulo y tipo de ruta
  const getDefaultIcon = () => {
    // Iconos por defecto basados en el id de la ruta usando assets reales
    const defaultIcons: Record<string, any> = {
      home: icons.home,
      rides: icons.map,
      chat: icons.chat,
      profile: icons.profile,
      settings: icons.list,
      dashboard: icons.list,
      orders: icons.list,
      analytics: icons.star,
      earnings: icons.dollar,
      history: icons.list,
      support: icons.person,
      wallet: icons.dollar,
      emergency: icons.marker,
      marketplace: icons.search,
      vehicle: icons.map,
      documents: icons.list,
      // Opciones de cambio de módulo
      "switch-to-business": icons.person,
      "switch-to-driver": icons.map,
      "switch-to-customer": icons.person,
    };

    return defaultIcons[route.id] || icons.marker;
  };

  // Estilos dinámicos usando colores del tema
  const containerClass = `
    flex-row items-center py-3 px-4 rounded-lg mx-2 my-1
    ${
      isActive
        ? "bg-primary-100 dark:bg-primary-900 border-l-4 border-primary-500"
        : "bg-white dark:bg-brand-primaryDark active:bg-primary-50 dark:active:bg-brand-primary"
    }
    ${route.disabled ? "opacity-50" : ""}
  `.trim();

  const textClass = `
    flex-1 ml-3 font-JakartaMedium text-sm
    ${
      isActive
        ? "text-primary-600 dark:text-primary-400 font-JakartaSemiBold"
        : "text-secondary-700 dark:text-secondary-300"
    }
    ${route.disabled ? "text-secondary-400 dark:text-secondary-500" : ""}
  `.trim();

  const handlePress = () => {
    if (route.disabled) return;
    onPress?.(route);
  };

  return (
    <>
      {/* Item principal */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={route.disabled}
        className={containerClass}
        style={indentStyle}
      >
        {/* Icono */}
        {route.icon ? (
          typeof route.icon === "string" ? (
            <Image source={getIconFromConfig(route.icon)} className="w-5 h-5" />
          ) : React.isValidElement(route.icon) ? (
            route.icon
          ) : (
            <Image source={route.icon as any} className="w-5 h-5" />
          )
        ) : (
          <Image source={getDefaultIcon()} className="w-5 h-5" />
        )}

        {/* Título */}
        <Text className={textClass}>{route.title}</Text>

        {/* Badge */}
        {route.badge && (
          <View className="ml-2 px-2 py-1 bg-red-500 rounded-full min-w-[20px] items-center">
            <Text className="text-xs font-JakartaBold text-white">
              {route.badge}
            </Text>
          </View>
        )}

        {/* Indicador de expansión para rutas con subrutas */}
        {route.subroutes && route.subroutes.length > 0 && (
          <Text className="ml-2 text-gray-400 dark:text-gray-500">
            {isExpanded ? "▼" : "▶"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Subrutas expandidas */}
      {isExpanded && route.subroutes && route.subroutes.length > 0 && (
        <View>
          {route.subroutes.map((subroute) => (
            <DrawerRouteItem
              key={subroute.id}
              route={subroute}
              isActive={isActive} // Las subrutas no pueden ser activas individualmente
              isExpanded={false} // Las subrutas no se expanden más
              level={level + 1}
              onPress={onPress}
              onToggleExpanded={onToggleExpanded}
              currentModule={currentModule}
            />
          ))}
        </View>
      )}
    </>
  );
};
