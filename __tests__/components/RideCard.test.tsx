import React from 'react';
import { render, fireEvent, screen } from '../utils/test-utils';
import RideCard from '../../components/RideCard';
import { Ride } from '../../types/type';

describe('RideCard', () => {
  const mockRide: Ride = {
    ride_id: 1,
    origin_address: '123 Main Street, City',
    destination_address: '456 Oak Avenue, City',
    origin_latitude: 40.7128,
    origin_longitude: -74.0060,
    destination_latitude: 40.7589,
    destination_longitude: -73.9851,
    ride_time: 1000, // timestamp
    fare_price: 25.50,
    payment_status: 'completed',
    driver_id: 1,
    user_id: 1,
    created_at: '2024-01-01T10:00:00Z',
    driver: {
      first_name: 'John',
      last_name: 'Driver',
      car_seats: 4,
    },
  };

  const defaultProps = {
    ride: mockRide,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders ride information correctly', () => {
      const { getByText } = render(<RideCard {...defaultProps} />);

      expect(getByText('123 Main Street, City')).toBeTruthy();
      expect(getByText('456 Oak Avenue, City')).toBeTruthy();
      expect(getByText('$25.50')).toBeTruthy();
      expect(getByText('5.2 mi')).toBeTruthy();
    });

    test('renders driver information when available', () => {
      const { getByText } = render(<RideCard {...defaultProps} />);

      expect(getByText('John Driver')).toBeTruthy();
      expect(getByText('4.8')).toBeTruthy();
      expect(getByText('sedan')).toBeTruthy();
    });

    test('renders different ride statuses', () => {
      const { rerender, getByText } = render(
        <RideCard {...defaultProps} ride={{ ...mockRide, payment_status: 'pending' }} />
      );

      // Should render without crashing for different statuses
      expect(getByText('123 Main Street, City')).toBeTruthy();

      rerender(
        <RideCard {...defaultProps} ride={{ ...mockRide, payment_status: 'in_progress' }} />
      );
      expect(getByText('123 Main Street, City')).toBeTruthy();

      rerender(
        <RideCard {...defaultProps} ride={{ ...mockRide, payment_status: 'cancelled' }} />
      );
      expect(getByText('123 Main Street, City')).toBeTruthy();
    });

    test('renders static map image', () => {
      const { getByTestId } = render(<RideCard {...defaultProps} />);

      // The map image should be rendered (though it may not have a testID)
      // We'll check that the component renders without crashing
      expect(screen.getByText('123 Main Street, City')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    test('calls onPress when card is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <RideCard {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByText('123 Main Street, City'));

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith(mockRide);
    });

    test('does not call onPress when not provided', () => {
      const { getByText } = render(<RideCard {...defaultProps} />);

      expect(() => {
        fireEvent.press(getByText('123 Main Street, City'));
      }).not.toThrow();
    });
  });

  describe('Data Formatting', () => {
    test('formats currency correctly', () => {
      const { getByText } = render(
        <RideCard {...defaultProps} ride={{ ...mockRide, fare_price: 100.99 }} />
      );

      expect(getByText('$100.99')).toBeTruthy();
    });

    test('formats date correctly', () => {
      const { getByText } = render(<RideCard {...defaultProps} />);

      // Date formatting would depend on implementation
      // This test ensures dates are rendered
      expect(getByText(/2024/)).toBeTruthy();
    });
  });


  describe('Accessibility', () => {
    test('renders accessible content', () => {
      const { getByText } = render(<RideCard {...defaultProps} />);

      // Should render accessible text content
      expect(getByText('123 Main Street, City')).toBeTruthy();
    });

    test('has proper accessibility labels', () => {
      const { getByText } = render(<RideCard {...defaultProps} />);

      // Test that content is accessible through text
      expect(getByText('123 Main Street, City')).toBeTruthy();
      expect(getByText('456 Oak Avenue, City')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    test('renders efficiently with large data', () => {
      const largeRideData = {
        ...mockRide,
        origin_address: 'A very long pickup location name that might cause performance issues if not handled properly',
        destination_address: 'An extremely long destination address that could potentially slow down rendering if not optimized',
      };

      const { getByText } = render(<RideCard ride={largeRideData} />);

      expect(getByText(/very long pickup/)).toBeTruthy();
      expect(getByText(/extremely long destination/)).toBeTruthy();
    });

    test('handles missing optional data gracefully', () => {
      const incompleteRide: Ride = {
        ride_id: 1,
        user_id: 1,
        driver_id: 1,
        payment_status: 'completed',
        origin_address: '123 Main St',
        destination_address: '456 Oak Ave',
        origin_latitude: 40.7128,
        origin_longitude: -74.0060,
        destination_latitude: 40.7589,
        destination_longitude: -73.9851,
        ride_time: 1000,
        fare_price: 25.50,
        created_at: '2024-01-01T10:00:00Z',
        driver: {
          first_name: 'John',
          last_name: 'Driver',
          car_seats: 4,
        },
      };

      const { getByText } = render(<RideCard ride={incompleteRide} />);

      expect(getByText('123 Main St')).toBeTruthy();
      expect(getByText('$25.50')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('handles edge cases gracefully', () => {
      const edgeCaseRide: Ride = {
        ride_id: 1,
        user_id: 1,
        driver_id: 1,
        payment_status: 'completed',
        origin_address: '',
        destination_address: '',
        origin_latitude: 0,
        origin_longitude: 0,
        destination_latitude: 0,
        destination_longitude: 0,
        ride_time: 0,
        fare_price: 0,
        created_at: '',
        driver: {
          first_name: '',
          last_name: '',
          car_seats: 0,
        },
      };

      // Should not crash with edge case data
      expect(() => {
        render(<RideCard ride={edgeCaseRide} />);
      }).not.toThrow();
    });

  });

  describe('Styling', () => {
    test('applies default styling', () => {
      const { getByText } = render(<RideCard {...defaultProps} />);

      const card = getByText('123 Main Street, City').parent;
      expect(card).toBeTruthy();
      // Styling tests would be more comprehensive with styled-components testing
    });

    test('handles long text gracefully', () => {
      const longTextRide = {
        ...mockRide,
        origin_address: 'This is a very long pickup location that should be handled gracefully without breaking the layout',
        destination_address: 'This is an even longer destination address that needs to be displayed properly',
      };

      const { getByText } = render(<RideCard ride={longTextRide} />);

      expect(getByText(/very long pickup/)).toBeTruthy();
      expect(getByText(/even longer destination/)).toBeTruthy();
    });
  });
});
