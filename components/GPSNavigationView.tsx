import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLocationStore } from '@/store';

interface GPSNavigationViewProps {
  destinationLatitude: number;
  destinationLongitude: number;
  destinationAddress: string;
  onArrived?: () => void;
  onClose?: () => void;
}

interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
}

const GPSNavigationView: React.FC<GPSNavigationViewProps> = ({
  destinationLatitude,
  destinationLongitude,
  destinationAddress,
  onArrived,
  onClose,
}) => {
  const { userLatitude, userLongitude } = useLocationStore();
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<NavigationStep | null>(null);
  const [distanceRemaining, setDistanceRemaining] = useState<string>('2.1 miles');
  const [timeRemaining, setTimeRemaining] = useState<string>('8 min');
  const [isNavigating, setIsNavigating] = useState(true);

  // Mock navigation data - in real app, this would come from Google Maps API
  useEffect(() => {
    // Simulate route calculation
    const mockRoute = [
      { latitude: userLatitude || 37.78825, longitude: userLongitude || -122.4324 },
      { latitude: destinationLatitude, longitude: destinationLongitude },
    ];
    setRouteCoordinates(mockRoute);

    // Mock current step
    setCurrentStep({
      instruction: 'Turn right in 500ft',
      distance: '0.5 mi',
      duration: '2 min',
    });
  }, [destinationLatitude, destinationLongitude, userLatitude, userLongitude]);

  const handleArrived = () => {
    Alert.alert(
      'Arrived at Destination',
      'You have arrived at the pickup location.',
      [
        {
          text: 'Confirm Arrival',
          onPress: () => {
            if (onArrived) {
              onArrived();
            }
          },
        },
      ],
    );
  };

  const handleMessagePassenger = () => {
    // Navigate to chat with passenger
    // router.push('/chat/passenger');
    Alert.alert('Message Passenger', 'Chat functionality would open here');
  };

  if (!userLatitude || !userLongitude) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-JakartaBold">Loading location...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Map View */}
      <View className="flex-1">
        <MapView
          className="flex-1"
          initialRegion={{
            latitude: userLatitude,
            longitude: userLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Destination Marker */}
          <Marker
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Pickup Location"
            description={destinationAddress}
            pinColor="red"
          />

          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0286FF"
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Navigation Overlay */}
        <View className="absolute top-12 left-4 right-4 bg-white rounded-lg p-4 shadow-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-JakartaBold text-lg">
              🎯 Heading to Pickup
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-xl">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-secondary-600 mb-1">Destination</Text>
            <Text className="font-JakartaMedium">{destinationAddress}</Text>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-sm text-secondary-600">Distance</Text>
              <Text className="font-JakartaBold">{distanceRemaining}</Text>
            </View>
            <View className="items-center">
              <Text className="text-sm text-secondary-600">ETA</Text>
              <Text className="font-JakartaBold">{timeRemaining}</Text>
            </View>
          </View>
        </View>

        {/* Current Step */}
        {currentStep && (
          <View className="absolute bottom-32 left-4 right-4 bg-white rounded-lg p-4 shadow-lg">
            <Text className="font-JakartaBold text-lg mb-2">
              {currentStep.instruction}
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">
                {currentStep.distance}
              </Text>
              <Text className="text-secondary-600">
                {currentStep.duration}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Action Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <View className="flex-row p-4">
            <TouchableOpacity
              onPress={handleMessagePassenger}
              className="flex-1 bg-primary-500 rounded-lg py-3 items-center mr-2"
            >
              <Text className="text-white font-JakartaBold">💬 Message Passenger</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleArrived}
              className="flex-1 bg-success-500 rounded-lg py-3 items-center ml-2"
            >
              <Text className="text-white font-JakartaBold">✅ Arrived</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GPSNavigationView;
