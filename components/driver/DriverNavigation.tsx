import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

interface DriverNavigationProps {
  currentRoute?: string;
}

const DriverNavigation = ({ currentRoute }: DriverNavigationProps) => {
  const navigationItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "🏠",
      route: "/(driver)/dashboard",
      isActive: currentRoute === "/(driver)/dashboard",
    },
    {
      id: "earnings",
      title: "Earnings",
      icon: "💰",
      route: "/(driver)/earnings",
      isActive: currentRoute === "/(driver)/earnings",
    },
    {
      id: "safety",
      title: "Safety",
      icon: "🚨",
      route: "/(driver)/safety",
      isActive: currentRoute === "/(driver)/safety",
    },
    {
      id: "ratings",
      title: "Ratings",
      icon: "⭐",
      route: "/(driver)/ratings",
      isActive: currentRoute === "/(driver)/ratings",
    },
    {
      id: "settings",
      title: "Settings",
      icon: "⚙️",
      route: "/(driver)/settings",
      isActive: currentRoute === "/(driver)/settings",
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <View className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <View className="flex-row items-center justify-around py-2">
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleNavigation(item.route)}
            className={`flex-1 items-center py-2 ${
              item.isActive ? "bg-brand-primary/10" : ""
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-2xl mb-1 ${
                item.isActive ? "opacity-100" : "opacity-60"
              }`}
            >
              {item.icon}
            </Text>
            <Text
              className={`text-xs font-JakartaBold ${
                item.isActive
                  ? "text-brand-primary dark:text-brand-primary"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default DriverNavigation;
