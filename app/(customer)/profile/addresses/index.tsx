import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Button, Badge } from '@/components/ui';
import { useSavedAddresses, useProfileActions } from '@/store/profile';

const ADDRESS_TYPES = {
  home: { icon: '🏠', label: 'Home', color: 'bg-blue-100 text-blue-800' },
  work: { icon: '🏢', label: 'Work', color: 'bg-green-100 text-green-800' },
  gym: { icon: '🏋️', label: 'Gym', color: 'bg-purple-100 text-purple-800' },
  other: { icon: '📍', label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

export default function AddressesScreen() {
  const savedAddresses = useSavedAddresses();
  const { deleteAddress, setDefaultAddress } = useProfileActions();

  const handleAddAddress = () => {
    router.push('/(customer)/profile/addresses/add');
  };

  const handleEditAddress = (addressId: string) => {
    router.push({
      pathname: '/(customer)/profile/addresses/edit',
      params: { addressId },
    });
  };

  const handleDeleteAddress = (addressId: string, addressName: string) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${addressName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAddress(addressId);
            Alert.alert('Success', 'Address deleted successfully');
          },
        },
      ]
    );
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultAddress(addressId);
    Alert.alert('Success', 'Default address updated');
  };

  const getAddressTypeInfo = (type: string) => {
    return ADDRESS_TYPES[type as keyof typeof ADDRESS_TYPES] || ADDRESS_TYPES.other;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="My Addresses"
        showBackButton={true}
        rightText="Add"
        onRightPress={handleAddAddress}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {savedAddresses.length === 0 ? (
            // Empty State
            <Card className="p-8">
              <View className="items-center">
                <Text className="text-6xl mb-4">🏠</Text>
                <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-2">
                  No Addresses Yet
                </Text>
                <Text className="text-sm text-gray-600 text-center mb-6">
                  Add your frequently used addresses like home, work, or gym to make booking rides faster.
                </Text>
                <Button
                  title="Add Your First Address"
                  onPress={handleAddAddress}
                  className="w-full"
                />
              </View>
            </Card>
          ) : (
            // Address List
            <View className="space-y-4">
              {savedAddresses.map((address) => {
                const typeInfo = getAddressTypeInfo(address.type);
                
                return (
                  <Card key={address.id} className="p-4">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-3">
                        {/* Address Type and Name */}
                        <View className="flex-row items-center mb-2">
                          <Text className="text-2xl mr-2">{typeInfo.icon}</Text>
                          <View className="flex-1">
                            <View className="flex-row items-center">
                              <Text className="text-lg font-Jakarta-Bold text-gray-800">
                                {address.name}
                              </Text>
                              {address.isDefault && (
                                <Badge
                                  text="Default"
                                  className="ml-2 bg-green-100 text-green-800"
                                />
                              )}
                            </View>
                            <Text className={`text-xs font-Jakarta-Medium px-2 py-1 rounded-full self-start mt-1 ${typeInfo.color}`}>
                              {typeInfo.label}
                            </Text>
                          </View>
                        </View>

                        {/* Address Details */}
                        <Text className="text-sm text-gray-600 mb-3">
                          {address.address}
                        </Text>

                        {/* Coordinates (for debugging) */}
                        <Text className="text-xs text-gray-400">
                          {address.coordinates.latitude.toFixed(4)}, {address.coordinates.longitude.toFixed(4)}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View className="items-end space-y-2">
                        <TouchableOpacity
                          onPress={() => handleEditAddress(address.id)}
                          className="bg-blue-50 px-3 py-1 rounded-lg"
                        >
                          <Text className="text-xs font-Jakarta-SemiBold text-blue-600">
                            Edit
                          </Text>
                        </TouchableOpacity>

                        {!address.isDefault && (
                          <TouchableOpacity
                            onPress={() => handleSetDefault(address.id)}
                            className="bg-green-50 px-3 py-1 rounded-lg"
                          >
                            <Text className="text-xs font-Jakarta-SemiBold text-green-600">
                              Set Default
                            </Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          onPress={() => handleDeleteAddress(address.id, address.name)}
                          className="bg-red-50 px-3 py-1 rounded-lg"
                        >
                          <Text className="text-xs font-Jakarta-SemiBold text-red-600">
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                );
              })}

              {/* Add More Button */}
              <Card className="p-4">
                <TouchableOpacity
                  onPress={handleAddAddress}
                  className="flex-row items-center justify-center py-4"
                >
                  <Text className="text-2xl mr-3">➕</Text>
                  <Text className="text-lg font-Jakarta-SemiBold text-blue-600">
                    Add Another Address
                  </Text>
                </TouchableOpacity>
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}




