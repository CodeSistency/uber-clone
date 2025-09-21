import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Modal } from "react-native";

import { isAuthenticated } from "../lib/auth";
import { checkOnboardingStatus } from "../lib/onboarding";
import { useOnboardingStore } from "../store";

import { WelcomeModal } from "./components/ModeSwitcher";
import { userModeStorage } from "./lib/storage";

const Page = () => {
  console.log("[IndexPage] Rendering index page");

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<
    boolean | null
  >(null);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);

  const { setUserData, setCurrentStep, setCompleted, completeOnboarding } =
    useOnboardingStore();

  console.log("[IndexPage] isAuthenticatedState:", isAuthenticatedState);
  console.log("[IndexPage] onboardingStatus:", onboardingStatus);

  useEffect(() => {
    console.log("[IndexPage] useEffect triggered");

    // Initialize onboarding store from storage
    const initializeOnboarding = async () => {
      try {
        console.log("[IndexPage] Initializing onboarding from storage");
        await useOnboardingStore.getState().loadFromStorage();
        console.log("[IndexPage] Onboarding initialized from storage");
      } catch (error) {
        console.error("[IndexPage] Error initializing onboarding from storage:", error);
      }
    };

    // Initialize onboarding and then check authentication
    const initializeAndCheckAuth = async () => {
      try {
        // First initialize onboarding from storage
        await initializeOnboarding();

        // Then check authentication
        const authenticated = await isAuthenticated();
        console.log("[IndexPage] User authenticated:", authenticated);
        setIsAuthenticatedState(authenticated);

        if (authenticated) {
          // Check onboarding status using the new utility function
          console.log("[IndexPage] Checking onboarding status...");
          const onboardingStatus = await checkOnboardingStatus();
          console.log("[IndexPage] Onboarding status result:", onboardingStatus);

          // Force-sync local Zustand store with the latest status (no UI toast)
          try {
            if (onboardingStatus.userData) {
              setUserData(onboardingStatus.userData);
            }
            const ns = typeof onboardingStatus.nextStep === 'number' && Number.isFinite(onboardingStatus.nextStep)
              ? Math.max(0, Math.min(3, onboardingStatus.nextStep))
              : 0;
            setCurrentStep(ns);
            setCompleted(onboardingStatus.isCompleted);
          } catch (e) {
            console.warn("[IndexPage] Failed to sync store with onboarding status:", e);
          }

          setOnboardingStatus(onboardingStatus);

          if (!onboardingStatus.isCompleted) {
            console.log(
              "[IndexPage] Onboarding not completed, redirecting to onboarding",
            );
            router.replace("/(onboarding)" as any);
            return;
          }

          // If onboarding is completed, check user mode
          const checkUserMode = async () => {
            try {
              console.log("[IndexPage] Checking user mode...");
              const hasSelectedMode = await userModeStorage.hasSelectedMode();
              console.log("[IndexPage] hasSelectedMode:", hasSelectedMode);

              if (!hasSelectedMode) {
                console.log(
                  "[IndexPage] No mode selected, showing welcome modal",
                );
                setShowWelcomeModal(true);
              } else {
                console.log(
                  "[IndexPage] Mode already selected, redirecting to home",
                );
                router.replace("/(root)/(tabs)/home");
              }
            } catch (error) {
              console.error("[IndexPage] Error checking user mode:", error);
              setShowWelcomeModal(true);
            }
          };
          checkUserMode();
        } else {
          console.log("[IndexPage] User not authenticated");
        }
      } catch (error) {
        console.error("[IndexPage] Error checking authentication:", error);
        setIsAuthenticatedState(false);
      }
    };

    initializeAndCheckAuth();
  }, []);

  const handleModeSelected = async (mode: string) => {
    console.log("[IndexPage] handleModeSelected called with mode:", mode);
    try {
      // Save the user's choice using the storage utility
      console.log("[IndexPage] Saving user mode:", mode);
      await userModeStorage.setMode(mode as "customer" | "driver" | "business");

      // Close modal and redirect based on mode
      setShowWelcomeModal(false);

      if (mode === "customer") {
        console.log("[IndexPage] Redirecting to customer home");
        router.replace("/(root)/(tabs)/home");
      } else if (mode === "driver") {
        console.log("[IndexPage] Redirecting to driver register");
        router.replace("/(auth)/driver-register" as any);
      } else if (mode === "business") {
        console.log("[IndexPage] Redirecting to business register");
        router.replace("/(auth)/business-register" as any);
      }
    } catch (error) {
      console.error("[IndexPage] Error saving user mode:", error);
      // Still proceed with navigation even if storage fails
      setShowWelcomeModal(false);
      console.log("[IndexPage] Error occurred, redirecting to home");
      router.replace("/(root)/(tabs)/home");
    }
  };

  // Show loading while checking authentication
  if (isAuthenticatedState === null) {
    console.log("[IndexPage] Still checking authentication...");
    return null; // Or show a loading spinner
  }

  if (!isAuthenticatedState) {
    console.log(
      "[IndexPage] User not authenticated, redirecting to auth welcome",
    );
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
