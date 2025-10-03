import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Text,
  Platform,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";

import { icons } from "@/constants";
import { endpoints } from "@/lib/endpoints";
import { GoogleInputProps } from "@/types/type";
import {
  criticalDataCache,
  CachedLocation,
} from "@/lib/cache/CriticalDataCache";
import { useConnectivity } from "@/hooks/useConnectivity";

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlacesApiResponse {
  predictions?: PlaceResult[];
  status: string;
  error_message?: string;
}

// Get API keys from centralized endpoint system
const googlePlacesApiKey = endpoints.googleMaps.apiKey.places();
const googleDirectionsApiKey = endpoints.googleMaps.apiKey.directions();

// Use the centralized endpoint system
const apiKeyToUse = googlePlacesApiKey;

// Debug environment variables (only once)
const globalAny = global as any;
if (!globalAny.googlePlacesLogged) {
  console.log("[GoogleTextInputHybrid] 🔑 API Keys Check:", {
    PLACES_API_KEY: googlePlacesApiKey
      ? `EXISTS (length: ${googlePlacesApiKey.length})`
      : "MISSING",
    DIRECTIONS_API_KEY: googleDirectionsApiKey
      ? `EXISTS (length: ${googleDirectionsApiKey.length})`
      : "MISSING",
  });
  globalAny.googlePlacesLogged = true;
}

interface GoogleTextInputHybridProps extends GoogleInputProps {
  enableOfflineCache?: boolean;
  maxOfflineResults?: number;
  showOfflineIndicator?: boolean;
}

