// Servicio para integración con Google Maps Distance Matrix API

export interface RouteCalculation {
  distanceMiles: number;
  durationMinutes: number;
  rawResponse: any;
}

export interface GoogleMapsError {
  status: string;
  message: string;
}

/**
 * Calcula distancia y tiempo entre dos puntos usando Google Maps Distance Matrix API
 */
export async function calculateRouteDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  apiKey?: string,
): Promise<RouteCalculation> {
  // Get API key from environment or parameter
  const googleMapsApiKey = apiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC4o0Jqu8FvUxqn2Xw2UVU2oDn2e2uvdG8';

  if (!googleMapsApiKey) {
    throw new Error('Google Maps API key not configured');
  }

  // Build the API URL
  const baseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const params = new URLSearchParams({
    origins: `${origin.lat},${origin.lng}`,
    destinations: `${destination.lat},${destination.lng}`,
    key: googleMapsApiKey,
    units: 'imperial', // Use imperial for miles
  });

  const url = `${baseUrl}?${params.toString()}`;

  

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.status !== 'OK') {
      const error: GoogleMapsError = {
        status: data.status,
        message: data.error_message || `Google Maps API error: ${data.status}`,
      };
      throw error;
    }

    // Extract the route information
    const element = data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== 'OK') {
      throw new Error('No route found between the specified points');
    }

    // Convert units
    const distanceInMiles = element.distance.value * 0.000621371; // meters to miles
    const durationInMinutes = Math.ceil(element.duration.value / 60); // seconds to minutes

    const result: RouteCalculation = {
      distanceMiles: distanceInMiles,
      durationMinutes: durationInMinutes,
      rawResponse: data,
    };

    

    return result;

  } catch (error) {
    

    // Type guard for GoogleMapsError
    if (error && typeof error === 'object' && 'status' in error) {
      // It's a Google Maps API error
      throw error;
    }

    // It's a network or other error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to calculate route: ${errorMessage}`);
  }
}

/**
 * Valida si una API key de Google Maps es válida (haciendo una llamada de prueba)
 */
export async function validateGoogleMapsApiKey(apiKey: string): Promise<boolean> {
  try {
    // Use a simple test route (Google HQ to Apple HQ)
    await calculateRouteDistance(
      { lat: 37.7749, lng: -122.4194 }, // San Francisco (approx Google HQ)
      { lat: 37.3382, lng: -122.0453 }, // Cupertino (Apple HQ)
      apiKey
    );
    return true;
  } catch (error) {
    
    return false;
  }
}
