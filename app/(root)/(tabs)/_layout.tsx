import { Tabs } from "expo-router";
import {
  Image,
  ImageSourcePropType,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { useUI } from "@/components/UIWrapper";

import { icons } from "../../../constants";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-brand-secondary/40" : ""}`}
  >
    <View
      className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-brand-secondary" : ""}`}
    >
      <Image
        source={source}
        tintColor="black"
        resizeMode="contain"
        className="w-7 h-7"
      />
    </View>
  </View>
);

export default function Layout() {
  // Load current mode from AsyncStorage

  const { theme, toggleTheme } = useUI();

  return (
    <>
      {/* Global Header */}

      <Tabs
        initialRouteName="home"
        screenOptions={{
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: "black",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#FFE014",
            borderRadius: 50,
            paddingBottom: 0, // ios only
            overflow: "hidden",
            marginHorizontal: 20,
            marginBottom: 20,
            paddingHorizontal: 20,
            height: 78,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
            position: "absolute",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon source={icons.home} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="rides"
          options={{
            title: "Rides",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon source={icons.list} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon source={icons.chat} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon source={icons.profile} focused={focused} />
            ),
          }}
        />
      </Tabs>

      {/* Floating theme chip */}
      <View className="absolute right-6 bottom-28">
        <TouchableOpacity
          onPress={toggleTheme}
          className="px-3 py-2 rounded-full bg-brand-secondary shadow-lg"
          activeOpacity={0.8}
        >
          <Text className="font-JakartaBold text-black">
            {theme === "dark" ? "Dark" : "Light"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
