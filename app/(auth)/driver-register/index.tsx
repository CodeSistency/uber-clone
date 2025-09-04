import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "../../../components/CustomButton";
import InputField from "../../../components/InputField";
import { userModeStorage } from "../../lib/storage";
import { isAuthenticated } from "@/lib/auth";

const DriverRegister = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    vehicleModel: "",
    licensePlate: "",
    vehicleYear: "",
    vehicleColor: "",
    serviceType: "rides" as "rides" | "deliveries" | "both",
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceTypeSelect = (type: "rides" | "deliveries" | "both") => {
    setFormData((prev) => ({ ...prev, serviceType: type }));
  };

  const handleSubmit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.vehicleModel ||
      !formData.licensePlate
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // TODO: Save driver registration to database
      console.log("Driver registration data:", formData);

      // Save to storage using utility
      await userModeStorage.setDriverRegistered({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        vehicleModel: formData.vehicleModel,
        licensePlate: formData.licensePlate,
        serviceType: formData.serviceType,
      });

      Alert.alert(
        "Registration Successful!",
        "Your driver application has been submitted. You will be notified once approved.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/driver/dashboard" as any),
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
            👨‍💼 Become a Driver
          </Text>
          <Text className="text-secondary-600 text-center font-JakartaMedium">
            Join our platform and start earning with flexible hours
          </Text>
        </View>

        {/* Personal Information */}
        <View className="mb-6">
          <Text className="text-xl font-JakartaBold mb-4 text-secondary-700">
            Personal Information
          </Text>

          <InputField
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange("firstName", value)}
          />

          <InputField
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange("lastName", value)}
          />

          <InputField
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange("phoneNumber", value)}
            keyboardType="phone-pad"
          />
        </View>

        {/* Vehicle Information */}
        <View className="mb-6">
          <Text className="text-xl font-JakartaBold mb-4 text-secondary-700">
            Vehicle Information
          </Text>

          <InputField
            label="Vehicle Model"
            placeholder="e.g., Toyota Camry, Honda Civic"
            value={formData.vehicleModel}
            onChangeText={(value) => handleInputChange("vehicleModel", value)}
          />

          <InputField
            label="License Plate"
            placeholder="Enter license plate number"
            value={formData.licensePlate}
            onChangeText={(value) => handleInputChange("licensePlate", value)}
          />

          <InputField
            label="Vehicle Year"
            placeholder="e.g., 2020"
            value={formData.vehicleYear}
            onChangeText={(value) => handleInputChange("vehicleYear", value)}
            keyboardType="numeric"
          />

          <InputField
            label="Vehicle Color"
            placeholder="e.g., White, Black, Blue"
            value={formData.vehicleColor}
            onChangeText={(value) => handleInputChange("vehicleColor", value)}
          />
        </View>

        {/* Service Type Selection */}
        <View className="mb-8">
          <Text className="text-xl font-JakartaBold mb-4 text-secondary-700">
            Service Type
          </Text>
          <Text className="text-secondary-600 mb-4 font-JakartaMedium">
            What services would you like to provide?
          </Text>

          <View className="space-y-3">
            {[
              {
                key: "rides",
                label: "Rides Only",
                description: "Transport passengers",
              },
              {
                key: "deliveries",
                label: "Deliveries Only",
                description: "Deliver food and packages",
              },
              {
                key: "both",
                label: "Both Services",
                description: "Rides and deliveries",
              },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => handleServiceTypeSelect(option.key as any)}
                className={`p-4 rounded-xl border-2 ${
                  formData.serviceType === option.key
                    ? "border-primary-500 bg-primary-500/5"
                    : "border-general-500"
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 ${
                      formData.serviceType === option.key
                        ? "border-primary-500 bg-primary-500"
                        : "border-secondary-600"
                    }`}
                  >
                    {formData.serviceType === option.key && (
                      <View className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-JakartaBold ${
                        formData.serviceType === option.key
                          ? "text-primary-500"
                          : "text-secondary-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-secondary-600 font-JakartaMedium text-sm">
                      {option.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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

export default DriverRegister;
