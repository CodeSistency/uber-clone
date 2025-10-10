import React, { memo } from 'react';
import { Marker } from 'react-native-maps';
import { icons } from '@/constants';
import type { DriverMarker, Coordinates } from '@/types/map';
import type { Restaurant } from '@/constants/dummyData';

interface MapMarkersProps {
  serviceType: 'transport' | 'delivery';
  markers: DriverMarker[];
  selectedDriver: number | null;
  userLocation: Coordinates | null;
  destination: Coordinates | null;
  driverLocation: Coordinates | null;
  restaurants: Restaurant[];
}

const MapMarkers: React.FC<MapMarkersProps> = memo(({
  serviceType,
  markers,
  selectedDriver,
  userLocation,
  destination,
  driverLocation,
  restaurants,
}) => {
  return (
    <>
      {/* Transport markers */}
      {serviceType === 'transport' && markers.map(marker => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          title={marker.title}
          image={selectedDriver === marker.driverId ? icons.selectedMarker : icons.marker}
        />
      ))}

      {/* Delivery markers */}
      {serviceType === 'delivery' && restaurants.map(restaurant => (
        <Marker
          key={restaurant.id}
          coordinate={restaurant.location}
          title={restaurant.name}
        />
      ))}

      {/* User location */}
      {userLocation && (
        <Marker
          coordinate={userLocation}
          title="Your Location"
          image={icons.point}
        />
      )}

      {/* Destination */}
      {destination && (
        <Marker
          coordinate={destination}
          title="Destination"
          image={icons.pin}
        />
      )}

      {/* Live driver */}
      {driverLocation && (
        <Marker
          coordinate={driverLocation}
          title="Driver"
          image={icons.selectedMarker}
        />
      )}
    </>
  );
});

MapMarkers.displayName = 'MapMarkers';

export default MapMarkers;
