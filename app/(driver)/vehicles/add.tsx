import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, TextField, Card } from "@/components/ui";
import { useDriverProfileStore } from "@/store/driverProfile";
import { useUI } from "@/components/UIWrapper";
import { useDriverNavigation } from "@/hooks/useDriverNavigation";

interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  color: string;
  seats: string;
  insurancePolicyNumber: string;
  insuranceProvider: string;
  insuranceExpiry: string;
  registrationNumber: string;
  registrationExpiry: string;
}

const DriverAddVehicle = () => {
  const { addVehicle } = useDriverProfileStore();
  const { showError, showSuccess } = useUI();
  const { hasActiveRide, currentServiceType } = useDriverNavigation();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<VehicleFormData>({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
    seats: "",
    insurancePolicyNumber: "",
    insuranceProvider: "",
    insuranceExpiry: "",
    registrationNumber: "",
    registrationExpiry: "",
  });

  const [photos, setPhotos] = useState<string[]>([]);

  // Check for active ride on mount
  React.useEffect(() => {
    if (hasActiveRide) {
      showError(
        "Action Not Available",
        `You cannot add vehicles while on an active ${currentServiceType || "service"}. Please complete your current service first.`,
      );
      router.back();
    }
  }, [hasActiveRide, currentServiceType, showError]);

  const validateStep1 = (): boolean => {
    if (!formData.make.trim()) {
      showError("Validation Error", "Vehicle make is required");
      return false;
    }
    if (!formData.model.trim()) {
      showError("Validation Error", "Vehicle model is required");
      return false;
    }
    if (!formData.year.trim()) {
      showError("Validation Error", "Vehicle year is required");
      return false;
    }
    if (!formData.licensePlate.trim()) {
      showError("Validation Error", "License plate is required");
      return false;
    }
    if (!formData.color.trim()) {
      showError("Validation Error", "Vehicle color is required");
      return false;
    }
    if (!formData.seats.trim()) {
      showError("Validation Error", "Number of seats is required");
      return false;
    }

    const seatsNum = parseInt(formData.seats);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 20) {
      showError(
        "Validation Error",
        "Please enter a valid number of seats (1-20)",
      );
      return false;
    }

    const yearNum = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      showError("Validation Error", "Please enter a valid vehicle year");
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.insurancePolicyNumber.trim()) {
      showError("Validation Error", "Insurance policy number is required");
      return false;
    }
    if (!formData.insuranceProvider.trim()) {
      showError("Validation Error", "Insurance provider is required");
      return false;
    }
    if (!formData.insuranceExpiry.trim()) {
      showError("Validation Error", "Insurance expiry date is required");
      return false;
    }
    if (!formData.registrationNumber.trim()) {
      showError("Validation Error", "Registration number is required");
      return false;
    }
    if (!formData.registrationExpiry.trim()) {
      showError("Validation Error", "Registration expiry date is required");
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePhotoUpload = () => {
    Alert.alert(
      "Photo Upload",
      "Photo upload functionality will be implemented soon. For now, you can proceed without photos.",
      [
        { text: "Skip", style: "cancel" },
        { text: "Add Later", onPress: () => setCurrentStep(4) },
      ],
    );
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;

    setIsSubmitting(true);
    try {
      const vehicleData = {
        driverId: useDriverProfileStore.getState().profile?.id || "",
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        color: formData.color,
        plateNumber: formData.licensePlate.toUpperCase(),
        licensePlate: formData.licensePlate.toUpperCase(),
        vin: `VIN${Date.now()}`,
        seats: parseInt(formData.seats),
        insuranceProvider: formData.insuranceProvider,
        insurancePolicyNumber: formData.insurancePolicyNumber,
        insuranceExpiry: formData.insuranceExpiry
          ? new Date(formData.insuranceExpiry)
          : new Date(),
        registrationNumber: formData.registrationNumber,
        registrationExpiry: formData.registrationExpiry
          ? new Date(formData.registrationExpiry)
          : new Date(),
      };

      await addVehicle(vehicleData);

      showSuccess(
        "Vehicle Added",
        "Your vehicle has been added successfully and is pending verification",
      );

      // Navigate back after success
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      // Error is handled by the store
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <View key={step} className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              step <= currentStep ? "bg-primary-500" : "bg-secondary-300"
            }`}
          >
            <Text
              className={`font-JakartaBold ${
                step <= currentStep ? "text-white" : "text-secondary-600"
              }`}
            >
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View
              className={`w-8 h-1 ${
                step < currentStep ? "bg-primary-500" : "bg-secondary-300"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Card className="mb-6">
      <Text className="text-lg font-JakartaBold mb-4">Vehicle Information</Text>

      <View className="space-y-4">
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <TextField
              label="Make"
              value={formData.make}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, make: text }))
              }
              placeholder="e.g. Toyota"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Model"
              value={formData.model}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, model: text }))
              }
              placeholder="e.g. Camry"
            />
          </View>
        </View>

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <TextField
              label="Year"
              value={formData.year}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, year: text }))
              }
              placeholder="e.g. 2020"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Seats"
              value={formData.seats}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, seats: text }))
              }
              placeholder="e.g. 4"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TextField
          label="License Plate"
          value={formData.licensePlate}
          onChangeText={(text) =>
            setFormData((prev) => ({
              ...prev,
              licensePlate: text.toUpperCase(),
            }))
          }
          placeholder="e.g. ABC123"
          autoCapitalize="characters"
        />

        <TextField
          label="Color"
          value={formData.color}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, color: text }))
          }
          placeholder="e.g. White"
        />
      </View>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="mb-6">
      <Text className="text-lg font-JakartaBold mb-4">
        Insurance & Registration
      </Text>

      <View className="space-y-4">
        <TextField
          label="Insurance Policy Number"
          value={formData.insurancePolicyNumber}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, insurancePolicyNumber: text }))
          }
          placeholder="Enter policy number"
        />

        <TextField
          label="Insurance Provider"
          value={formData.insuranceProvider}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, insuranceProvider: text }))
          }
          placeholder="e.g. State Farm"
        />

        <TextField
          label="Insurance Expiry Date"
          value={formData.insuranceExpiry}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, insuranceExpiry: text }))
          }
          placeholder="YYYY-MM-DD"
        />

        <TextField
          label="Registration Number"
          value={formData.registrationNumber}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, registrationNumber: text }))
          }
          placeholder="Enter registration number"
        />

        <TextField
          label="Registration Expiry Date"
          value={formData.registrationExpiry}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, registrationExpiry: text }))
          }
          placeholder="YYYY-MM-DD"
        />
      </View>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="mb-6">
      <Text className="text-lg font-JakartaBold mb-4">Vehicle Photos</Text>

      <View className="items-center">
        <View className="w-24 h-24 bg-secondary-100 rounded-lg mb-4 items-center justify-center">
          <Text className="text-3xl">📷</Text>
        </View>
        <Text className="text-secondary-600 text-center mb-4">
          Add photos of your vehicle for verification purposes
        </Text>
        <Button
          title="Upload Photos"
          onPress={handlePhotoUpload}
          variant="outline"
          className="w-full"
        />
      </View>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="mb-6">
      <Text className="text-lg font-JakartaBold mb-4">Review & Submit</Text>

      <View className="space-y-3">
        <View className="flex-row justify-between">
          <Text className="text-secondary-600">Vehicle:</Text>
          <Text className="font-JakartaMedium">
            {formData.year} {formData.make} {formData.model}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-secondary-600">License Plate:</Text>
          <Text className="font-JakartaMedium">{formData.licensePlate}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-secondary-600">Insurance:</Text>
          <Text className="font-JakartaMedium">
            {formData.insuranceProvider}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-secondary-600">Photos:</Text>
          <Text className="font-JakartaMedium">
            {photos.length > 0 ? `${photos.length} uploaded` : "None uploaded"}
          </Text>
        </View>
      </View>

      <View className="bg-warning-50 border border-warning-200 rounded-lg p-4 mt-4">
        <Text className="text-warning-800 font-JakartaMedium mb-1">
          Verification Required
        </Text>
        <Text className="text-warning-700 text-sm">
          Your vehicle will be reviewed by our team. You'll receive a
          notification once verification is complete.
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Add New Vehicle</Text>
        <Text className="text-secondary-600 mt-1">
          Complete the information to register your vehicle
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <View className="flex-row space-x-4">
            {currentStep > 1 && (
              <Button
                title="Previous"
                onPress={handlePrevStep}
                className="flex-1"
                variant="outline"
                disabled={isSubmitting}
              />
            )}
            {currentStep < 4 ? (
              <Button
                title="Next"
                onPress={handleNextStep}
                className="flex-1"
                variant="primary"
              />
            ) : (
              <Button
                title={isSubmitting ? "Adding Vehicle..." : "Add Vehicle"}
                onPress={handleSubmit}
                className="flex-1"
                variant="success"
                disabled={isSubmitting}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverAddVehicle;
