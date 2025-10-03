import { Ride } from "@/types/type";

export function cn(
  ...inputs: Array<string | null | undefined | false>
): string {
  return inputs.filter(Boolean).join(" ");
}

export const sortRides = (rides: Ride[]): Ride[] => {
  const result = rides.sort((a, b) => {
    const dateA = new Date(`${a.created_at}T${a.ride_time}`);
    const dateB = new Date(`${b.created_at}T${b.ride_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return result.reverse();
};

export function formatTime(minutes: number): string {
  const formattedMinutes = +minutes?.toFixed(1) || 0;

  console.log("[formatTime] Formatting:", {
    input: minutes,
    formatted: formattedMinutes,
    result:
      formattedMinutes < 60
        ? `${formattedMinutes} min`
        : `${Math.floor(formattedMinutes / 60)}h ${(formattedMinutes % 60).toFixed(0)}m`,
  });

  if (formattedMinutes < 60) {
    return `${formattedMinutes} min`;
  } else {
    const hours = Math.floor(formattedMinutes / 60);
    const remainingMinutes = formattedMinutes % 60;
    return `${hours}h ${remainingMinutes.toFixed(0)}m`;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day < 10 ? "0" + day : day} ${month} ${year}`;
}

// Idempotency-Key helper
export function generateIdempotencyKey(): string {
  // Simple RFC4122 v4-like generator
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

// Transform ride data from camelCase (backend) to snake_case (frontend)
export function transformRideData(item: any) {
  return {
    ride_id: item.rideId || item.ride_id,
    origin_address: item.originAddress || item.origin_address,
    destination_address: item.destinationAddress || item.destination_address,
    origin_latitude: item.originLatitude || item.origin_latitude,
    origin_longitude: item.originLongitude || item.origin_longitude,
    destination_latitude: item.destinationLatitude || item.destination_latitude,
    destination_longitude:
      item.destinationLongitude || item.destination_longitude,
    ride_time: item.rideTime || item.ride_time,
    fare_price: item.farePrice || item.fare_price,
    payment_status: item.paymentStatus || item.payment_status,
    driver_id: item.driverId || item.driver_id,
    user_id: item.userId || item.user_id,
    tier_id: item.tierId || item.tier_id,
    created_at: item.createdAt || item.created_at,
    driver: item.driver
      ? {
          first_name: item.driver.firstName || item.driver.first_name || "",
          last_name: item.driver.lastName || item.driver.last_name || "",
          car_seats: item.driver.carSeats || item.driver.car_seats || 4,
        }
      : {
          first_name: "",
          last_name: "",
          car_seats: 4,
        },
  };
}

// Additional utility functions for tests
export function calculateDistance(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number },
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateFare(distance: number, time: number): number {
  const baseFare = 2.5;
  const perKmRate = 1.5;
  const perMinuteRate = 0.25;
  return baseFare + distance * perKmRate + time * perMinuteRate;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function isValidLocation(location: any): boolean {
  return (
    location &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number" &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

export function parseLocationString(
  locationString: string,
): { latitude: number; longitude: number } | null {
  const match = locationString.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
  if (match) {
    const [, lat, lng] = match;
    return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
  }
  return null;
}

export function formatLocationDisplay(location: any): string {
  if (!location) return "Unknown location";
  if (location.address) return location.address;
  if (location.latitude && location.longitude) {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }
  return "Unknown location";
}
