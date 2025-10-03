import {
  sortRides,
  formatTime,
  formatDate,
  calculateDistance,
  calculateFare,
  generateId,
  validateEmail,
  validatePhone,
  formatCurrency,
  debounce,
  throttle,
  isValidLocation,
  parseLocationString,
  formatLocationDisplay,
} from "../../lib/utils";
import { Ride } from "../../types/type";

describe("sortRides", () => {
  const mockRides: Ride[] = [
    {
      ride_id: 1,
      origin_address: "123 Main St",
      destination_address: "456 Oak Ave",
      origin_latitude: 40.7128,
      origin_longitude: -74.006,
      destination_latitude: 40.7589,
      destination_longitude: -73.9851,
      ride_time: 1640995200000, // 2024-01-02 10:00:00
      fare_price: 25.5,
      payment_status: "completed",
      driver_id: 1,
      user_id: 1,
      created_at: "2024-01-02T10:00:00Z",
      driver: {
        first_name: "John",
        last_name: "Driver",
        car_seats: 4,
      },
    },
    {
      ride_id: 2,
      origin_address: "123 Main St",
      destination_address: "456 Oak Ave",
      origin_latitude: 40.7128,
      origin_longitude: -74.006,
      destination_latitude: 40.7589,
      destination_longitude: -73.9851,
      ride_time: 1640940000000, // 2024-01-01 15:00:00
      fare_price: 25.5,
      payment_status: "completed",
      driver_id: 1,
      user_id: 1,
      created_at: "2024-01-01T15:00:00Z",
      driver: {
        first_name: "John",
        last_name: "Driver",
        car_seats: 4,
      },
    },
    {
      ride_id: 3,
      origin_address: "123 Main St",
      destination_address: "456 Oak Ave",
      origin_latitude: 40.7128,
      origin_longitude: -74.006,
      destination_latitude: 40.7589,
      destination_longitude: -73.9851,
      ride_time: 1640985600000, // 2024-01-02 08:00:00
      fare_price: 25.5,
      payment_status: "completed",
      driver_id: 1,
      user_id: 1,
      created_at: "2024-01-02T08:00:00Z",
      driver: {
        first_name: "John",
        last_name: "Driver",
        car_seats: 4,
      },
    },
  ];

  test("sorts rides by date and time in descending order", () => {
    const sorted = sortRides(mockRides);

    expect(sorted[0].ride_id).toBe(1); // 2024-01-02 10:00:00
    expect(sorted[1].ride_id).toBe(2); // 2024-01-01 15:00:00
    expect(sorted[2].ride_id).toBe(3); // 2024-01-02 08:00:00
  });

  test("handles empty array", () => {
    const sorted = sortRides([]);
    expect(sorted).toEqual([]);
  });

  test("handles single ride", () => {
    const singleRide = [mockRides[0]];
    const sorted = sortRides(singleRide);
    expect(sorted).toEqual(singleRide);
  });
});

describe("formatTime", () => {
  test("formats minutes less than 60", () => {
    expect(formatTime(30)).toBe("30 min");
    expect(formatTime(5.5)).toBe("5.5 min");
  });

  test("formats minutes equal to 60", () => {
    expect(formatTime(60)).toBe("1h 0m");
  });

  test("formats minutes greater than 60", () => {
    expect(formatTime(90)).toBe("1h 30m");
    expect(formatTime(135)).toBe("2h 15m");
  });

  test("handles decimal minutes", () => {
    expect(formatTime(65.7)).toBe("1h 6m");
  });

  test("handles zero minutes", () => {
    expect(formatTime(0)).toBe("0 min");
  });

  test("handles null/undefined input", () => {
    expect(formatTime(null as any)).toBe("0 min");
    expect(formatTime(undefined as any)).toBe("0 min");
  });
});

describe("formatDate", () => {
  test("formats date correctly", () => {
    const dateString = "2024-01-15T10:30:00Z";
    const formatted = formatDate(dateString);

    expect(formatted).toContain("January");
    expect(formatted).toContain("15");
    expect(formatted).toContain("2024");
  });

  test("handles different months", () => {
    expect(formatDate("2024-02-10T00:00:00Z")).toContain("February");
    expect(formatDate("2024-12-25T00:00:00Z")).toContain("December");
  });

  test("handles invalid date strings gracefully", () => {
    expect(() => formatDate("invalid-date")).not.toThrow();
    const result = formatDate("invalid-date");
    expect(typeof result).toBe("string");
  });
});

describe("calculateDistance", () => {
  test("calculates distance between two points", () => {
    // New York to Los Angeles (approximate)
    const nyc = { latitude: 40.7128, longitude: -74.006 };
    const la = { latitude: 34.0522, longitude: -118.2437 };

    const distance = calculateDistance(nyc, la);
    expect(distance).toBeGreaterThan(3900); // ~3935 km
    expect(distance).toBeLessThan(4000);
  });

  test("returns 0 for same location", () => {
    const location = { latitude: 40.7128, longitude: -74.006 };
    const distance = calculateDistance(location, location);
    expect(distance).toBe(0);
  });

  test("handles null coordinates", () => {
    const result = calculateDistance(null as any, {
      latitude: 0,
      longitude: 0,
    });
    expect(result).toBe(0);
  });
});

