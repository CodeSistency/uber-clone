import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Modal } from "react-native";

import { isAuthenticated } from "../lib/auth";
import { checkOnboardingStatus } from "../lib/onboarding";
import { useOnboardingStore } from "../store";

import { WelcomeModal } from "./components/ModeSwitcher";
import { userModeStorage } from "./lib/storage";

const Page = () => {

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<
    boolean | null
  >(null);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);

  const { setUserData, setCurrentStep, setCompleted, completeOnboarding } =
    useOnboardingStore();

  

  useEffect(() => {

    // Initialize onboarding store from storage
    const initializeOnboarding = async () => {
      try {
        await useOnboardingStore.getState().loadFromStorage();
      } catch (error) {
      
      }
    };

    // Initialize onboarding and then check authentication
    const initializeAndCheckAuth = async () => {
      try {
        // First initialize onboarding from storage
        await initializeOnboarding();

        // Then check authentication
        const authenticated = await isAuthenticated();
        setIsAuthenticatedState(authenticated);

        if (authenticated) {
          // Check onboarding status using the new utility function
          const onboardingStatus = await checkOnboardingStatus();
         

          // Force-sync local Zustand store with the latest status (no UI toast)
          try {
            if (onboardingStatus.userData) {
              setUserData(onboardingStatus.userData);
            }
            const ns =
              typeof onboardingStatus.nextStep === "number" &&
              Number.isFinite(onboardingStatus.nextStep)
                ? Math.max(0, Math.min(3, onboardingStatus.nextStep))
                : 0;
            setCurrentStep(ns);
            setCompleted(onboardingStatus.isCompleted);
          } catch (e) {
            
          }

          setOnboardingStatus(onboardingStatus);

          if (!onboardingStatus.isCompleted) {
            router.replace("/(onboarding)" as any);
            return;
          }

          // If onboarding is completed, check user mode
          const checkUserMode = async () => {
            try {
              const hasSelectedMode = await userModeStorage.hasSelectedMode();

              if (!hasSelectedMode) {
                setShowWelcomeModal(true);
              } else {
                router.replace("/(customer)/unified-flow-demo");
              }
            } catch (error) {
              
              setShowWelcomeModal(true);
            }
          };
          checkUserMode();
        }
      } catch (error) {
        
        setIsAuthenticatedState(false);
      }
    };

    initializeAndCheckAuth();
  }, []);

  const handleModeSelected = async (mode: string) => {
    try {
      // Save the user's choice using the storage utility
      await userModeStorage.setMode(mode as "customer" | "driver" | "business");

      // Close modal and redirect based on mode
      setShowWelcomeModal(false);

      if (mode === "customer") {
        router.replace("/(customer)/unified-flow-demo");
      } else if (mode === "driver") {
        router.replace("/(auth)/driver-register" as any);
      } else if (mode === "business") {
        router.replace("/(auth)/business-register" as any);
      }
    } catch (error) {
      
      // Still proceed with navigation even if storage fails
      setShowWelcomeModal(false);
      router.replace("/(customer)/unified-flow-demo");
    }
  };

  // Show loading while checking authentication
  if (isAuthenticatedState === null) {
    return null; // Or show a loading spinner
  }

  if (!isAuthenticatedState) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <View className="flex-1">
      <Modal
        visible={showWelcomeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWelcomeModal(false)}
      >
        <WelcomeModal onModeSelected={handleModeSelected} />
      </Modal>
    </View>
  );
};

export default Page;
