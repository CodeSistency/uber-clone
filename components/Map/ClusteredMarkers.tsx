import React, { memo } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, TouchableOpacity } from 'react-native';
import { icons } from '@/constants';
import type { DriverMarker, MarkerCluster, Coordinates } from '@/types/map';

interface ClusteredMarkersProps {
  clusters: (DriverMarker | MarkerCluster)[];
  selectedDriver: number | null;
  onMarkerPress: (marker: DriverMarker) => void;
  onClusterPress: (cluster: MarkerCluster) => void;
}

const isCluster = (item: any): item is MarkerCluster => {
  return 'pointCount' in item;
};

const ClusteredMarkers: React.FC<ClusteredMarkersProps> = memo(({
  clusters,
  selectedDriver,
  onMarkerPress,
  onClusterPress,
}) => {
  return (
    <>
      {clusters.map(item => {
        if (isCluster(item)) {
          // Render cluster
          return (
            <Marker
              key={item.id}
              coordinate={item.coordinate}
              onPress={() => onClusterPress(item)}
            >
              <View className="bg-primary rounded-full items-center justify-center"
                    style={{ width: 50, height: 50 }}>
                <Text className="text-white font-JakartaBold text-lg">
                  {item.pointCount}
                </Text>
              </View>
              <Callout>
                <Text className="font-JakartaBold">
                  {item.pointCount} conductores
                </Text>
              </Callout>
            </Marker>
          );
        } else {
          // Render individual marker
          const marker = item as DriverMarker;
          return (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              description={marker.description}
              image={selectedDriver === marker.driverId ? icons.selectedMarker : icons.marker}
              onPress={() => onMarkerPress(marker)}
            />
          );
        }
      })}
    </>
  );
});

ClusteredMarkers.displayName = 'ClusteredMarkers';

export default ClusteredMarkers;
