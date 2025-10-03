// Dummy data for delivery mode functionality

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: number;
  location: {
    latitude: number;
    longitude: number;
  };
  image: string;
  isOpen: boolean;
}

// Dummy restaurants data - simulating API response
export const DUMMY_RESTAURANTS: Restaurant[] = [
  {
    id: "rest_001",
    name: "Mario's Pizza",
    category: "Italian",
    rating: 4.7,
    reviewCount: 284,
    deliveryTime: "25-35 min",
    deliveryFee: 2.99,
    distance: 1.2,
    location: {
      latitude: 40.7128, // Approximate NYC coordinates
      longitude: -74.006,
    },
    image: "🍕",
    isOpen: true,
  },
  {
    id: "rest_002",
    name: "Burger Palace",
    category: "American",
    rating: 4.5,
    reviewCount: 156,
    deliveryTime: "20-30 min",
    deliveryFee: 1.99,
    distance: 0.8,
    location: {
      latitude: 40.7135,
      longitude: -74.0055,
    },
    image: "🍔",
    isOpen: true,
  },
  {
    id: "rest_003",
    name: "Green Cafe",
    category: "Healthy",
    rating: 4.8,
    reviewCount: 203,
    deliveryTime: "30-40 min",
    deliveryFee: 0.99,
    distance: 1.5,
    location: {
      latitude: 40.712,
      longitude: -74.007,
    },
    image: "🥗",
    isOpen: true,
  },
  {
    id: "rest_004",
    name: "Sushi Express",
    category: "Japanese",
    rating: 4.6,
    reviewCount: 189,
    deliveryTime: "15-25 min",
    deliveryFee: 3.49,
    distance: 2.1,
    location: {
      latitude: 40.7115,
      longitude: -74.0045,
    },
    image: "🍱",
    isOpen: true,
  },
  {
    id: "rest_005",
    name: "Taco Fiesta",
    category: "Mexican",
    rating: 4.4,
    reviewCount: 127,
    deliveryTime: "20-30 min",
    deliveryFee: 2.49,
    distance: 1.8,
    location: {
      latitude: 40.7138,
      longitude: -74.0075,
    },
    image: "🌮",
    isOpen: false,
  },
  {
    id: "rest_006",
    name: "Fresh Market",
    category: "Groceries",
    rating: 4.3,
    reviewCount: 98,
    deliveryTime: "25-35 min",
    deliveryFee: 1.49,
    distance: 2.5,
    location: {
      latitude: 40.7123,
      longitude: -74.0035,
    },
    image: "🛒",
    isOpen: true,
  },
];

// Function to simulate API call delay
export const loadNearbyRestaurants = async (): Promise<Restaurant[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return DUMMY_RESTAURANTS;
};

// Get restaurants by category
export const getRestaurantsByCategory = (category: string): Restaurant[] => {
  if (category === "all") return DUMMY_RESTAURANTS;
  return DUMMY_RESTAURANTS.filter(
    (restaurant) =>
      restaurant.category.toLowerCase() === category.toLowerCase(),
  );
};

// Quick access categories for delivery mode
export const DELIVERY_CATEGORIES = [
  {
    id: "pizza",
    name: "Pizza",
    icon: "🍕",
    count: DUMMY_RESTAURANTS.filter((r) => r.category === "Italian").length,
  },
  {
    id: "burgers",
    name: "Burgers",
    icon: "🍔",
    count: DUMMY_RESTAURANTS.filter((r) => r.category === "American").length,
  },
  {
    id: "healthy",
    name: "Healthy",
    icon: "🥗",
    count: DUMMY_RESTAURANTS.filter((r) => r.category === "Healthy").length,
  },
];

// Transport mode quick access (existing functionality)
export const TRANSPORT_QUICK_ACCESS = [
  {
    id: "home",
    name: "Home",
    icon: "🏠",
    action: "navigate_to_home",
  },
  {
    id: "work",
    name: "Work",
    icon: "💼",
    action: "navigate_to_work",
  },
  {
    id: "mall",
    name: "Mall",
    icon: "🛒",
    action: "navigate_to_mall",
  },
];
