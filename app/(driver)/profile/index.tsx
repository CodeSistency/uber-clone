import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import CustomButton from '@/components/CustomButton';

// Dummy data for driver profile
const DUMMY_DRIVER = {
  firstName: 'Alex',
  lastName: 'Rodriguez',
  email: 'alex.rodriguez@example.com',
  phone: '+1 (555) 123-4567',
  profileImage: 'https://via.placeholder.com/100x100',
  carModel: 'Toyota Camry',
  licensePlate: 'ABC-1234',
  carSeats: 4,
  rating: 4.8,
  totalTrips: 1247,
  joinDate: 'January 2023'
};

const DUMMY_DOCUMENTS = [
  {
    id: 'license',
    name: 'Driver License',
    status: 'approved',
    uploadedDate: '2024-01-15'
  },
  {
    id: 'registration',
    name: 'Vehicle Registration',
    status: 'approved',
    uploadedDate: '2024-01-15'
  },
  {
    id: 'insurance',
    name: 'Insurance Certificate',
    status: 'pending',
    uploadedDate: '2024-01-10'
  }
];

const DriverProfile = () => {
  const [driver] = useState(DUMMY_DRIVER);
  const [documents] = useState(DUMMY_DOCUMENTS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-success-500';
      case 'pending': return 'text-warning-500';
      case 'rejected': return 'text-danger-500';
      default: return 'text-secondary-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '📄';
    }
  };

  const handleUploadDocument = (docType: string) => {
    Alert.alert('Upload Document', `Upload ${docType} functionality would open camera/gallery`);
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Profile</Text>
        <Text className="text-secondary-600 mt-1">
          Manage your account and vehicle information
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Profile Header */}
        <View className="bg-white rounded-lg p-4 mb-4 items-center">
          <Image
            source={{ uri: driver.profileImage }}
            className="w-20 h-20 rounded-full mb-3"
          />
          <Text className="text-xl font-JakartaExtraBold mb-1">
            {driver.firstName} {driver.lastName}
          </Text>
          <Text className="text-secondary-600 mb-2">{driver.email}</Text>

          {/* Rating and Stats */}
          <View className="flex-row space-x-6">
            <View className="items-center">
              <Text className="text-lg font-JakartaExtraBold text-warning-500">
                ⭐ {driver.rating}
              </Text>
              <Text className="text-xs text-secondary-600">Rating</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-JakartaExtraBold text-primary-500">
                {driver.totalTrips}
              </Text>
              <Text className="text-xs text-secondary-600">Trips</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-JakartaExtraBold text-success-500">
                {driver.joinDate}
              </Text>
              <Text className="text-xs text-secondary-600">Member</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Personal Information</Text>

          <View className="space-y-3">
            <View>
              <Text className="text-sm text-secondary-600 mb-1">Full Name</Text>
              <Text className="font-JakartaMedium">{driver.firstName} {driver.lastName}</Text>
            </View>

            <View>
              <Text className="text-sm text-secondary-600 mb-1">Email</Text>
              <Text className="font-JakartaMedium">{driver.email}</Text>
            </View>

            <View>
              <Text className="text-sm text-secondary-600 mb-1">Phone</Text>
              <Text className="font-JakartaMedium">{driver.phone}</Text>
            </View>
          </View>

          <TouchableOpacity className="bg-primary-500 rounded-full py-3 mt-4">
            <Text className="text-white font-JakartaBold text-center">Edit Information</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Information */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Vehicle Information</Text>

          <View className="space-y-3">
            <View>
              <Text className="text-sm text-secondary-600 mb-1">Model</Text>
              <Text className="font-JakartaMedium">{driver.carModel}</Text>
            </View>

            <View>
              <Text className="text-sm text-secondary-600 mb-1">License Plate</Text>
              <Text className="font-JakartaMedium">{driver.licensePlate}</Text>
            </View>

            <View>
              <Text className="text-sm text-secondary-600 mb-1">Passenger Seats</Text>
              <Text className="font-JakartaMedium">{driver.carSeats}</Text>
            </View>
          </View>

          <TouchableOpacity className="bg-primary-500 rounded-full py-3 mt-4">
            <Text className="text-white font-JakartaBold text-center">Update Vehicle</Text>
          </TouchableOpacity>
        </View>

        {/* Documents */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Verification Documents</Text>

          {documents.map((doc) => (
            <View key={doc.id} className="flex-row items-center justify-between py-3 border-b border-general-500 last:border-b-0">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">{getStatusIcon(doc.status)}</Text>
                <View>
                  <Text className="font-JakartaMedium">{doc.name}</Text>
                  <Text className="text-xs text-secondary-600">
                    Uploaded: {doc.uploadedDate}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className={`font-JakartaBold text-sm ${getStatusColor(doc.status)}`}>
                  {doc.status.toUpperCase()}
                </Text>
                {doc.status === 'pending' && (
                  <TouchableOpacity
                    onPress={() => handleUploadDocument(doc.name)}
                    className="mt-1"
                  >
                    <Text className="text-primary-500 text-xs font-JakartaBold">Re-upload</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Account Actions */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Account Actions</Text>

          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center justify-between p-3 bg-general-500 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">🔔</Text>
                <Text className="font-JakartaMedium">Notifications</Text>
              </View>
              <Text className="text-secondary-600">→</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-3 bg-general-500 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">💳</Text>
                <Text className="font-JakartaMedium">Payment Methods</Text>
              </View>
              <Text className="text-secondary-600">→</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-3 bg-general-500 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">❓</Text>
                <Text className="font-JakartaMedium">Help & Support</Text>
              </View>
              <Text className="text-secondary-600">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverProfile;
