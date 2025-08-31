import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

// Dummy data for orders
const DUMMY_ORDERS = [
  {
    id: 'ORD_001',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    deliveryAddress: '123 Main St, Apt 4B',
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 16.99 },
      { name: 'Coca Cola', quantity: 2, price: 2.99 }
    ],
    subtotal: 22.97,
    deliveryFee: 3.99,
    tax: 2.15,
    total: 29.11,
    status: 'pending',
    orderTime: '5 min ago',
    estimatedTime: '25-35 min'
  },
  {
    id: 'ORD_002',
    customerName: 'Jane Smith',
    customerPhone: '+1987654321',
    deliveryAddress: '456 Broadway Ave, Floor 3',
    items: [
      { name: 'Pepperoni Pizza', quantity: 1, price: 18.99 },
      { name: 'Garlic Bread', quantity: 1, price: 6.99 }
    ],
    subtotal: 25.98,
    deliveryFee: 4.99,
    tax: 2.44,
    total: 33.41,
    status: 'preparing',
    orderTime: '12 min ago',
    estimatedTime: '18-28 min'
  },
  {
    id: 'ORD_003',
    customerName: 'Mike Johnson',
    customerPhone: '+1122334455',
    deliveryAddress: '789 Park Ave, Suite 100',
    items: [
      { name: 'Vegetarian Pizza', quantity: 2, price: 16.99 },
      { name: 'Caesar Salad', quantity: 1, price: 8.99 }
    ],
    subtotal: 42.97,
    deliveryFee: 5.99,
    tax: 4.03,
    total: 52.99,
    status: 'ready',
    orderTime: '18 min ago',
    estimatedTime: 'Ready for pickup'
  }
];

const OrderManagement = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders] = useState(DUMMY_ORDERS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-warning-500 bg-warning-50';
      case 'preparing': return 'text-primary-500 bg-primary-50';
      case 'ready': return 'text-success-500 bg-success-50';
      case 'delivered': return 'text-secondary-500 bg-secondary-50';
      default: return 'text-secondary-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'delivered': return '🚚';
      default: return '📦';
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    Alert.alert('Status Updated', `Order ${orderId} status changed to ${newStatus}`);
  };

  const handleCallCustomer = (phone: string) => {
    Alert.alert('Call Customer', `Calling ${phone}...`);
  };

  const filteredOrders = selectedTab === 'all'
    ? orders
    : orders.filter(order => order.status === selectedTab);

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Order Management</Text>
        <Text className="text-secondary-600 mt-1">
          Track and manage incoming orders
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Status Tabs */}
        <View className="bg-white rounded-lg p-2 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {[
                { key: 'all', label: 'All Orders', count: orders.length },
                { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
                { key: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
                { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSelectedTab(tab.key)}
                  className={`px-4 py-2 mx-1 rounded-lg ${
                    selectedTab === tab.key
                      ? 'bg-primary-500'
                      : 'bg-general-500'
                  }`}
                >
                  <Text className={`font-JakartaBold ${
                    selectedTab === tab.key
                      ? 'text-white'
                      : 'text-secondary-700'
                  }`}>
                    {tab.label} ({tab.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Orders List */}
        <View className="space-y-4 mb-8">
          {filteredOrders.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center">
              <Text className="text-4xl mb-3">📦</Text>
              <Text className="text-xl font-JakartaBold mb-2">No orders found</Text>
              <Text className="text-secondary-600 text-center">
                {selectedTab === 'all' ? 'No orders yet' : `No ${selectedTab} orders`}
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} className="bg-white rounded-lg p-4">
                {/* Order Header */}
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="font-JakartaBold text-lg">{order.customerName}</Text>
                    <Text className="text-secondary-600 text-sm">{order.orderTime}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    <Text className="text-sm font-JakartaBold flex-row items-center">
                      <Text className="mr-1">{getStatusIcon(order.status)}</Text>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Order Items */}
                <View className="mb-3">
                  {order.items.map((item, index) => (
                    <View key={index} className="flex-row justify-between py-1">
                      <Text className="font-JakartaMedium">
                        {item.quantity}x {item.name}
                      </Text>
                      <Text className="font-JakartaMedium">${item.price * item.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Order Summary */}
                <View className="bg-general-500 rounded-lg p-3 mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-secondary-600">Subtotal</Text>
                    <Text className="text-sm font-JakartaMedium">${order.subtotal}</Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-secondary-600">Delivery Fee</Text>
                    <Text className="text-sm font-JakartaMedium">${order.deliveryFee}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-secondary-600">Tax</Text>
                    <Text className="text-sm font-JakartaMedium">${order.tax}</Text>
                  </View>
                  <View className="flex-row justify-between mt-2 pt-2 border-t border-secondary-300">
                    <Text className="font-JakartaBold">Total</Text>
                    <Text className="font-JakartaExtraBold text-primary-500">${order.total}</Text>
                  </View>
                </View>

                {/* Delivery Info */}
                <View className="mb-3">
                  <Text className="text-sm text-secondary-600 mb-1">Delivery Address</Text>
                  <Text className="font-JakartaMedium text-sm">{order.deliveryAddress}</Text>
                  <Text className="text-sm text-success-500 mt-1">{order.estimatedTime}</Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => handleCallCustomer(order.customerPhone)}
                    className="flex-1 bg-primary-500 rounded-full py-2 items-center"
                  >
                    <Text className="text-white font-JakartaBold text-sm">📞 Call</Text>
                  </TouchableOpacity>

                  {order.status === 'pending' && (
                    <TouchableOpacity
                      onPress={() => handleStatusUpdate(order.id, 'preparing')}
                      className="flex-1 bg-success-500 rounded-full py-2 items-center"
                    >
                      <Text className="text-white font-JakartaBold text-sm">Accept</Text>
                    </TouchableOpacity>
                  )}

                  {order.status === 'preparing' && (
                    <TouchableOpacity
                      onPress={() => handleStatusUpdate(order.id, 'ready')}
                      className="flex-1 bg-success-500 rounded-full py-2 items-center"
                    >
                      <Text className="text-white font-JakartaBold text-sm">Mark Ready</Text>
                    </TouchableOpacity>
                  )}

                  {order.status === 'ready' && (
                    <TouchableOpacity
                      onPress={() => handleStatusUpdate(order.id, 'delivered')}
                      className="flex-1 bg-success-500 rounded-full py-2 items-center"
                    >
                      <Text className="text-white font-JakartaBold text-sm">Mark Delivered</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderManagement;
