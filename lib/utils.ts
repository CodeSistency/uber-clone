import { Ride } from "@/types/type";

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
    result: formattedMinutes < 60 ? `${formattedMinutes} min` : `${Math.floor(formattedMinutes / 60)}h ${(formattedMinutes % 60).toFixed(0)}m`
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
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
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
    destination_longitude: item.destinationLongitude || item.destination_longitude,
    ride_time: item.rideTime || item.ride_time,
    fare_price: item.farePrice || item.fare_price,
    payment_status: item.paymentStatus || item.payment_status,
    driver_id: item.driverId || item.driver_id,
    user_id: item.userId || item.user_id,
    tier_id: item.tierId || item.tier_id,
    created_at: item.createdAt || item.created_at,
    driver: item.driver ? {
      first_name: item.driver.firstName || item.driver.first_name || '',
      last_name: item.driver.lastName || item.driver.last_name || '',
      car_seats: item.driver.carSeats || item.driver.car_seats || 4,
    } : {
      first_name: '',
      last_name: '',
      car_seats: 4,
    },
  };
}
