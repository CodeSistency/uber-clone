import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRidesStore } from '@/store/rides';
import { useConnectivity } from '@/hooks/useConnectivity';
import { OfflineBanner } from '@/components/offline/OfflineIndicator';
import RideCard from '@/components/RideCard';
import { CachedRide } from '@/lib/cache/CriticalDataCache';

// Local type definition for Ride (matching the interface from types/type.d.ts)
interface Ride {
  ride_id?: number;
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;
  fare_price: number;
  payment_status: string;
  status?: string;
  driver_id: number;
  user_id?: number;
  created_at: string;
  driver: {
    first_name: string;
    last_name: string;
    car_seats: number;
    rating?: number;
  };
}

interface RidesOfflineViewProps {
  onRidePress?: (rideId: number) => void;
  onRefresh?: () => void;
}

// Helper function to transform CachedRide to Ride
const transformCachedRideToRide = (cachedRide: CachedRide): Ride => {
  return {
    ride_id: cachedRide.ride_id,
    origin_address: cachedRide.origin_address,
    destination_address: cachedRide.destination_address,
    origin_latitude: cachedRide.origin_latitude,
    origin_longitude: cachedRide.origin_longitude,
    destination_latitude: cachedRide.destination_latitude,
    destination_longitude: cachedRide.destination_longitude,
    ride_time: cachedRide.ride_time,
    fare_price: cachedRide.fare_price,
    payment_status: cachedRide.payment_status,
    status: cachedRide.status,
    driver_id: cachedRide.driver_id,
    user_id: cachedRide.user_id,
    created_at: cachedRide.created_at,
    driver: cachedRide.driver || {
      first_name: 'Unknown',
      last_name: 'Driver',
      car_seats: 4,
      rating: undefined,
    },
  };
};

export const RidesOfflineView: React.FC<RidesOfflineViewProps> = ({
  onRidePress,
  onRefresh,
}) => {
  const {
    cachedRides,
    isLoadingCache,
    error,
    loadFromCache,
    syncWithServer,
    getTotalSpent,
    getAverageRating,
  } = useRidesStore();

  const { isOnline, pendingSyncCount, syncNow } = useConnectivity();
  const [refreshing, setRefreshing] = useState(false);

  // Load cache on mount
  useEffect(() => {
    loadFromCache();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOnline) {
        await syncWithServer();
      } else {
        await loadFromCache();
      }
      onRefresh?.();
    } catch (error) {
      console.error('[RidesOfflineView] Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      await syncNow();
      await loadFromCache(); // Reload cache after sync
    } catch (error) {
      console.error('[RidesOfflineView] Sync failed:', error);
    }
  };

  const renderRideItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => onRidePress?.(item.ride_id)}
      className="mb-3"
    >
      <RideCard
        ride={item}
        onPress={() => onRidePress?.(item.ride_id)}
        showStatus={true}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <View className="bg-gray-100 rounded-full p-6 mb-4">
        <Ionicons name="car" size={48} color="#6B7280" />
      </View>

      <Text className="font-JakartaBold text-xl text-gray-800 mb-2 text-center">
        {isOnline ? 'No tienes viajes aún' : 'Viajes guardados localmente'}
      </Text>

      <Text className="font-Jakarta text-base text-gray-600 text-center mb-6">
        {isOnline
          ? 'Tus viajes aparecerán aquí después de completar tu primer viaje.'
          : 'Los viajes se guardan localmente cuando no hay conexión a internet.'
        }
      </Text>

      {!isOnline && pendingSyncCount > 0 && (
        <TouchableOpacity
          onPress={handleSyncNow}
          className="bg-blue-500 rounded-lg py-3 px-6 flex-row items-center"
        >
          <Ionicons name="sync" size={20} color="#FFFFFF" />
          <Text className="text-white font-JakartaMedium ml-2">
            Sincronizar ({pendingSyncCount})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View className="px-5 pt-4 pb-2">
      <Text className="font-JakartaBold text-2xl text-gray-900 mb-2">
        Historial de Viajes
      </Text>

      {/* Stats section */}
      {cachedRides.length > 0 && (
        <View className="bg-gray-50 rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="font-Jakarta text-sm text-gray-600 mb-1">
                Total gastado
              </Text>
              <Text className="font-JakartaBold text-lg text-gray-900">
                ${getTotalSpent().toFixed(2)}
              </Text>
            </View>

            <View className="flex-1 items-center">
              <Text className="font-Jakarta text-sm text-gray-600 mb-1">
                Promedio calificación
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="font-JakartaBold text-lg text-gray-900 ml-1">
                  {getAverageRating().toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="flex-1 items-end">
              <Text className="font-Jakarta text-sm text-gray-600 mb-1">
                Viajes totales
              </Text>
              <Text className="font-JakartaBold text-lg text-gray-900">
                {cachedRides.length}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Connection status */}
      {!isOnline && (
        <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <View className="flex-row items-center">
            <Ionicons name="wifi-outline" size={20} color="#EA580C" />
            <Text className="font-JakartaMedium text-orange-800 ml-2">
              Modo offline - Viajes guardados localmente
            </Text>
          </View>

          {pendingSyncCount > 0 && (
            <Text className="font-Jakarta text-sm text-orange-700 mt-1">
              {pendingSyncCount} viaje(s) pendiente(s) de sincronización
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <OfflineBanner showDetails />

      <FlatList
        data={cachedRides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoadingCache}
            onRefresh={handleRefresh}
            colors={['#0286FF']}
            tintColor="#0286FF"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
      />
    </SafeAreaView>
  );
};

// Alternative compact version for use in other components
export const RidesOfflineList: React.FC<{
  limit?: number;
  onRidePress?: (rideId: number) => void;
  horizontal?: boolean;
}> = ({ limit = 5, onRidePress, horizontal = false }) => {
  const { cachedRides, isLoadingCache } = useRidesStore();
  const { isOnline } = useConnectivity();

  const recentRides = cachedRides.slice(0, limit);

  if (isLoadingCache) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <ActivityIndicator size="large" color="#0286FF" />
        <Text className="font-Jakarta text-gray-600 mt-2">
          Cargando viajes...
        </Text>
      </View>
    );
  }

  if (recentRides.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Ionicons name="car-outline" size={48} color="#9CA3AF" />
        <Text className="font-Jakarta text-gray-500 mt-2 text-center">
          {isOnline ? 'No tienes viajes recientes' : 'Viajes guardados offline'}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="font-JakartaBold text-lg text-gray-900 mb-3">
        Viajes Recientes
      </Text>

      <FlatList
        data={recentRides}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onRidePress?.(item.ride_id)}
            className="mb-3"
          >
            <RideCard
              ride={transformCachedRideToRide(item)}
              onPress={() => onRidePress?.(item.ride_id)}
              showStatus={true}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