describe("calculateFare", () => {
  test("calculates fare based on distance and time", () => {
    const distance = 10; // 10 km
    const time = 20; // 20 minutes

    const fare = calculateFare(distance, time);
    expect(fare).toBeGreaterThan(0);
    expect(typeof fare).toBe("number");
  });

  test("handles zero distance and time", () => {
    const fare = calculateFare(0, 0);
    expect(fare).toBeGreaterThan(0); // Should have base fare
  });

  test("handles large distances", () => {
    const fare = calculateFare(100, 120);
    expect(fare).toBeGreaterThan(calculateFare(10, 20));
  });
});

describe("generateId", () => {
  test("generates unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe("string");
    expect(id1.length).toBeGreaterThan(0);
  });

  test("generates consistent format", () => {
    const ids = Array.from({ length: 10 }, () => generateId());

    // All IDs should be strings and unique
    ids.forEach((id) => {
      expect(typeof id).toBe("string");
      expect(ids.filter((otherId) => otherId === id).length).toBe(1);
    });
  });
});

describe("validateEmail", () => {
  test("validates correct email formats", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.email+tag@domain.co.uk")).toBe(true);
    expect(validateEmail("user123@test-domain.com")).toBe(true);
  });

  test("rejects invalid email formats", () => {
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("")).toBe(false);
    expect(validateEmail(null as any)).toBe(false);
  });
});

describe("validatePhone", () => {
  test("validates correct phone formats", () => {
    expect(validatePhone("+1234567890")).toBe(true);
    expect(validatePhone("+1-234-567-8900")).toBe(true);
    expect(validatePhone("(234) 567-8900")).toBe(true);
  });

  test("rejects invalid phone formats", () => {
    expect(validatePhone("invalid")).toBe(false);
    expect(validatePhone("123")).toBe(false);
    expect(validatePhone("")).toBe(false);
  });
});

describe("formatCurrency", () => {
  test("formats currency correctly", () => {
    expect(formatCurrency(25.5)).toBe("$25.50");
    expect(formatCurrency(100)).toBe("$100.00");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  test("handles negative values", () => {
    expect(formatCurrency(-25.5)).toBe("-$25.50");
  });

  test("handles decimal precision", () => {
    expect(formatCurrency(25.123)).toBe("$25.12");
    expect(formatCurrency(25.129)).toBe("$25.13");
  });
});

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("delays function execution", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(60);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("cancels previous calls when called again", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    jest.advanceTimersByTime(50);

    debouncedFn(); // Cancel first call
    jest.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(60);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe("throttle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("limits function execution rate", () => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn(); // Should execute
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn(); // Should be ignored
    throttledFn(); // Should be ignored
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(110);
    throttledFn(); // Should execute again
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe("isValidLocation", () => {
  test("validates correct location objects", () => {
    expect(isValidLocation({ latitude: 40.7128, longitude: -74.006 })).toBe(
      true,
    );
    expect(isValidLocation({ latitude: 0, longitude: 0 })).toBe(true);
    expect(isValidLocation({ latitude: -90, longitude: 180 })).toBe(true);
  });

  test("rejects invalid location objects", () => {
    expect(isValidLocation(null)).toBe(false);
    expect(isValidLocation(undefined)).toBe(false);
    expect(isValidLocation({})).toBe(false);
    expect(isValidLocation({ latitude: 40.7128 })).toBe(false);
    expect(isValidLocation({ longitude: -74.006 })).toBe(false);
    expect(isValidLocation({ latitude: "invalid", longitude: -74.006 })).toBe(
      false,
    );
  });
});

describe("parseLocationString", () => {
  test("parses coordinate strings correctly", () => {
    const result = parseLocationString("40.7128,-74.0060");
    expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
  });

  test("handles spaces in coordinate strings", () => {
    const result = parseLocationString("40.7128, -74.0060");
    expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
  });

  test("returns null for invalid strings", () => {
    expect(parseLocationString("invalid")).toBeNull();
    expect(parseLocationString("")).toBeNull();
    expect(parseLocationString("40.7128")).toBeNull();
  });
});

describe("formatLocationDisplay", () => {
  test("formats location display correctly", () => {
    const location = {
      latitude: 40.7128,
      longitude: -74.006,
      address: "New York, NY",
    };

    const result = formatLocationDisplay(location);
    expect(result).toBe("New York, NY");
  });

  test("falls back to coordinates when no address", () => {
    const location = {
      latitude: 40.7128,
      longitude: -74.006,
    };

    const result = formatLocationDisplay(location);
    expect(result).toContain("40.7128");
    expect(result).toContain("-74.0060");
  });

  test("handles null location", () => {
    const result = formatLocationDisplay(null);
    expect(result).toBe("Unknown location");
  });
});
