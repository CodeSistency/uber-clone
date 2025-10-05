import React, { useState, useRef } from "react";
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
  
  globalAny.googlePlacesLogged = true;
}

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchRef = useRef<string>("");

  // Only log mount once per component instance
  React.useEffect(() => {
    

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Update dropdown position when showResults changes
  React.useEffect(() => {
    if (showResults) {
      setTimeout(updateDropdownPosition, 50);
    }
  }, [showResults]);

  // Additional validation
  if (!apiKeyToUse) {
    
  }

  if (typeof handlePress !== "function") {
    
  }

  // Test API key format
  if (apiKeyToUse && !apiKeyToUse.startsWith("AIza")) {
    
  }

  const searchPlaces = async (searchQuery: string) => {
    if (
      !searchQuery ||
      searchQuery.length < 2 ||
      searchQuery === lastSearchRef.current
    ) {
      return;
    }

    

    lastSearchRef.current = searchQuery;
    setLoading(true);
    try {
      // Build URL with proper parameters
      const params = new URLSearchParams({
        input: searchQuery,
        key: apiKeyToUse,
        components: "country:ve",
      });

      const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;

      

      const response = await fetch(apiUrl, {
        method: "GET",
      });

      const data: PlacesApiResponse = await response.json();
      

      if (data.status === "OK" && data.predictions) {
        setResults(data.predictions.slice(0, 5)); // Limit to 5 results
        setShowResults(true);
        // Update position when results change
        setTimeout(updateDropdownPosition, 100);
      } else {
        
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = async (place: PlaceResult) => {
    

    setLoading(true);
    try {
      // Get place details
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${apiKeyToUse}&fields=geometry,formatted_address`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const detailsData = await detailsResponse.json();
      

      if (
        detailsData.status === "OK" &&
        detailsData.result?.geometry?.location
      ) {
        const locationData = {
          latitude: detailsData.result.geometry.location.lat,
          longitude: detailsData.result.geometry.location.lng,
          address: place.description,
        };

        

        try {
          handlePress(locationData);
          

          // Clear results and hide dropdown
          setQuery(place.description);
          setResults([]);
          setShowResults(false);
          inputRef.current?.blur();
        } catch (error) {
          
        }
      } else {
        
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    
    setQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Clear previous results if text is too short
    if (text.length < 2) {
      setResults([]);
      setShowResults(false);
      lastSearchRef.current = "";
      return;
    }

    // Debounce search - only search if text changed and is different from last search
    if (text !== lastSearchRef.current) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(text);
        lastSearchRef.current = text;
      }, 300);
    }
  };

  const renderResultItem = ({ item }: { item: PlaceResult }) => (
    <TouchableOpacity
      className="flex-row items-center p-3 border-b border-gray-200 bg-white"
      onPress={() => handlePlaceSelect(item)}
    >
      <View className="w-5 h-5 mr-3 justify-center items-center">
        <Image source={icons.pin} className="w-4 h-4" resizeMode="contain" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-JakartaMedium text-gray-900">
          {item.structured_formatting?.main_text ||
            item.description.split(",")[0]}
        </Text>
        {item.structured_formatting?.secondary_text && (
          <Text className="text-xs font-JakartaRegular text-gray-500">
            {item.structured_formatting.secondary_text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const updateDropdownPosition = () => {
    if (containerRef.current) {
      containerRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setDropdownPosition({
            top: y + height + 5,
            left: x,
            width: width,
          });
        },
      );
    }
  };

  const handleFocus = () => {
    
    updateDropdownPosition();
    setShowResults(true);
  };

  return (
    <>
      <View
        ref={containerRef}
        className={`flex flex-row items-center justify-center rounded-xl ${containerStyle}`}
      >
        <View className="flex-row items-center bg-white dark:bg-brand-primary rounded-full px-4 py-2 shadow-md flex-1">
          {icon && (
            <View className="justify-center items-center w-6 h-6 mr-2">
              <Image
                source={icon ? icon : icons.search}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </View>
          )}

          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleTextChange}
            placeholder={initialLocation ?? "Where do you want to go?"}
            placeholderTextColor="gray"
            className="flex-1 text-base font-JakartaSemiBold text-black dark:text-white"
            onFocus={handleFocus}
            onBlur={() => {
              
              // Delay hiding results to allow selection
              setTimeout(() => setShowResults(false), 200);
            }}
          />

          {loading && (
            <ActivityIndicator size="small" color="#000" className="ml-2" />
          )}
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

export default GoogleTextInput;
