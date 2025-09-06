import { Link, router } from "expo-router";
import { useState, useEffect } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import CustomButton from "../../components/CustomButton";
import InputField from "../../components/InputField";
import { useUI } from "../../components/UIWrapper";
import { icons, images } from "../../constants";
import { registerUser, isAuthenticated } from "../../lib/auth";
import { firebaseService } from "../services/firebaseService";

const SignUp = () => {
  console.log("[SignUp] Rendering sign-up screen");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { withUI, showError } = useUI();

  const handleInputChange = (field: string, value: string) => {
    console.log(`[SignUp] Input change - ${field}:`, value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    console.log("[SignUp] useEffect triggered, checking authentication");
    // Check if user is already authenticated
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      console.log("[SignUp] User authenticated:", authenticated);
      if (authenticated) {
        console.log("[SignUp] User already authenticated, redirecting to home");
        router.replace("/");
      } else {
        console.log("[SignUp] User not authenticated, staying on sign-up");
      }
    };
    checkAuth();

    // Initialize Firebase service for push notifications
    const initializeFirebase = async () => {
      try {
        console.log("[SignUp] Initializing Firebase service");
        await firebaseService.requestPermissions();
        firebaseService.setupNotificationListeners();
      } catch (error) {
        console.error("[SignUp] Error initializing Firebase:", error);
      }
    };
    initializeFirebase();
  }, []);

  const onSignUpPress = async () => {
    console.log("[SignUp] Form data before submission:", form);

    // Validate form data
    if (!form.name || !form.email || !form.password) {
      console.log("[SignUp] Form validation failed - missing fields");
      showError("Validation Error", "Please fill in all fields");
      return;
    }

    const result = await withUI(
      async () => {
        console.log("[SignUp] Registering user...");

        // Register user with internal authentication
        const registerResult = await registerUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });

        console.log("[SignUp] Registration result:", registerResult);

        if (!registerResult.success) {
          throw new Error(registerResult.message || "Registration failed");
        }

        return registerResult;
      },
      {
        loadingMessage: "Creating your account...",
        successMessage: "Account created successfully! Welcome to UberClone!",
        errorTitle: "Registration Failed",
        onSuccess: () => {
          console.log(
            "[SignUp] Registration successful, redirecting to index for onboarding check",
          );
          setTimeout(() => {
            router.replace("/");
          }, 1000); // Give time for success message to show
        },
        onError: (error) => {
          console.error("[SignUp] Registration error:", error);
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
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => handleInputChange("name", value)}
          />
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => handleInputChange("email", value)}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => handleInputChange("password", value)}
          />
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};
export default SignUp;
