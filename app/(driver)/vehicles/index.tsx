import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, Card } from "@/components/ui";
import { 
  useDriverVehicles, 
  useActiveVehicle, 
  useIsVehiclesLoading, 
  useDriverError,
  useDriverStore
} from "@/store";
import { useUI } from "@/components/UIWrapper";
import { useDriverNavigation } from "@/hooks/useDriverNavigation";

const DriverVehicles = () => {
  // Use optimized selectors from consolidated driver store
  const vehicles = useDriverVehicles();
  const activeVehicle = useActiveVehicle();
  const isLoading = useIsVehiclesLoading();
  const error = useDriverError();
  
  // Get actions from the consolidated store
  const {
    addVehicle,
    updateVehicle,
    deleteVehicle,
    fetchVehicles,
    activateVehicle,
    deactivateVehicle,
  } = useDriverStore();
  const { showError, showSuccess } = useUI();
  const { hasActiveRide, currentServiceType } = useDriverNavigation();

  useEffect(() => {
    // Fetch vehicles when component mounts
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (error) {
      showError("Error", error);
    }
  }, [error]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-success-500";
      case "inactive":
        return "text-secondary-600";
      case "pending":
        return "text-warning-500";
      default:
        return "text-secondary-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "🟢";
      case "inactive":
        return "⚪";
      case "pending":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const handleAddVehicle = () => {
    if (hasActiveRide) {
      showError(
        "Action Not Available",
        `You cannot add vehicles while on an active ${currentServiceType || "service"}. Please complete your current service first.`,
      );
      return;
    }

    Alert.alert(
      "Add New Vehicle",
      "Add vehicle form - integrate with form component",
      [{ text: "OK" }],
    );
  };

  const handleEditVehicle = (vehicleId: string) => {
    if (hasActiveRide) {
      showError(
        "Action Not Available",
        `You cannot edit vehicles while on an active ${currentServiceType || "service"}. Please complete your current service first.`,
      );
      return;
    }

    Alert.alert(
      "Edit Vehicle",
      `Edit vehicle ${vehicleId} - integrate with form component`,
      [{ text: "OK" }],
    );
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (hasActiveRide) {
      showError(
        "Action Not Available",
        `You cannot delete vehicles while on an active ${currentServiceType || "service"}. Please complete your current service first.`,
      );
      return;
    }

    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicle(vehicleId);
              showSuccess("Success", "Vehicle deleted successfully");
            } catch (error) {
              showError("Error", "Failed to delete vehicle");
            }
          },
        },
      ],
    );
  };

  const toggleVehicleStatus = async (vehicleId: string) => {
    try {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (!vehicle) return;

      if (vehicle.status === "active") {
        await deactivateVehicle(vehicleId);
        showSuccess("Success", "Vehicle deactivated");
      } else {
        await activateVehicle(vehicleId);
        showSuccess("Success", "Vehicle activated");
      }
    } catch (error) {
      showError("Error", "Failed to update vehicle status");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-3"
        >
          <Text className="text-lg mr-2">←</Text>
          <Text className="text-lg font-JakartaBold">My Vehicles</Text>
        </TouchableOpacity>
        <Text className="text-secondary-600 mt-1">
          Manage your registered vehicles
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Active Ride Warning */}
        {hasActiveRide && (
          <View className="bg-warning-100 border border-warning-300 rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Text className="text-warning-700 font-JakartaBold text-lg mr-2">
                ⚠️
              </Text>
              <Text className="text-warning-800 font-JakartaBold">
                Active {currentServiceType || "Service"}
              </Text>
            </View>
            <Text className="text-warning-700 text-sm">
              You cannot modify vehicles while on an active service. Please
              complete your current service first.
            </Text>
          </View>
        )}

        {/* Add Vehicle Button */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Button
            title="+ Add New Vehicle"
            onPress={handleAddVehicle}
            className="w-full"
          />
        </View>

        {/* Vehicles List - Using @ui/ Card component */}
        {vehicles.length > 0 ? (
          vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="mb-4">
              {/* Vehicle Header */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">
                    {getStatusIcon(vehicle.status)}
                  </Text>
                  <View>
                    <Text className="text-lg font-JakartaBold">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                    <Text
                      className={`text-sm font-JakartaMedium ${getStatusColor(vehicle.status)}`}
                    >
                      {vehicle.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Button
                  title={
                    vehicle.status === "active" ? "Deactivate" : "Activate"
                  }
                  onPress={() => toggleVehicleStatus(vehicle.id)}
                  className="px-4 py-2"
                  variant={vehicle.status === "active" ? "danger" : "success"}
                />
              </View>

              {/* Vehicle Details */}
              <View className="space-y-2 mb-4">
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
                <View className="flex-row justify-between">
                  <Text className="text-secondary-600">Insurance Expiry:</Text>
                  <Text className="font-JakartaMedium">
                    {vehicle.insuranceExpiry
                      ? new Date(vehicle.insuranceExpiry).toLocaleDateString()
                      : "N/A"}
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
                      : "N/A"}
                  </Text>
                </View>
              </View>

              {/* Action Buttons - Using @ui/ Button component */}
              <View className="flex-row space-x-3">
                <Button
                  title="Edit Vehicle"
                  onPress={() => router.push(`/vehicles/${vehicle.id}` as any)}
                  className="flex-1"
                  variant="outline"
                />
                <Button
                  title="Delete"
                  onPress={() => handleDeleteVehicle(vehicle.id)}
                  className="flex-1"
                  variant="danger"
                />
              </View>
            </Card>
          ))
        ) : (
          <View className="bg-white rounded-lg p-8 mb-4 items-center">
            <Text className="text-4xl mb-4">🚗</Text>
            <Text className="text-lg font-JakartaBold mb-2">No Vehicles</Text>
            <Text className="text-secondary-600 text-center mb-4">
              You haven't registered any vehicles yet. Add your first vehicle to
              start driving.
            </Text>
            <Button title="Add Your First Vehicle" onPress={handleAddVehicle} />
          </View>
        )}

        {/* Show loading state when fetching vehicles */}
        {isLoading && vehicles.length === 0 && (
          <View className="bg-white rounded-lg p-8 mb-4 items-center">
            <Text className="text-lg font-JakartaMedium text-secondary-600">
              Loading vehicles...
            </Text>
          </View>
        )}

        {/* Show error state */}
        {error && (
          <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <Text className="text-orange-800 font-JakartaMedium mb-2">
              Unable to load vehicles
            </Text>
            <Text className="text-orange-600 text-sm mb-3">{error}</Text>
            <TouchableOpacity
              onPress={() => fetchVehicles()}
              className="bg-orange-500 px-4 py-2 rounded"
            >
              <Text className="text-white font-JakartaMedium">Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button - Using @ui/ Button component */}
      <View className="absolute bottom-6 right-6">
        <Button
          title="+ Add Vehicle"
          onPress={() => router.push("/(driver)/vehicles/add" as any)}
          className="px-6 py-3 rounded-full shadow-lg"
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

export default DriverVehicles;
