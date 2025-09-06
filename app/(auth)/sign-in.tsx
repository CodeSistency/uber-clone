import { Link, router } from "expo-router";
import { useState, useEffect } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import CustomButton from "../../components/CustomButton";
import InputField from "../../components/InputField";
import { useUI } from "../../components/UIWrapper";
import { icons, images } from "../../constants";
import { loginUser, isAuthenticated } from "../../lib/auth";
import { firebaseService } from "../services/firebaseService";

const SignIn = () => {
  console.log("[SignIn] Rendering sign-in screen");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { withUI, showSuccess, showError } = useUI();

  useEffect(() => {
    console.log("[SignIn] useEffect triggered, checking authentication");
    // Check if user is already authenticated
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      console.log("[SignIn] User authenticated:", authenticated);
      if (authenticated) {
        console.log("[SignIn] User already authenticated, redirecting to home");
        router.replace("/");
      } else {
        console.log("[SignIn] User not authenticated, staying on sign-in");
      }
    };
    checkAuth();

    // Initialize Firebase service for push notifications
    const initializeFirebase = async () => {
      try {
        console.log("[SignIn] Initializing Firebase service");
        await firebaseService.requestPermissions();
        firebaseService.setupNotificationListeners();
      } catch (error) {
        console.error("[SignIn] Error initializing Firebase:", error);
      }
    };
    initializeFirebase();
  }, []);

  console.log("[SignIn] Rendering sign-in content");

  const onSignInPress = async () => {
    console.log("[SignIn] Form data before submission:", form);

    // Validate form data
    if (!form.email || !form.password) {
      console.log("[SignIn] Form validation failed - missing fields");
      showError("Validation Error", "Please fill in all fields");
      return;
    }

    const result = await withUI(
      async () => {
        console.log("[SignIn] Logging in user...");

        // Login user with internal authentication
        const loginResult = await loginUser({
          email: form.email.trim(),
          password: form.password,
        });

        console.log("[SignIn] Login result:", loginResult);

        if (!loginResult.success) {
          throw new Error(loginResult.message || "Login failed");
        }

        return loginResult;
      },
      {
        loadingMessage: "Signing you in...",
        successMessage: "Welcome back to UberClone!",
        errorTitle: "Login Failed",
        onSuccess: () => {
          console.log(
            "[SignIn] Login successful, redirecting to index for onboarding check",
          );
          setTimeout(() => {
            router.replace("/");
          }, 1000); // Give time for success message to show
        },
        onError: (error) => {
          console.error("[SignIn] Login error:", error);
        },
      },
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👋
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign In"
            onPress={onSignInPress}
            className="mt-6"
          />

          <Link
            href="/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
