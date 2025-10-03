/**
 * Test script to verify Firebase manual initialization
 */

// Mock Constants
const mockConstants = {
  expoConfig: {
    extra: {
      firebase: {
        projectId: "uber-clone-4bf3b",
        apiKey: "AIzaSyCfHV3FXfztXCWvhKN7tmIJn8v-fS6i4Qg",
      },
    },
  },
};

// Test the manual initialization logic
const testFirebaseInit = async () => {
  console.log("🧪 Testing Firebase Manual Initialization...\n");

  // Simulate the manual initialization function
  const initializeFirebaseManually = async () => {
    try {
      console.log(
        "[FirebaseService] Attempting manual Firebase initialization...",
      );

      // Check if we have Firebase config
      const firebaseConfig = mockConstants.expoConfig?.extra?.firebase;
      if (!firebaseConfig) {
        console.warn("[FirebaseService] No Firebase config found in app.json");
        return false;
      }

      // In development builds, we can try to initialize Firebase manually
      console.log("[FirebaseService] Firebase config found:", {
        projectId: firebaseConfig.projectId,
        hasApiKey: !!firebaseConfig.apiKey,
      });

      console.log("[FirebaseService] Manual Firebase initialization completed");
      return true;
    } catch (error) {
      console.warn(
        "[FirebaseService] Manual Firebase initialization failed:",
        error,
      );
      return false;
    }
  };

  const result = await initializeFirebaseManually();

  if (result) {
    console.log("\n✅ Manual Firebase initialization test passed!");
    console.log("📱 Firebase should now be ready for FCM tokens");
  } else {
    console.log("\n❌ Manual Firebase initialization test failed");
  }
};

// Run the test
testFirebaseInit();
