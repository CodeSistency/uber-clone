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
} from "react-native";

import { icons } from "@/constants";
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

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY || "AIzaSyC4o0Jqu8FvUxqn2Xw2UVU2oDn2e2uvdG8";
const googleMapsApiKey = "AIzaSyC4o0Jqu8FvUxqn2Xw2UvU2oDn2e2uvdG8"; // From app.json

// Use environment variable if available, otherwise use app.json key
const apiKeyToUse = googlePlacesApiKey || googleMapsApiKey;

// Debug environment variables (only once)
const globalAny = global as any;
if (!globalAny.googlePlacesLogged) {
  console.log("[GoogleTextInput] 🔑 API Keys Check:", {
    PLACES_API_KEY_ENV: googlePlacesApiKey
      ? `EXISTS (length: ${googlePlacesApiKey.length})`
      : "MISSING",
    GOOGLE_MAPS_API_KEY_APP_JSON: googleMapsApiKey
      ? `EXISTS (length: ${googleMapsApiKey.length})`
      : "MISSING",
    DIRECTIONS_API_KEY: process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY || "AIzaSyC4o0Jqu8FvUxqn2Xw2UVU2oDn2e2uvdG8"
      ? "EXISTS"
      : "MISSING",
    USING_KEY: apiKeyToUse
      ? `USING: ${apiKeyToUse.substring(0, 10)}...`
      : "NO KEY AVAILABLE",
  });
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
  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchRef = useRef<string>("");

  // Only log mount once per component instance
  React.useEffect(() => {
    console.log(
      "[GoogleTextInput] 🚀 Component mounted at:",
      new Date().toISOString(),
    );

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Additional validation
  if (!apiKeyToUse) {
    console.error(
      "[GoogleTextInput] ❌ NO API KEY AVAILABLE! Check your .env file or app.json",
    );
  }

  if (typeof handlePress !== "function") {
    console.error("[GoogleTextInput] ❌ handlePress is not a function!", {
      handlePress,
    });
  }

  // Test API key format
  if (apiKeyToUse && !apiKeyToUse.startsWith("AIza")) {
    console.warn(
      "[GoogleTextInput] ⚠️ API key doesn't start with 'AIza'. This might be invalid.",
    );
  }

  const searchPlaces = async (searchQuery: string) => {
    if (
      !searchQuery ||
      searchQuery.length < 2 ||
      searchQuery === lastSearchRef.current
    ) {
      return;
    }

    console.log("[GoogleTextInput] 🔍 Searching for places with query:", {
      query: searchQuery,
      apiKey: apiKeyToUse ? "SET" : "NOT_SET",
    });

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

      console.log("[GoogleTextInput] 🌐 API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
      });

      const data: PlacesApiResponse = await response.json();
      console.log("[GoogleTextInput] 📡 API Response:", {
        status: data.status,
        predictionsCount: data.predictions?.length || 0,
        errorMessage: data.error_message,
        fullResponse: data,
      });

      if (data.status === "OK" && data.predictions) {
        setResults(data.predictions.slice(0, 5)); // Limit to 5 results
        setShowResults(true);
      } else {
        console.warn(
          "[GoogleTextInput] ⚠️ API returned non-OK status:",
          data.status,
        );
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("[GoogleTextInput] ❌ Error searching places:", error);
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = async (place: PlaceResult) => {
    console.log("[GoogleTextInput] 🎯 Place selected:", place);

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
      console.log("[GoogleTextInput] 📍 Place details:", {
        status: detailsData.status,
        hasGeometry: !!detailsData.result?.geometry,
      });

      if (
        detailsData.status === "OK" &&
        detailsData.result?.geometry?.location
      ) {
        const locationData = {
          latitude: detailsData.result.geometry.location.lat,
          longitude: detailsData.result.geometry.location.lng,
          address: place.description,
        };

        console.log(
          "[GoogleTextInput] 📍 Calling handlePress with:",
          locationData,
        );

        try {
          handlePress(locationData);
          console.log("[GoogleTextInput] ✅ handlePress called successfully");

          // Clear results and hide dropdown
          setQuery(place.description);
          setResults([]);
          setShowResults(false);
          inputRef.current?.blur();
        } catch (error) {
          console.error(
            "[GoogleTextInput] ❌ Error calling handlePress:",
            error,
          );
        }
      } else {
        console.error(
          "[GoogleTextInput] ❌ No geometry found in place details",
        );
      }
    } catch (error) {
      console.error("[GoogleTextInput] ❌ Error getting place details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    console.log("[GoogleTextInput] ✏️ Text changed:", text);
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

  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow-md flex-1">
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
          className="flex-1 text-base font-JakartaSemiBold"
          onFocus={() => {
            console.log("[GoogleTextInput] 🎯 Input focused");
            setShowResults(true);
          }}
          onBlur={() => {
            console.log("[GoogleTextInput] 👀 Input blurred");
            // Delay hiding results to allow selection
            setTimeout(() => setShowResults(false), 200);
          }}
        />

        {loading && (
          <ActivityIndicator size="small" color="#000" className="ml-2" />
        )}
      </View>

      {showResults && results.length > 0 && (
        <View
          className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-lg z-50 max-h-60 border border-gray-200"
          style={{ elevation: 10 }}
        >
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id}
            renderItem={renderResultItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

export default GoogleTextInput;