const GoogleTextInputHybrid: React.FC<GoogleTextInputHybridProps> = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
  enableOfflineCache = true,
  maxOfflineResults = 5,
  showOfflineIndicator = true,
  ...props
}) => {
  const [location, setLocation] = useState(initialLocation || "");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Offline functionality
  const [offlineResults, setOfflineResults] = useState<CachedLocation[]>([]);
  const [usingOffline, setUsingOffline] = useState(false);
  const { isOnline, isFeatureAvailable } = useConnectivity();

  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);

  // Load offline cache when component mounts
  useEffect(() => {
    if (enableOfflineCache) {
      loadOfflineCache();
    }
  }, [enableOfflineCache]);

  const loadOfflineCache = async () => {
    try {
      const cachedLocations =
        await criticalDataCache.getCachedLocations(maxOfflineResults);
      setOfflineResults(cachedLocations);
    } catch (error) {
      console.error(
        "[GoogleTextInputHybrid] Failed to load offline cache:",
        error,
      );
    }
  };

  const searchPlaces = async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);

    try {
      // Try online search first if connected
      if (isOnline && isFeatureAvailable("maps")) {
        const onlineResults = await performOnlineSearch(text);
        setResults(onlineResults);
        setUsingOffline(false);
      } else {
        // Fallback to offline search
        const offlineResults = await performOfflineSearch(text);
        setResults(
          offlineResults.map((loc) => ({
            place_id: loc.id,
            description: loc.address,
            structured_formatting: {
              main_text: loc.address,
              secondary_text: loc.formattedAddress,
            },
          })),
        );
        setUsingOffline(true);
      }

      setShowResults(true);
    } catch (error) {
      console.error("[GoogleTextInputHybrid] Search failed:", error);

      // Fallback to offline if online fails
      if (offlineResults.length > 0) {
        const offlineResults = await performOfflineSearch(text);
        setResults(
          offlineResults.map((loc) => ({
            place_id: loc.id,
            description: loc.address,
            structured_formatting: {
              main_text: loc.address,
              secondary_text: loc.formattedAddress,
            },
          })),
        );
        setUsingOffline(true);
        setShowResults(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const performOnlineSearch = async (text: string): Promise<PlaceResult[]> => {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${apiKeyToUse}&components=country:co`;

    const response = await fetch(url);
    const data: PlacesApiResponse = await response.json();

    if (data.status === "OK" && data.predictions) {
      return data.predictions;
    }

    throw new Error(data.error_message || "Failed to fetch places");
  };

  const performOfflineSearch = async (
    text: string,
  ): Promise<CachedLocation[]> => {
    try {
      const results = await criticalDataCache.searchLocations(text);
      return results.slice(0, maxOfflineResults);
    } catch (error) {
      console.error("[GoogleTextInputHybrid] Offline search failed:", error);
      return [];
    }
  };

  const onChangeText = (text: string) => {
    setLocation(text);

    // Debounced search
    const timeoutId = setTimeout(() => {
      searchPlaces(text);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleResultSelect = async (result: PlaceResult) => {
    setLocation(result.description);
    setShowResults(false);

    try {
      // Get detailed place information
      let latitude = 0;
      let longitude = 0;
      let formattedAddress = result.description;

      if (usingOffline) {
        // Get from cache
        const cachedLocation = offlineResults.find(
          (loc) => loc.id === result.place_id,
        );
        if (cachedLocation) {
          latitude = cachedLocation.latitude;
          longitude = cachedLocation.longitude;
          formattedAddress = cachedLocation.formattedAddress;
        }
      } else {
        // Get from Google Places API
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&key=${apiKeyToUse}&fields=geometry,formatted_address`;

        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status === "OK" && detailsData.result) {
          const location = detailsData.result.geometry?.location;
          if (location) {
            latitude = location.lat;
            longitude = location.lng;
          }
          formattedAddress =
            detailsData.result.formatted_address || result.description;
        }
      }

      // Cache the location for future offline use
      if (enableOfflineCache) {
        await criticalDataCache.cacheLocation({
          latitude,
          longitude,
          address: result.description,
          formattedAddress,
          placeId: result.place_id,
          source: "search",
        });
      }

      // Call the original handler
      handlePress({
        latitude,
        longitude,
        address: formattedAddress,
      });
    } catch (error) {
      console.error(
        "[GoogleTextInputHybrid] Failed to get place details:",
        error,
      );
      // Still call handler with basic info
      handlePress({
        latitude: 0,
        longitude: 0,
        address: result.description,
      });
    }
  };

  const getDropdownPosition = () => {
    if (containerRef.current) {
      containerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height,
          left: pageX,
          width: width,
        });
      });
    }
  };

  const renderResultItem = ({ item }: { item: PlaceResult }) => (
    <TouchableOpacity
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
      }}
      onPress={() => handleResultSelect(item)}
    >
      <Text className="font-Jakarta text-base text-gray-900">
        {item.structured_formatting?.main_text || item.description}
      </Text>
      {item.structured_formatting?.secondary_text && (
        <Text className="font-Jakarta text-sm text-gray-500 mt-1">
          {item.structured_formatting.secondary_text}
        </Text>
      )}
      {usingOffline && (
        <Text className="font-Jakarta text-xs text-blue-600 mt-1">
          Desde cache local
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderOfflineIndicator = () => {
    if (!showOfflineIndicator || isOnline) return null;

    return (
      <View className="flex-row items-center bg-orange-50 px-3 py-1 rounded-full">
        <Image
          source={icons.target}
          className="w-4 h-4 mr-1"
          tintColor="#EA580C"
        />
        <Text className="font-Jakarta text-xs text-orange-700">
          Modo offline
        </Text>
      </View>
    );
  };

  return (
    <>
      <View ref={containerRef} className={`relative ${containerStyle}`}>
        <View
          className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-full border border-neutral-100 focus:border-primary-500 ${containerStyle}`}
          style={{
            backgroundColor: textInputBackgroundColor,
          }}
        >
          {icon && (
            <Image
              source={icon as any}
              className="w-6 h-6 ml-4"
              style={{ tintColor: "#6B7280" }}
            />
          )}

          <TextInput
            ref={inputRef}
            className="rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1"
            value={location}
            onChangeText={onChangeText}
            placeholder="Buscar lugar..."
            placeholderTextColor="#9CA3AF"
            onFocus={() => {
              getDropdownPosition();
              if (location.trim()) {
                searchPlaces(location);
              }
            }}
            onBlur={() => {
              // Delay hiding to allow selection
              setTimeout(() => setShowResults(false), 200);
            }}
            {...props}
          />

          {loading && (
            <ActivityIndicator
              size="small"
              color="#0286FF"
              style={{ marginRight: 16 }}
            />
          )}

          {renderOfflineIndicator()}
        </View>
      </View>

      {/* Modal para resultados - renderizado fuera del ScrollView */}
      <Modal
        visible={showResults && results.length > 0}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowResults(false)}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
          }}
          activeOpacity={1}
          onPress={() => setShowResults(false)}
        >
          <View
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: 200,
              backgroundColor: "white",
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 1000,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <FlatList
              data={results}
              keyExtractor={(item) => item.place_id}
              renderItem={renderResultItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 200 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// Hook for easy integration
export const useGoogleTextInputHybrid = (props: GoogleTextInputHybridProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setSelectedLocation(location);
    props.handlePress?.(location);
  };

  return {
    selectedLocation,
    GoogleTextInputComponent: (
      <GoogleTextInputHybrid {...props} handlePress={handleLocationSelect} />
    ),
  };
};

export default GoogleTextInputHybrid;
