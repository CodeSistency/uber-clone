import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import CustomButton from '@/components/CustomButton';

// Dummy data for ride requests
const DUMMY_RIDE_REQUESTS = [
  {
    id: 'REQ_001',
    pickupAddress: '123 Main St, Downtown',
    dropoffAddress: '456 Broadway Ave, Uptown',
    distance: 3.2,
    estimatedFare: 18.50,
    estimatedTime: 15,
    passengerRating: 4.8,
    requestedAt: '2 min ago'
  },
  {
    id: 'REQ_002',
    pickupAddress: '789 Park Ave, Midtown',
    dropoffAddress: '321 Elm St, Downtown',
    distance: 2.8,
    estimatedFare: 15.75,
    estimatedTime: 12,
    passengerRating: 4.9,
    requestedAt: '5 min ago'
  },
  {
    id: 'REQ_003',
    pickupAddress: '555 5th Ave, Manhattan',
    dropoffAddress: '888 Madison Ave, Manhattan',
    distance: 4.1,
    estimatedFare: 22.25,
    estimatedTime: 20,
    passengerRating: 4.7,
    requestedAt: '8 min ago'
  }
];

const RideRequests = () => {
  const [rideRequests, setRideRequests] = useState(DUMMY_RIDE_REQUESTS);
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);

  const handleAcceptRide = async (rideId: string) => {
    setAcceptingRide(rideId);

    // Simulate API call delay
    setTimeout(() => {
      Alert.alert('Ride Accepted!', 'You have 2 minutes to pick up the passenger.', [
        {
          text: 'OK',
          onPress: () => {
            // Remove the accepted ride from the list
            setRideRequests(prev => prev.filter(ride => ride.id !== rideId));
            setAcceptingRide(null);
          }
        }
      ]);
    }, 1000);
  };

  const handleDeclineRide = (rideId: string) => {
    Alert.alert('Ride Declined', 'Looking for the next ride...');
    setRideRequests(prev => prev.filter(ride => ride.id !== rideId));
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Available Rides</Text>
        <Text className="text-secondary-600 mt-1">
          {rideRequests.length} ride{rideRequests.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {rideRequests.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-6xl mb-4">🚕</Text>
            <Text className="text-xl font-JakartaBold text-center mb-2">
              No rides available
            </Text>
            <Text className="text-secondary-600 text-center">
              New ride requests will appear here when available
            </Text>
          </View>
        ) : (
          rideRequests.map((ride) => (
            <View key={ride.id} className="bg-white rounded-lg p-4 mb-4">
              {/* Ride Header */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-JakartaBold text-primary-500">
                  ${ride.estimatedFare}
                </Text>
                <Text className="text-sm text-secondary-600">
                  {ride.requestedAt}
                </Text>
              </View>

              {/* Route */}
              <View className="mb-3">
                <View className="flex-row items-center mb-2">
                  <Text className="text-green-500 mr-2">📍</Text>
                  <Text className="font-JakartaMedium flex-1" numberOfLines={1}>
                    {ride.pickupAddress}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-red-500 mr-2">🏁</Text>
                  <Text className="font-JakartaMedium flex-1" numberOfLines={1}>
                    {ride.dropoffAddress}
                  </Text>
                </View>
              </View>

              {/* Ride Details */}
              <View className="flex-row justify-between mb-4 bg-general-500 rounded-lg p-3">
                <View className="items-center">
                  <Text className="text-sm text-secondary-600">Distance</Text>
                  <Text className="font-JakartaBold">{ride.distance} mi</Text>
                </View>
                <View className="items-center">
                  <Text className="text-sm text-secondary-600">Time</Text>
                  <Text className="font-JakartaBold">{ride.estimatedTime} min</Text>
                </View>
                <View className="items-center">
                  <Text className="text-sm text-secondary-600">Rating</Text>
                  <Text className="font-JakartaBold">⭐ {ride.passengerRating}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => handleDeclineRide(ride.id)}
                  className="flex-1 bg-danger-500 rounded-full py-3 items-center"
                  disabled={acceptingRide === ride.id}
                >
                  <Text className="text-white font-JakartaBold">Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAcceptRide(ride.id)}
                  className={`flex-1 bg-success-500 rounded-full py-3 items-center ${
                    acceptingRide === ride.id ? 'opacity-50' : ''
                  }`}
                  disabled={acceptingRide === ride.id}
                >
                  <Text className="text-white font-JakartaBold">
                    {acceptingRide === ride.id ? 'Accepting...' : 'Accept'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RideRequests;
