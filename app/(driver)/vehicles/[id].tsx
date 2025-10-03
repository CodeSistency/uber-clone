import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { Button, Card, TextField } from "@/components/ui";
import { useDriverProfileStore } from "@/store/driverProfile";
import { useUI } from "@/components/UIWrapper";
import { useDriverNavigation } from "@/hooks/useDriverNavigation";

const DriverVehicleDetails = () => {
  const { id } = useLocalSearchParams();
  const vehicleId = Array.isArray(id) ? id[0] : id;

  const {
    vehicles,
    isLoading,
    error,
    fetchVehicles,
    updateVehicle,
    deleteVehicle,
  } = useDriverProfileStore();

  const { showError, showSuccess } = useUI();
  const { hasActiveRide, currentServiceType } = useDriverNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for editing
  const [editData, setEditData] = useState({
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

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  useEffect(() => {
    // Check if user has active ride
    if (hasActiveRide) {
      showError(
        "Action Not Available",
        `You cannot modify vehicle details while on an active ${currentServiceType || "service"}. Please complete your current service first.`,
      );
      router.back();
      return;
    }

    // Fetch vehicles if not loaded
    if (vehicles.length === 0) {
      fetchVehicles();
    }
  }, [
    hasActiveRide,
    currentServiceType,
    vehicles.length,
    fetchVehicles,
    showError,
  ]);

  useEffect(() => {
    // Populate form with vehicle data
    if (vehicle) {
      setEditData({
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year?.toString() || "",
        licensePlate: vehicle.licensePlate || "",
        color: vehicle.color || "",
        seats: vehicle.seats?.toString() || "",
        insurancePolicyNumber: vehicle.insurancePolicyNumber || "",
        insuranceProvider: vehicle.insuranceProvider || "",
        insuranceExpiry:
          vehicle.insuranceExpiry instanceof Date
            ? vehicle.insuranceExpiry.toISOString().split("T")[0]
            : vehicle.insuranceExpiry || "",
        registrationNumber: vehicle.registrationNumber || "",
        registrationExpiry:
          vehicle.registrationExpiry instanceof Date
            ? vehicle.registrationExpiry.toISOString().split("T")[0]
            : vehicle.registrationExpiry || "",
      });
    }
  }, [vehicle]);

  useEffect(() => {
    if (error) {
      showError("Error", error);
    }
  }, [error, showError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-success-600";
      case "inactive":
        return "text-secondary-600";
      case "pending":
        return "text-warning-600";
      case "suspended":
        return "text-danger-600";
      default:
        return "text-secondary-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "✅";
      case "inactive":
        return "⏸️";
      case "pending":
        return "⏳";
      case "suspended":
        return "🚫";
      default:
        return "❓";
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    if (vehicle) {
      setEditData({
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year?.toString() || "",
        licensePlate: vehicle.licensePlate || "",
        color: vehicle.color || "",
        seats: vehicle.seats?.toString() || "",
        insurancePolicyNumber: vehicle.insurancePolicyNumber || "",
        insuranceProvider: vehicle.insuranceProvider || "",
        insuranceExpiry:
          vehicle.insuranceExpiry instanceof Date
            ? vehicle.insuranceExpiry.toISOString().split("T")[0]
            : vehicle.insuranceExpiry || "",
        registrationNumber: vehicle.registrationNumber || "",
        registrationExpiry:
          vehicle.registrationExpiry instanceof Date
            ? vehicle.registrationExpiry.toISOString().split("T")[0]
            : vehicle.registrationExpiry || "",
      });
    }
  };

  const handleSave = async () => {
    if (!vehicle) return;

    // Validate required fields
    if (
      !editData.make.trim() ||
      !editData.model.trim() ||
      !editData.year.trim()
    ) {
      showError("Validation Error", "Make, model, and year are required");
      return;
    }

    const seatsNum = parseInt(editData.seats);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 20) {
      showError(
        "Validation Error",
        "Please enter a valid number of seats (1-20)",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        make: editData.make,
        model: editData.model,
        year: parseInt(editData.year),
        licensePlate: editData.licensePlate.toUpperCase(),
        color: editData.color,
        seats: seatsNum,
        insurancePolicyNumber: editData.insurancePolicyNumber,
        insuranceProvider: editData.insuranceProvider,
        insuranceExpiry: editData.insuranceExpiry
          ? new Date(editData.insuranceExpiry)
          : new Date(),
        registrationNumber: editData.registrationNumber,
        registrationExpiry: editData.registrationExpiry
          ? new Date(editData.registrationExpiry)
          : new Date(),
      };

      await updateVehicle(vehicle.id, updateData);

      showSuccess(
        "Vehicle Updated",
        "Vehicle details have been updated successfully",
      );
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the store
      console.error("Vehicle update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleConfirmDelete },
      ],
    );
  };

  const handleConfirmDelete = async () => {
    if (!vehicle) return;

    try {
      await deleteVehicle(vehicle.id);
      showSuccess("Vehicle Deleted", "Vehicle has been removed successfully");
      router.back();
    } catch (error) {
      // Error is handled by the store
      console.error("Vehicle deletion failed:", error);
    }
  };

  const handleToggleStatus = async () => {
    if (!vehicle) return;

    const newStatus = vehicle.status === "active" ? "inactive" : "active";
    const actionText = newStatus === "active" ? "activate" : "deactivate";

    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Vehicle`,
      `Are you sure you want to ${actionText} this vehicle?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: newStatus === "active" ? "default" : "destructive",
          onPress: () => performStatusToggle(newStatus),
        },
      ],
    );
  };

  const performStatusToggle = async (newStatus: string) => {
    if (!vehicle) return;

    try {
      await updateVehicle(vehicle.id, { status: newStatus as any });
      showSuccess(
        "Status Updated",
        `Vehicle has been ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      );
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (isLoading && !vehicle) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg">Loading vehicle details...</Text>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg text-danger-500">Vehicle not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          className="mt-4"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xl font-JakartaBold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text className="text-secondary-600 mt-1">
              {vehicle.licensePlate}
            </Text>
          </View>
          <View className="flex-row space-x-2">
            <Button
              title={isEditing ? "Cancel" : "Edit"}
              onPress={isEditing ? handleCancel : handleEdit}
              className="px-4 py-2"
              variant="outline"
            />
            {!isEditing && (
              <Button
                title={vehicle.status === "active" ? "Deactivate" : "Activate"}
                onPress={handleToggleStatus}
                className="px-4 py-2"
                variant={vehicle.status === "active" ? "danger" : "success"}
              />
            )}
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6 space-y-4">
          {/* Status Card */}
          <Card className="mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">
                  {getStatusIcon(vehicle.status)}
                </Text>
                <View>
                  <Text className="font-JakartaBold text-lg">Status</Text>
                  <Text
                    className={`font-JakartaMedium ${getStatusColor(vehicle.status)}`}
                  >
                    {vehicle.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              {vehicle.status === "pending" && (
                <View className="bg-warning-50 px-3 py-1 rounded-full">
                  <Text className="text-warning-700 text-xs font-JakartaBold">
                    UNDER REVIEW
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Vehicle Information */}
          <Card className="mb-4">
            <Text className="text-lg font-JakartaBold mb-4">
              Vehicle Information
            </Text>

            {isEditing ? (
              <View className="space-y-4">
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <TextField
                      label="Make"
                      value={editData.make}
                      onChangeText={(text) =>
                        setEditData((prev) => ({ ...prev, make: text }))
                      }
                      placeholder="Vehicle make"
                    />
                  </View>
                  <View className="flex-1">
                    <TextField
                      label="Model"
                      value={editData.model}
                      onChangeText={(text) =>
                        setEditData((prev) => ({ ...prev, model: text }))
                      }
                      placeholder="Vehicle model"
                    />
                  </View>
                </View>

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <TextField
                      label="Year"
                      value={editData.year}
                      onChangeText={(text) =>
                        setEditData((prev) => ({ ...prev, year: text }))
                      }
                      placeholder="Vehicle year"
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <TextField
                      label="Seats"
                      value={editData.seats}
                      onChangeText={(text) =>
                        setEditData((prev) => ({ ...prev, seats: text }))
                      }
                      placeholder="Number of seats"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TextField
                  label="License Plate"
                  value={editData.licensePlate}
                  onChangeText={(text) =>
                    setEditData((prev) => ({
                      ...prev,
                      licensePlate: text.toUpperCase(),
                    }))
                  }
                  placeholder="License plate"
                  autoCapitalize="characters"
                />

                <TextField
                  label="Color"
                  value={editData.color}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, color: text }))
                  }
                  placeholder="Vehicle color"
                />
              </View>
            ) : (
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Make & Model:</Text>
                  <Text className="font-JakartaMedium">
                    {vehicle.make} {vehicle.model}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Year:</Text>
                  <Text className="font-JakartaMedium">{vehicle.year}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">License Plate:</Text>
                  <Text className="font-JakartaMedium">
                    {vehicle.licensePlate}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Color:</Text>
                  <Text className="font-JakartaMedium">{vehicle.color}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Seats:</Text>
                  <Text className="font-JakartaMedium">{vehicle.seats}</Text>
                </View>
              </View>
            )}
          </Card>

          {/* Insurance Information */}
          <Card className="mb-4">
            <Text className="text-lg font-JakartaBold mb-4">
              Insurance & Registration
            </Text>

            {isEditing ? (
              <View className="space-y-4">
                <TextField
                  label="Insurance Policy Number"
                  value={editData.insurancePolicyNumber}
                  onChangeText={(text) =>
                    setEditData((prev) => ({
                      ...prev,
                      insurancePolicyNumber: text,
                    }))
                  }
                  placeholder="Policy number"
                />

                <TextField
                  label="Insurance Provider"
                  value={editData.insuranceProvider}
                  onChangeText={(text) =>
                    setEditData((prev) => ({
                      ...prev,
                      insuranceProvider: text,
                    }))
                  }
                  placeholder="Insurance company"
                />

                <TextField
                  label="Insurance Expiry Date"
                  value={editData.insuranceExpiry}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, insuranceExpiry: text }))
                  }
                  placeholder="YYYY-MM-DD"
                />

                <TextField
                  label="Registration Number"
                  value={editData.registrationNumber}
                  onChangeText={(text) =>
                    setEditData((prev) => ({
                      ...prev,
                      registrationNumber: text,
                    }))
                  }
                  placeholder="Registration number"
                />

                <TextField
                  label="Registration Expiry Date"
                  value={editData.registrationExpiry}
                  onChangeText={(text) =>
                    setEditData((prev) => ({
                      ...prev,
                      registrationExpiry: text,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                />
              </View>
            ) : (
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Policy Number:</Text>
                  <Text className="font-JakartaMedium">
                    {vehicle.insurancePolicyNumber || "Not provided"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Provider:</Text>
                  <Text className="font-JakartaMedium">
                    {vehicle.insuranceProvider || "Not provided"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Insurance Expiry:</Text>
                  <Text className="font-JakartaMedium">
                    {vehicle.insuranceExpiry
                      ? new Date(vehicle.insuranceExpiry).toLocaleDateString()
                      : "Not provided"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Registration:</Text>
                  <Text className="font-JakartaMedium">
                    {vehicle.registrationNumber || "Not provided"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">
                    Registration Expiry:
                  </Text>
                  <Text className="font-JakartaMedium">
                    {vehicle.registrationExpiry
                      ? new Date(
                          vehicle.registrationExpiry,
                        ).toLocaleDateString()
                      : "Not provided"}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* Action Buttons */}
          {isEditing ? (
            <View className="flex-row space-x-4">
              <Button
                title="Cancel"
                onPress={handleCancel}
                className="flex-1"
                variant="outline"
                disabled={isSubmitting}
              />
              <Button
                title={isSubmitting ? "Saving..." : "Save Changes"}
                onPress={handleSave}
                className="flex-1"
                variant="primary"
                disabled={isSubmitting}
              />
            </View>
          ) : (
            <Button
              title="Delete Vehicle"
              onPress={handleDelete}
              className="w-full"
              variant="danger"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverVehicleDetails;
