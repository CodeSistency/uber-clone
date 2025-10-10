export interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  carImageUrl: string;
  carSeats: number;
  rating: number;
}

export interface DriverWithLocation extends Driver {
  latitude: number;
  longitude: number;
}
