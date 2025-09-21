import { LatLng } from 'react-native-maps';

export interface RouteResult {
  polyline: LatLng[];
  distanceText?: string;
  durationText?: string;
  firstInstruction?: string;
}

export const decodePolyline = (encoded: string): LatLng[] => {
  const points: LatLng[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1; lat += deltaLat;
    shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1; lng += deltaLng;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
};

export const getRoute = async (origin: LatLng, destination: LatLng): Promise<RouteResult> => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;
    if (!apiKey) {
      return { polyline: [origin, destination] };
    }
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === 'OK' && json.routes?.[0]) {
      const points = json.routes[0].overview_polyline.points;
      const leg = json.routes[0].legs?.[0];
      return {
        polyline: decodePolyline(points),
        distanceText: leg?.distance?.text,
        durationText: leg?.duration?.text,
        firstInstruction: leg?.steps?.[0]?.html_instructions?.replace(/<[^>]*>?/gm, '')
      };
    }
    return { polyline: [origin, destination] };
  } catch {
    return { polyline: [origin, destination] };
  }
};


