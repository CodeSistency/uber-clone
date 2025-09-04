import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Modal } from "react-native";

import { WelcomeModal } from "./components/ModeSwitcher";
import { userModeStorage } from "./lib/storage";
import { isAuthenticated } from "../lib/auth";

const Page = () => {
  console.log("[IndexPage] Rendering index page");

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean | null>(null);

  console.log("[IndexPage] isAuthenticatedState:", isAuthenticatedState);

  useEffect(() => {
    console.log("[IndexPage] useEffect triggered");
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        console.log("[IndexPage] User authenticated:", authenticated);
        setIsAuthenticatedState(authenticated);

        if (authenticated) {
          // Check if user has already selected a mode
          const checkUserMode = async () => {
            try {
              console.log("[IndexPage] Checking user mode...");
              const hasSelectedMode = await userModeStorage.hasSelectedMode();
              console.log("[IndexPage] hasSelectedMode:", hasSelectedMode);

              if (!hasSelectedMode) {
                console.log("[IndexPage] No mode selected, showing welcome modal");
                setShowWelcomeModal(true);
              } else {
                console.log("[IndexPage] Mode already selected, redirecting to home");
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
    console.log("[IndexPage] User not authenticated, redirecting to auth welcome");
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
