import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { AppHeader } from '@/components/common';
import { Card, Button, TextField, Select } from '@/components/ui';
import { useBasicInfo, useProfileActions } from '@/store/profile';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export default function EditBasicInfoScreen() {
  const basicInfo = useBasicInfo();
  const { updateBasicInfo } = useProfileActions();

  const [formData, setFormData] = useState({
    firstName: basicInfo.firstName,
    lastName: basicInfo.lastName,
    dateOfBirth: basicInfo.dateOfBirth,
    gender: basicInfo.gender,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize form with current data
    setFormData({
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      dateOfBirth: basicInfo.dateOfBirth,
      gender: basicInfo.gender,
    });
  }, [basicInfo]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('dateOfBirth', selectedDate);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // Update profile data
      updateBasicInfo({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });

      // Here you would typically make an API call
      // await profileAPI.updateBasicInfo(formData);

      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Edit Profile"
        showBackButton={true}
        rightText="Save"
        onRightPress={handleSave}
        rightTextDisabled={isLoading}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card className="p-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-6">
              Personal Information
            </Text>

            {/* First Name */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                First Name *
              </Text>
              <TextField
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                placeholder="Enter your first name"
                className="bg-white"
              />
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Last Name *
              </Text>
              <TextField
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                placeholder="Enter your last name"
                className="bg-white"
              />
            </View>

            {/* Date of Birth */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Date of Birth
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white border border-gray-300 rounded-lg p-4 flex-row justify-between items-center"
              >
                <Text className={`font-Jakarta-Medium ${
                  formData.dateOfBirth ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {formatDate(formData.dateOfBirth)}
                </Text>
                <Text className="text-gray-400 text-xl">📅</Text>
              </TouchableOpacity>
            </View>

            {/* Gender */}
            <View className="mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Gender
              </Text>
              <Select
                options={GENDER_OPTIONS}
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                placeholder="Select gender"
                className="bg-white"
              />
            </View>

            {/* Save Button */}
            <Button
              title="Save Changes"
              onPress={handleSave}
              disabled={isLoading}
              className="w-full"
            />
          </Card>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
}




