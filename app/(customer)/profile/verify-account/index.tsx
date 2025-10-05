import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { AppHeader } from '@/components/common';
import { Card, Button, TextField, TextArea } from '@/components/ui';
import { useProfileActions } from '@/store/profile';

const DOCUMENT_TYPES = [
  { label: 'DNI (Venezuela)', value: 'dni' },
  { label: 'Passport', value: 'passport' },
  { label: 'Driver License', value: 'license' },
  { label: 'Other', value: 'other' },
];

export default function VerifyAccountScreen() {
  const { updateAccountVerification } = useProfileActions();

  const [formData, setFormData] = useState({
    documentType: 'dni',
    documentNumber: '',
    additionalInfo: '',
  });

  const [documents, setDocuments] = useState({
    frontImage: null as string | null,
    backImage: null as string | null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagePicker = async (type: 'front' | 'back') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => ({
          ...prev,
          [type === 'front' ? 'frontImage' : 'backImage']: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateForm = () => {
    if (!formData.documentNumber.trim()) {
      Alert.alert('Error', 'Document number is required');
      return false;
    }
    if (!documents.frontImage) {
      Alert.alert('Error', 'Front side photo is required');
      return false;
    }
    if (!documents.backImage) {
      Alert.alert('Error', 'Back side photo is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Here you would typically make an API call
      // await profileAPI.submitVerificationDocuments({
      //   documentType: formData.documentType,
      //   documentNumber: formData.documentNumber,
      //   frontImage: documents.frontImage,
      //   backImage: documents.backImage,
      //   additionalInfo: formData.additionalInfo,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update verification status to pending
      updateAccountVerification('pending');

      Alert.alert(
        'Documents Submitted',
        'Your verification documents have been submitted for review. You will receive a notification once the review is complete.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push('/(customer)/profile/verify-account/status');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting documents:', error);
      Alert.alert('Error', 'Failed to submit documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Verify Account"
        showBackButton={true}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card className="p-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-6">
              Account Verification
            </Text>

            {/* Instructions */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <Text className="text-sm font-Jakarta-Medium text-blue-800">
                To verify your account, please provide a valid government-issued ID document. 
                This helps us ensure the safety and security of our platform.
              </Text>
            </View>

            {/* Document Type */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Document Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DOCUMENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => handleInputChange('documentType', type.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.documentType === type.value
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={`font-Jakarta-Medium text-sm ${
                        formData.documentType === type.value
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Document Number */}
            <View className="mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Document Number *
              </Text>
              <TextField
                value={formData.documentNumber}
                onChangeText={(text) => handleInputChange('documentNumber', text)}
                placeholder="Enter your document number"
                className="bg-white"
              />
            </View>

            {/* Document Photos */}
            <View className="mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-4">
                Document Photos *
              </Text>

              {/* Front Side */}
              <View className="mb-4">
                <Text className="text-sm font-Jakarta-Medium text-gray-600 mb-2">
                  Front Side
                </Text>
                <TouchableOpacity
                  onPress={() => handleImagePicker('front')}
                  className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
                >
                  {documents.frontImage ? (
                    <Image
                      source={{ uri: documents.frontImage }}
                      className="w-full h-32 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="items-center">
                      <Text className="text-4xl mb-2">📷</Text>
                      <Text className="text-sm font-Jakarta-Medium text-gray-600">
                        Tap to add front side photo
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Back Side */}
              <View className="mb-4">
                <Text className="text-sm font-Jakarta-Medium text-gray-600 mb-2">
                  Back Side
                </Text>
                <TouchableOpacity
                  onPress={() => handleImagePicker('back')}
                  className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
                >
                  {documents.backImage ? (
                    <Image
                      source={{ uri: documents.backImage }}
                      className="w-full h-32 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="items-center">
                      <Text className="text-4xl mb-2">📷</Text>
                      <Text className="text-sm font-Jakarta-Medium text-gray-600">
                        Tap to add back side photo
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Information */}
            <View className="mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Additional Information (Optional)
              </Text>
              <TextArea
                value={formData.additionalInfo}
                onChangeText={(text) => handleInputChange('additionalInfo', text)}
                placeholder="Any additional information that might help with verification..."
                className="bg-white"
                numberOfLines={3}
              />
            </View>

            {/* Processing Time Info */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <Text className="text-sm font-Jakarta-Medium text-yellow-800">
                ⏳ Verification may take 1-3 business days to complete. 
                You will receive a notification once your documents are reviewed.
              </Text>
            </View>

            {/* Submit Button */}
            <Button
              title="Submit for Review"
              onPress={handleSubmit}
              disabled={isLoading}
              className="w-full"
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}




