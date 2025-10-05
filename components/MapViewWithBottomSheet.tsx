import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";

import { icons } from "@/constants";
import { useRoutePrediction } from "@/hooks/useRoutePrediction";
import { calculateRegion } from "@/lib/map";
import { useLocationStore } from "@/store";

import DriverTrail from "./DriverTrail";
import RoutePredictionOverlay from "./RoutePredictionOverlay";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MapViewWithBottomSheetProps {
  // Map props
  markers?: {
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    image?: any;
  }[];
  routeCoordinates?: { latitude: number; longitude: number }[];
  showUserLocation?: boolean;
  mapHeight?: number; // Percentage of screen height (0-100)

  // Bottom sheet props
  bottomSheetContent: React.ReactNode;
  bottomSheetHeight?: number; // Percentage of screen height (25-75)
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  enableOverDrag?: boolean;

  // Callbacks
  onMapReady?: () => void;
  onRegionChange?: (region: Region) => void;
  onMarkerPress?: (marker: any) => void;

  // Custom styling
  mapStyle?: any;
  bottomSheetStyle?: any;
}

const MapViewWithBottomSheet: React.FC<MapViewWithBottomSheetProps> = ({
  markers = [],
  routeCoordinates = [],
  showUserLocation = true,
  mapHeight = 60, // Default 60% of screen

  bottomSheetContent,
  bottomSheetHeight = 40, // Default 40% of screen
  snapPoints,
  enablePanDownToClose = true,
  enableOverDrag = true,

  onMapReady,
  onRegionChange,
  onMarkerPress,

  mapStyle,
  bottomSheetStyle,
}) => {
  // Route prediction hook - only enable for driver mode
  const { prediction: routePrediction } = useRoutePrediction({
    enabled: true, // Could be made configurable based on user mode
    updateInterval: 2000,
    minSpeedThreshold: 5,
  });
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Calculate default snap points if not provided
  const defaultSnapPoints = snapPoints || ["40%", "60%", "80%"];

  // Calculate map region
  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  // Handle marker press
  const handleMarkerPress = (marker: any) => {
    
    if (onMarkerPress) {
      onMarkerPress(marker);
    }
  };

  // Present bottom sheet on mount
  useEffect(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
    }
  }, []);

  const mapViewHeight = `${mapHeight}%` as any; // Using percentage height
  const bottomSheetViewHeight = `${100 - mapHeight}%`;

  return (
    <View className="flex-1 relative">
      {/* Map Container */}
      <View style={{ height: mapViewHeight }} className="relative">
        <MapView
          provider={PROVIDER_DEFAULT}
          className="w-full h-full"
          tintColor="black"
          mapType="standard"
          showsPointsOfInterest={false}
          initialRegion={region}
          showsUserLocation={showUserLocation}
          userInterfaceStyle="light"
          onMapReady={onMapReady}
          onRegionChange={onRegionChange}
          style={mapStyle}
        >
          {/* Render markers */}
          {markers.map((marker, index) => (
            <Marker
              key={marker.id || index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              description={marker.description}
              image={marker.image || icons.marker}
              onPress={() => handleMarkerPress(marker)}
            />
          ))}

          {/* Origin marker */}
          {userLatitude && userLongitude && (
            <Marker
              key="origin"
              coordinate={{
                latitude: userLatitude,
                longitude: userLongitude,
              }}
              title="Origin"
              image={icons.point}
            />
          )}

          {/* Destination marker */}
          {destinationLatitude && destinationLongitude && (
            <Marker
              key="destination"
              coordinate={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              title="Destination"
              image={icons.pin}
            />
          )}

          {/* Route polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#4285F4"
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}

          {/* Driver trail - automatically included */}
          <DriverTrail />

          {/* Route prediction overlay - shows predicted path */}
          <RoutePredictionOverlay
            prediction={routePrediction}
            color="#00FF88"
            width={3}
            opacity={0.7}
            dashPattern={[10, 10]}
            animated={true}
            showConfidenceIndicators={false}
          />
        </MapView>
      </View>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={defaultSnapPoints}
        enablePanDownToClose={enablePanDownToClose}
        enableOverDrag={enableOverDrag}
        backgroundStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          ...bottomSheetStyle,
        }}
        handleIndicatorStyle={{
          backgroundColor: "#E5E5E5",
          width: 40,
          height: 4,
        }}
      >
        <BottomSheetView className="flex-1 px-5 pt-2">
          <ScrollView showsVerticalScrollIndicator={false}>
            {bottomSheetContent}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

export default MapViewWithBottomSheet;
