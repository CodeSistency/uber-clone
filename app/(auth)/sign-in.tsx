import { Link, router } from "expo-router";
import { useState, useEffect } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import CustomButton from "../../components/CustomButton";
import InputField from "../../components/InputField";
import { useUI } from "../../components/UIWrapper";
import { icons, images } from "../../constants";
import { loginUser, isAuthenticated } from "../../lib/auth";
import { checkOnboardingStatus } from "../../lib/onboarding";
import { userModeStorage } from "../lib/storage";
import { firebaseService } from "../services/firebaseService";

const SignIn = () => {
  

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { withUI, showSuccess, showError } = useUI();

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

  

  const onSignInPress = async () => {
    

    // Validate form data
    if (!form.email || !form.password) {
      
      showError("Validation Error", "Please fill in all fields");
      return;
    }

    const result = await withUI(
      async () => {
        

        // Login user with internal authentication
        const loginResult = await loginUser({
          email: form.email.trim(),
          password: form.password,
        });

        

        if (!loginResult.success) {
          throw new Error(loginResult.message || "Login failed");
        }

        return loginResult;
      },
      {
        loadingMessage: "Signing you in...",
        successMessage: "Welcome back to UberClone!",
        errorTitle: "Login Failed",
        onSuccess: async () => {
          
          try {
            const status = await checkOnboardingStatus();
            const { setUserData, setCurrentStep, setCompleted } =
              require("../../store").useOnboardingStore.getState();
            if (status.userData) {
              setUserData(status.userData);
            }
            const ns =
              typeof status.nextStep === "number" &&
              Number.isFinite(status.nextStep)
                ? Math.max(0, Math.min(3, status.nextStep))
                : 0;
            setCurrentStep(ns);
            setCompleted(!!status.isCompleted);

            if (!status.isCompleted) {
              
              router.replace("/(onboarding)" as any);
              return;
            }

            // Onboarding complete → decide based on mode selection
            try {
              const hasSelectedMode = await userModeStorage.hasSelectedMode();
              if (!hasSelectedMode) {
                
                router.replace("/" as any);
              } else {
                
                router.replace("/(customer)/unified-flow-demo" as any);
              }
            } catch (modeErr) {
              
              router.replace("/" as any);
            }
          } catch (statusErr) {
            
            router.replace("/" as any);
          }
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
            className="text-lg text-center text-general-200 dark:text-gray-300 mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-black dark:text-brand-secondary">
              Sign Up
            </Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
