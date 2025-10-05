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
  

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { withUI, showError } = useUI();

  const handleInputChange = (field: string, value: string) => {
    
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      
      if (authenticated) {
        
        router.replace("/");
      } else {
        
      }
    };
    checkAuth();

    // Initialize Firebase service for push notifications
    const initializeFirebase = async () => {
      try {
        
        await firebaseService.requestPermissions();
        firebaseService.setupNotificationListeners();
      } catch (error) {
        
      }
    };
    initializeFirebase();
  }, []);

  const onSignUpPress = async () => {
    

    // Validate form data
    if (!form.name || !form.email || !form.password) {
      
      showError("Validation Error", "Please fill in all fields");
      return;
    }

    const result = await withUI(
      async () => {
        

        // Register user with internal authentication
        const registerResult = await registerUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });

        

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
          
          setTimeout(() => {
            router.replace("/");
          }, 1000); // Give time for success message to show
        },
        onError: (error) => {
          
        },
      },
    );
  };

  return (
    <ScrollView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
      <View className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black dark:text-white font-JakartaSemiBold absolute bottom-5 left-5">
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
            className="text-lg text-center text-general-200 dark:text-gray-300 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-black dark:text-brand-secondary">Log In</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};
export default SignUp;
