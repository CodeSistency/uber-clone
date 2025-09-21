import { router } from "expo-router";
import { useRef, useState, useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "../../components/CustomButton";
import { onboarding } from "../../constants";
import { isAuthenticated } from "../../lib/auth";

const Home = () => {
  console.log("[Welcome] Rendering welcome screen");

  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    console.log("[Welcome] useEffect triggered");
    // Check if user is already authenticated
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      console.log("[Welcome] User authenticated:", authenticated);
      if (authenticated) {
        console.log(
          "[Welcome] User already authenticated, redirecting to home",
        );
        router.replace("/");
      } else {
        console.log("[Welcome] User not authenticated, staying on welcome");
      }
    };
    checkAuth();
  }, []);

  console.log("[Welcome] Rendering welcome content");

  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-brand-primary dark:bg-brand-primaryDark">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="w-full flex justify-end items-end p-5"
      >
        <Text className="text-black dark:text-white text-md font-JakartaBold">
          Skip
        </Text>
      </TouchableOpacity>

      <View className="flex-1 w-full">
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {onboarding.map((item) => (
            <View
              key={item.id}
              className="flex items-center justify-center p-5"
            >
              <Image
                source={item.image}
                className="w-full h-[300px]"
                resizeMode="contain"
              />
              <View className="flex flex-row items-center justify-center w-full mt-10">
                <Text className="text-black dark:text-white text-3xl font-bold mx-10 text-center">
                  {item.title}
                </Text>
              </View>
              <Text className="text-md font-JakartaSemiBold text-center text-[#858585] dark:text-gray-300 mx-10 mt-3">
                {item.description}
              </Text>
            </View>
          ))}
        </PagerView>

        {/* Dots indicator */}
        <View className="flex-row justify-center items-center mb-5">
          {onboarding.map((_, index) => (
            <View
              key={index}
              className={`w-[32px] h-[4px] mx-1 rounded-full ${
                index === activeIndex
                  ? "bg-brand-secondary"
                  : "bg-[#E2E8F0] dark:bg-gray-600"
              }`}
            />
          ))}
        </View>
      </View>

      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("/(auth)/sign-up")
            : pagerRef.current?.setPage(activeIndex + 1)
        }
        className="w-11/12 mt-10 mb-5"
      />
    </SafeAreaView>
  );
};

export default Home;
