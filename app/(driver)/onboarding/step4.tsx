import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, TextField } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/driverOnboarding";
import { useUI } from "@/components/UIWrapper";

const OnboardingStep4 = () => {
  const { onboardingData, updateStepData, completeStep, goToStep } =
    useDriverOnboardingStore();

  const { showError } = useUI();

  const [vehicleData, setVehicleData] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    seats: "",
    features: [] as string[],
  });

  useEffect(() => {
    // Load existing data
    if (onboardingData) {
      setVehicleData({
        make: onboardingData.vehicleMake || "",
        model: onboardingData.vehicleModel || "",
        year: onboardingData.vehicleYear?.toString() || "",
        color: onboardingData.vehicleColor || "",
        seats: onboardingData.vehicleSeats?.toString() || "",
        features: [], // Would load from onboardingData if stored
      });
    }
  }, [onboardingData]);

  const vehicleMakes = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "Nissan",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Volkswagen",
    "Hyundai",
    "Kia",
    "Mazda",
    "Subaru",
    "Lexus",
    "Tesla",
    "Volvo",
    "Other",
  ];

  const vehicleColors = [
    "White",
    "Black",
    "Silver",
    "Gray",
    "Blue",
    "Red",
    "Green",
    "Brown",
    "Yellow",
    "Orange",
    "Purple",
    "Other",
  ];

  const vehicleFeatures = [
    "Air Conditioning",
    "Bluetooth",
    "GPS Navigation",
    "Backup Camera",
    "Heated Seats",
    "Sunroof",
    "Cruise Control",
    "Apple CarPlay/Android Auto",
    "USB Charging Ports",
    "Towing Package",
    "All-Wheel Drive",
  ];

  const updateVehicleField = (field: keyof typeof vehicleData, value: any) => {
    setVehicleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleFeature = (feature: string) => {
    setVehicleData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const validateVehicleData = () => {
    if (!vehicleData.make.trim()) {
      showError("Validation Error", "Vehicle make is required");
      return false;
    }

    if (!vehicleData.model.trim()) {
      showError("Validation Error", "Vehicle model is required");
      return false;
    }

    if (!vehicleData.year || isNaN(parseInt(vehicleData.year))) {
      showError("Validation Error", "Valid vehicle year is required");
      return false;
    }

    const year = parseInt(vehicleData.year);
    const currentYear = new Date().getFullYear();
    if (year < 1990 || year > currentYear + 1) {
      showError(
        "Validation Error",
        "Please enter a valid vehicle year (1990-present)",
      );
      return false;
    }

    if (!vehicleData.color.trim()) {
      showError("Validation Error", "Vehicle color is required");
      return false;
    }

    if (!vehicleData.seats || isNaN(parseInt(vehicleData.seats))) {
      showError("Validation Error", "Number of seats is required");
      return false;
    }

    const seats = parseInt(vehicleData.seats);
    if (seats < 2 || seats > 9) {
      showError("Validation Error", "Number of seats must be between 2 and 9");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateVehicleData()) return;

    try {
      const data = {
        vehicleMake: vehicleData.make,
        vehicleModel: vehicleData.model,
        vehicleYear: parseInt(vehicleData.year),
        vehicleColor: vehicleData.color,
        vehicleSeats: parseInt(vehicleData.seats),
        vehicleFeatures: vehicleData.features, // Store for later use
      };

      await updateStepData(4, data);
      await completeStep(4);
      goToStep(5);
    } catch (error: any) {
      showError("Error", error.message || "Failed to save vehicle information");
    }
  };

  const handlePrevious = () => {
    goToStep(3);
  };

  const handlePhotoUpload = () => {
    Alert.alert(
      "Photo Upload",
      "Vehicle photo upload functionality will be implemented soon.\n\nFor now, vehicle details are sufficient for verification.",
      [{ text: "OK" }],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Vehicle Information</Text>
        <Text className="text-secondary-600 mt-1">
          Tell us about your vehicle for passenger safety
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Step Indicator */}
          <View className="flex-row justify-center mb-6">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <View key={step} className="flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step < 4
                      ? "bg-green-500"
                      : step === 4
                        ? "bg-primary-500"
                        : "bg-secondary-300"
                  }`}
                >
                  <Text
                    className={`text-xs font-JakartaBold ${
                      step <= 4 ? "text-white" : "text-secondary-600"
                    }`}
                  >
                    {step}
                  </Text>
                </View>
                {step < 6 && (
                  <View
                    className={`w-1 h-6 ${
                      step < 4 ? "bg-green-500" : "bg-secondary-300"
                    }`}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Vehicle Photo Upload */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">
              Vehicle Photos
            </Text>

            <View className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg p-6 items-center mb-4">
              <Text className="text-4xl mb-3">📸</Text>
              <Text className="text-secondary-700 font-JakartaMedium text-center mb-2">
                Add Photos of Your Vehicle
              </Text>
              <Text className="text-secondary-500 text-sm text-center mb-4">
                Exterior, interior, and any special features
              </Text>

              <Button
                title="Upload Photos"
                onPress={handlePhotoUpload}
                className="w-full"
                variant="outline"
              />

              <Text className="text-secondary-400 text-xs text-center mt-2">
                JPG, PNG (max 5MB each)
              </Text>
            </View>

            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-800 font-JakartaBold mb-1">
                📷 Photo Guidelines
              </Text>
              <Text className="text-blue-700 text-sm">
                Clear photos help passengers identify your vehicle. Include
                exterior shots from multiple angles and interior photos.
              </Text>
            </View>
          </Card>

          {/* Basic Information */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">
              Basic Information
            </Text>

            <View className="space-y-4">
              {/* Make and Model */}
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-JakartaMedium mb-2">Make</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Select Make",
                        "Select your vehicle make",
                        vehicleMakes.map((make) => ({
                          text: make,
                          onPress: () => updateVehicleField("make", make),
                        })),
                      );
                    }}
                    className="border border-secondary-300 rounded-lg p-3 bg-white"
                  >
                    <Text
                      className={
                        vehicleData.make
                          ? "text-secondary-700"
                          : "text-secondary-400"
                      }
                    >
                      {vehicleData.make || "Select make"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-1">
                  <TextField
                    label="Model"
                    placeholder="e.g. Camry, Civic, F-150"
                    value={vehicleData.model}
                    onChangeText={(text) => updateVehicleField("model", text)}
                  />
                </View>
              </View>

              {/* Year and Color */}
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <TextField
                    label="Year"
                    placeholder="e.g. 2020"
                    value={vehicleData.year}
                    onChangeText={(text) => updateVehicleField("year", text)}
                    keyboardType="numeric"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-JakartaMedium mb-2">Color</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Select Color",
                        "Select your vehicle color",
                        vehicleColors.map((color) => ({
                          text: color,
                          onPress: () => updateVehicleField("color", color),
                        })),
                      );
                    }}
                    className="border border-secondary-300 rounded-lg p-3 bg-white"
                  >
                    <Text
                      className={
                        vehicleData.color
                          ? "text-secondary-700"
                          : "text-secondary-400"
                      }
                    >
                      {vehicleData.color || "Select color"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Seats */}
              <View>
                <Text className="text-sm font-JakartaMedium mb-2">
                  Passenger Capacity
                </Text>
                <View className="flex-row space-x-2">
                  {[2, 3, 4, 5, 6, 7, 8].map((seats) => (
                    <TouchableOpacity
                      key={seats}
                      onPress={() =>
                        updateVehicleField("seats", seats.toString())
                      }
                      className={`flex-1 py-3 rounded-lg border items-center ${
                        vehicleData.seats === seats.toString()
                          ? "border-primary-500 bg-primary-50"
                          : "border-secondary-300 bg-white"
                      }`}
                    >
                      <Text
                        className={`text-sm font-JakartaBold ${
                          vehicleData.seats === seats.toString()
                            ? "text-primary-700"
                            : "text-secondary-600"
                        }`}
                      >
                        {seats}
                      </Text>
                      <Text className="text-xs text-secondary-500">seats</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </Card>

          {/* Vehicle Features */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">
              Vehicle Features
            </Text>
            <Text className="text-secondary-600 mb-4">
              Select all features that apply to help passengers choose the right
              ride.
            </Text>

            <View className="flex-row flex-wrap">
              {vehicleFeatures.map((feature) => (
                <TouchableOpacity
                  key={feature}
                  onPress={() => toggleFeature(feature)}
                  className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                    vehicleData.features.includes(feature)
                      ? "border-primary-500 bg-primary-50"
                      : "border-secondary-300 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      vehicleData.features.includes(feature)
                        ? "text-primary-700"
                        : "text-secondary-600"
                    }`}
                  >
                    {vehicleData.features.includes(feature) ? "✓ " : ""}
                    {feature}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <Text className="text-green-800 font-JakartaBold mb-1">
                🚗 Feature Benefits
              </Text>
              <Text className="text-green-700 text-sm">
                Highlighting your vehicle's features helps you attract more
                passengers and potentially earn more.
              </Text>
            </View>
          </Card>

          {/* Safety Notice */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-3">
              Safety & Maintenance
            </Text>

            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <Text className="text-yellow-800 font-JakartaBold mb-1">
                ⚠️ Safety Requirements
              </Text>
              <Text className="text-yellow-700 text-sm">
                Your vehicle must meet all local safety standards and be in good
                mechanical condition. Regular maintenance is required.
              </Text>
            </View>

            <View className="bg-red-50 border border-red-200 rounded-lg p-4">
              <Text className="text-red-800 font-JakartaBold mb-1">
                🚫 Prohibited Vehicles
              </Text>
              <Text className="text-red-700 text-sm">
                Modified vehicles, those with expired inspections, or vehicles
                that don't meet safety standards cannot be used for rides.
              </Text>
            </View>
          </Card>

          {/* Navigation Buttons */}
          <View className="flex-row space-x-4">
            <Button
              title="Previous"
              onPress={handlePrevious}
              className="flex-1"
              variant="outline"
            />
            <Button
              title="Next"
              onPress={handleNext}
              className="flex-1"
              variant="primary"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingStep4;
