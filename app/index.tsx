import { useAuth } from "@clerk/clerk-expo";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Modal } from "react-native";
import { WelcomeModal } from "./components/ModeSwitcher";
import { userModeStorage } from "./lib/storage";


const Page = () => {
  const { isSignedIn } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      // Check if user has already selected a mode
      const checkUserMode = async () => {
        try {
          const hasSelectedMode = await userModeStorage.hasSelectedMode();
          if (!hasSelectedMode) {
            setShowWelcomeModal(true);
          } else {
            router.replace("/(root)/(tabs)/home");
          }
        } catch (error) {
          console.error('Error checking user mode:', error);
          setShowWelcomeModal(true);
        }
      };
      checkUserMode();
    }
  }, [isSignedIn]);

  const handleModeSelected = async (mode: string) => {
    try {
      // Save the user's choice using the storage utility
      await userModeStorage.setMode(mode as 'customer' | 'driver' | 'business');

      // Close modal and redirect based on mode
      setShowWelcomeModal(false);

      if (mode === 'customer') {
        router.replace("/(root)/(tabs)/home");
      } else if (mode === 'driver') {
        router.replace("/(auth)/driver-register" as any);
      } else if (mode === 'business') {
        router.replace("/(auth)/business-register" as any);
      }
    } catch (error) {
      console.error('Error saving user mode:', error);
      // Still proceed with navigation even if storage fails
      setShowWelcomeModal(false);
      router.replace("/(root)/(tabs)/home");
    }
  };

  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;

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
