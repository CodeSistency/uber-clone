import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Modal } from "react-native";

import { isAuthenticated } from "../lib/auth";
import { fetchAPI } from "../lib/fetch";
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
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        console.log("[IndexPage] User authenticated:", authenticated);
        setIsAuthenticatedState(authenticated);

        if (authenticated) {
          // Check onboarding status first
          try {
            console.log("[IndexPage] Checking onboarding status...");
            const onboardingResponse = await fetchAPI("onboarding/status");
            console.log(
              "[IndexPage] Onboarding status response:",
              onboardingResponse,
            );

            setOnboardingStatus(onboardingResponse);

            if (!onboardingResponse.isCompleted) {
              console.log(
                "[IndexPage] Onboarding not completed, redirecting to onboarding",
              );
              // Set onboarding data in store
              if (onboardingResponse.userData) {
                setUserData(onboardingResponse.userData);
              }
              setCurrentStep(onboardingResponse.nextStep || 0);
              router.replace("/(onboarding)" as any);
              return;
            }
          } catch (onboardingError) {
            console.error(
              "[IndexPage] Error checking onboarding status:",
              onboardingError,
            );
            // If onboarding check fails, assume not completed and redirect to onboarding
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

    checkAuth();
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
