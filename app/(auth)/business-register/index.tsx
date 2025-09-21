import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { userModeStorage } from "@/app/lib/storage";
import { isAuthenticated } from "@/lib/auth";

import CustomButton from "../../../components/CustomButton";
import InputField from "../../../components/InputField";

const BusinessRegister = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<
    boolean | null
  >(null);
  const [businessType, setBusinessType] = useState<
    "restaurant" | "grocery" | "pharmacy" | "other" | null
  >(null);
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    address: "",
    phoneNumber: "",
    email: "",
    operatingHours: "9:00 AM - 10:00 PM",
    deliveryRadius: "5",
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuthenticatedState(authenticated);
      if (!authenticated) {
        router.replace("/(auth)/sign-in");
      }
    };
    checkAuth();
  }, []);

  // Don't render if user is not authenticated
  if (isAuthenticatedState === null) {
    return null; // Loading state
  }

  if (!isAuthenticatedState) {
    return null; // Will redirect via useEffect
  }

  const businessTypes = [
    {
      key: "restaurant",
      label: "Restaurant",
      icon: "🍽️",
      description: "Food service establishment",
    },
    {
      key: "grocery",
      label: "Grocery Store",
      icon: "🛒",
      description: "Food and household items",
    },
    {
      key: "pharmacy",
      label: "Pharmacy",
      icon: "💊",
      description: "Health and medical supplies",
    },
    {
      key: "other",
      label: "Other Business",
      icon: "🏪",
      description: "Other types of business",
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !businessType ||
      !formData.businessName ||
      !formData.address ||
      !formData.phoneNumber
    ) {
      Alert.alert(
        "Error",
        "Please fill in all required fields and select a business type",
      );
      return;
    }

    setLoading(true);

    try {
      // TODO: Save business registration to database
      console.log("Business registration data:", { businessType, ...formData });

      // Save to storage using utility
      await userModeStorage.setBusinessRegistered({
        businessType,
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        operatingHours: formData.operatingHours,
        deliveryRadius: formData.deliveryRadius,
      });

      Alert.alert(
        "Registration Successful!",
        "Your business application has been submitted. You will be notified once approved.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/business/dashboard" as any),
          },
        ],
      );
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5">
        {/* Header */}
        <View className="items-center mt-5 mb-8">
          <Text className="text-3xl font-JakartaExtraBold text-primary-500 mb-2">
            🏪 Register Your Business
          </Text>
          <Text className="text-secondary-600 text-center font-JakartaMedium">
            Join our platform and reach more customers
          </Text>
        </View>

        {/* Business Type Selection */}
        <View className="mb-6">
          <Text className="text-xl font-JakartaBold mb-4 text-secondary-700">
            What type of business do you have?
          </Text>

          <View className="space-y-3">
            {businessTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                onPress={() => setBusinessType(type.key as any)}
                className={`p-4 rounded-xl border-2 ${
                  businessType === type.key
                    ? "border-primary-500 bg-primary-500/5"
                    : "border-general-500"
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-3">{type.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className={`font-JakartaBold ${
                        businessType === type.key
                          ? "text-primary-500"
                          : "text-secondary-700"
                      }`}
                    >
                      {type.label}
                    </Text>
                    <Text className="text-secondary-600 font-JakartaMedium text-sm">
                      {type.description}
                    </Text>
                  </View>
                  {businessType === type.key && (
                    <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                      <Text className="text-white font-JakartaBold text-sm">
                        ✓
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Business Information */}
        <View className="mb-6">
          <Text className="text-xl font-JakartaBold mb-4 text-secondary-700">
            Business Information
          </Text>

          <InputField
            label="Business Name"
            placeholder="Enter your business name"
            value={formData.businessName}
            onChangeText={(value) => handleInputChange("businessName", value)}
          />

          <InputField
            label="Business Description"
            placeholder="Brief description of your business"
            value={formData.businessDescription}
            onChangeText={(value) =>
              handleInputChange("businessDescription", value)
            }
            multiline
            numberOfLines={3}
          />

          <InputField
            label="Business Address"
            placeholder="Full address of your business"
            value={formData.address}
            onChangeText={(value) => handleInputChange("address", value)}
          />

          <InputField
            label="Phone Number"
            placeholder="Business phone number"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange("phoneNumber", value)}
            keyboardType="phone-pad"
          />

          <InputField
            label="Email Address"
            placeholder="Business email address"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            keyboardType="email-address"
          />
        </View>

        {/* Operating Details */}
        <View className="mb-8">
          <Text className="text-xl font-JakartaBold mb-4 text-secondary-700">
            Operating Details
          </Text>

          <InputField
            label="Operating Hours"
            placeholder="e.g., 9:00 AM - 10:00 PM"
            value={formData.operatingHours}
            onChangeText={(value) => handleInputChange("operatingHours", value)}
          />

          <InputField
            label="Delivery Radius (km)"
            placeholder="Maximum delivery distance"
            value={formData.deliveryRadius}
            onChangeText={(value) => handleInputChange("deliveryRadius", value)}
            keyboardType="numeric"
          />
        </View>

        {/* Submit Button */}
        <View className="mb-8">
          <CustomButton
            title={loading ? "Submitting..." : "Submit Application"}
            onPress={handleSubmit}
            disabled={loading}
            className="w-full"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 p-3 items-center"
          >
            <Text className="text-secondary-600 font-JakartaMedium">
              Back to Welcome
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessRegister;
