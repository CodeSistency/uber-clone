import React from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";
import { useUserStore } from "@/store";

const Profile = () => {
  const { user, isLoading, error, refreshUser } = useUserStore();

  
  
  
  
  
  

  const handleRefresh = async () => {
    
    try {
      await refreshUser();
      
    } catch (err) {
      
    }
  };

  const handleDebugProfile = async () => {
    
    try {
      const { debugProfileResponse } = await import("@/lib/auth");
      if (typeof debugProfileResponse === "function") {
        const debugResult = await debugProfileResponse();
        
      } else {
        
      }
    } catch (err) {
      
    }
  };

  // Debug: Check UserStore state on component mount
  React.useEffect(() => {
    
    const storeState = useUserStore.getState();
    

    // If no user but we should have one, run debug
    if (!user && !isLoading) {
      
      handleDebugProfile();
    }
  }, []);

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FFE014" />
          <Text className="mt-4 text-lg font-JakartaMedium text-gray-600 dark:text-gray-300">
            Loading profile...
          </Text>
          <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Fetching your account information
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar error si hay uno
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-xl font-JakartaBold text-red-500 mb-2">
            Error Loading Profile
          </Text>
          <Text className="text-center text-gray-600 dark:text-gray-300 font-JakartaMedium">
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar mensaje si no hay usuario
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
        <View className="flex-1 items-center justify-center px-5">
          <View className="bg-yellow-50 dark:bg-brand-secondary/20 border border-yellow-200 dark:border-brand-secondary/30 rounded-lg p-6 mb-6">
            <Text className="text-xl font-JakartaBold text-yellow-800 dark:text-yellow-300 mb-2">
              ⚠️ Profile Data Unavailable
            </Text>
            <Text className="text-center text-yellow-700 dark:text-yellow-200 font-JakartaMedium mb-4">
              We couldn't load your profile information
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isLoading}
            className="bg-blue-500 px-6 py-3 rounded-full flex flex-row items-center"
          >
            <Text className="text-white font-JakartaBold mr-2">
              Retry Loading Profile
            </Text>
            {isLoading && <ActivityIndicator size="small" color="white" />}
          </TouchableOpacity>

          <Text className="text-center text-gray-500 dark:text-gray-400 font-JakartaRegular mt-4 text-sm">
            If the problem persists, please log out and log back in
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex flex-row justify-between items-center my-5">
          <Text className="text-2xl font-JakartaBold text-gray-800 dark:text-white">
            My Profile
          </Text>
          <View className="flex flex-row space-x-2">
            <TouchableOpacity
              onPress={handleDebugProfile}
              className="bg-gray-500 px-3 py-2 rounded-full"
            >
              <Text className="text-white font-JakartaMedium text-sm">
                Debug
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={isLoading}
              className="bg-blue-500 px-4 py-2 rounded-full flex flex-row items-center"
            >
              <Text className="text-white font-JakartaMedium mr-2">
                Refresh
              </Text>
              {isLoading && <ActivityIndicator size="small" color="white" />}
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex items-center justify-center my-5">
          <View className="relative">
            <Image
              source={{
                uri: user.name
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0286FF&color=fff&size=110`
                  : "https://via.placeholder.com/110x110/cccccc/666666?text=User",
              }}
              style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
              className="rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-lg shadow-neutral-300"
            />
            <View className="absolute -bottom-2 -right-2 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center">
              <Text className="text-white font-bold text-sm">✓</Text>
            </View>
          </View>
          <Text className="mt-4 text-xl font-JakartaBold text-gray-800 dark:text-white">
            {user.name || "User"}
          </Text>
          <Text className="mt-1 text-sm font-JakartaMedium text-gray-500 dark:text-gray-300">
            Active Member
          </Text>
        </View>

        <View className="flex flex-col items-start justify-center bg-white dark:bg-brand-primaryDark rounded-lg shadow-lg shadow-neutral-300 px-5 py-4 border border-gray-100 dark:border-brand-primaryDark">
          <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white mb-4 w-full">
            Account Information
          </Text>
          <View className="flex flex-col items-start justify-start w-full space-y-1">
            <InputField
              label="Name"
              value={user.name || ""}
              placeholder="Enter your name"
              containerStyle="w-full bg-gray-50"
              inputStyle="p-3.5 text-gray-700 font-JakartaMedium"
              editable={false}
            />

            <InputField
              label="Email"
              value={user.email || ""}
              placeholder="Enter your email"
              containerStyle="w-full bg-gray-50"
              inputStyle="p-3.5 text-gray-700 font-JakartaMedium"
              editable={false}
            />

            <InputField
              label="User ID"
              value={user.id?.toString() || ""}
              placeholder="User ID"
              containerStyle="w-full bg-gray-50"
              inputStyle="p-3.5 text-gray-700 font-JakartaMedium"
              editable={false}
            />

            {user.createdAt && (
              <InputField
                label="Member Since"
                value={
                  new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) || ""
                }
                placeholder="Member since"
                containerStyle="w-full bg-gray-50"
                inputStyle="p-3.5 text-gray-700 font-JakartaMedium"
                editable={false}
              />
            )}

            <View className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Text className="text-sm text-blue-700 font-JakartaMedium text-center">
                🔒 Profile information is read-only for security
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
