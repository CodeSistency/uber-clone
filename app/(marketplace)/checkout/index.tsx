import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy cart data
const DUMMY_CART_ITEMS = [
  {
    id: "ITEM_001",
    name: "Margherita Pizza",
    price: 16.99,
    quantity: 1,
    image: "🍕",
  },
  {
    id: "ITEM_002",
    name: "Pepperoni Pizza",
    price: 18.99,
    quantity: 1,
    image: "🌶️",
  },
  {
    id: "ITEM_005",
    name: "Coca Cola",
    price: 2.99,
    quantity: 2,
    image: "🥤",
  },
];

const DUMMY_DELIVERY_ADDRESS = {
  id: "ADDR_001",
  name: "Home",
  address: "123 Main St, Apt 4B, New York, NY 10001",
  instructions: "Ring doorbell twice",
};

const Checkout = () => {
  const [selectedPayment, setSelectedPayment] = useState("wallet");
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    DUMMY_DELIVERY_ADDRESS.instructions,
  );
  const [tipAmount, setTipAmount] = useState(3.0);

  const subtotal = DUMMY_CART_ITEMS.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax + tipAmount;

  const handlePlaceOrder = () => {
    Alert.alert(
      "Order Confirmed!",
      "Your order has been placed successfully. You will receive updates on your order status.",
      [
        {
          text: "Continue",
          onPress: () => router.replace("/(root)/(tabs)/home" as any),
        },
      ],
    );
  };

  const handleAddTip = (amount: number) => {
    setTipAmount(amount);
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Checkout</Text>
        <Text className="text-secondary-600 mt-1">
          Mario's Pizza • 25-35 min delivery
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Order Items */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Your Order</Text>

          {DUMMY_CART_ITEMS.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center py-2 border-b border-general-500 last:border-b-0"
            >
              <Text className="text-2xl mr-3">{item.image}</Text>
              <View className="flex-1">
                <Text className="font-JakartaBold">{item.name}</Text>
                <Text className="text-secondary-600">Qty: {item.quantity}</Text>
              </View>
              <Text className="font-JakartaBold">
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">
            Delivery Address
          </Text>

          <View className="flex-row items-start">
            <Text className="text-2xl mr-3">🏠</Text>
            <View className="flex-1">
              <Text className="font-JakartaBold mb-1">
                {DUMMY_DELIVERY_ADDRESS.name}
              </Text>
              <Text className="text-secondary-600 mb-3">
                {DUMMY_DELIVERY_ADDRESS.address}
              </Text>

              <Text className="font-JakartaMedium mb-2">
                Delivery Instructions
              </Text>
              <TextInput
                value={deliveryInstructions}
                onChangeText={setDeliveryInstructions}
                placeholder="Add delivery instructions..."
                className="border border-general-500 rounded-lg p-3 font-JakartaMedium"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </View>

        {/* Add Tip */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Add a Tip</Text>
          <Text className="text-secondary-600 mb-3">
            Support your delivery driver with a tip
          </Text>

          <View className="flex-row justify-between">
            {[2, 3, 5, 0].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => handleAddTip(amount)}
                className={`flex-1 mx-1 py-2 rounded-lg border-2 ${
                  tipAmount === amount
                    ? "border-primary-500 bg-primary-50"
                    : "border-general-500"
                }`}
              >
                <Text
                  className={`text-center font-JakartaBold ${
                    tipAmount === amount
                      ? "text-primary-500"
                      : "text-secondary-700"
                  }`}
                >
                  {amount === 0 ? "No Tip" : `$${amount}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Payment Method</Text>

          <TouchableOpacity
            onPress={() => setSelectedPayment("wallet")}
            className={`flex-row items-center p-3 rounded-lg mb-2 ${
              selectedPayment === "wallet"
                ? "bg-primary-50 border-2 border-primary-500"
                : "bg-general-500"
            }`}
          >
            <Text className="text-2xl mr-3">💳</Text>
            <View className="flex-1">
              <Text className="font-JakartaBold">Wallet</Text>
              <Text className="text-secondary-600">Balance: $25.50</Text>
            </View>
            {selectedPayment === "wallet" && (
              <Text className="text-primary-500 font-JakartaBold">✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedPayment("card")}
            className={`flex-row items-center p-3 rounded-lg ${
              selectedPayment === "card"
                ? "bg-primary-50 border-2 border-primary-500"
                : "bg-general-500"
            }`}
          >
            <Text className="text-2xl mr-3">💳</Text>
            <View className="flex-1">
              <Text className="font-JakartaBold">Credit Card</Text>
              <Text className="text-secondary-600">**** **** **** 1234</Text>
            </View>
            {selectedPayment === "card" && (
              <Text className="text-primary-500 font-JakartaBold">✓</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Order Summary</Text>

          <View className="space-y-2 mb-3">
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">Subtotal</Text>
              <Text className="font-JakartaMedium">${subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">Delivery Fee</Text>
              <Text className="font-JakartaMedium">
                ${deliveryFee.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">Tax</Text>
              <Text className="font-JakartaMedium">${tax.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">Tip</Text>
              <Text className="font-JakartaMedium">
                ${tipAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between pt-3 border-t border-general-500">
            <Text className="text-lg font-JakartaExtraBold">Total</Text>
            <Text className="text-lg font-JakartaExtraBold text-primary-500">
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="bg-white p-5 border-t border-general-500">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          className="bg-primary-500 rounded-full py-4 items-center"
        >
          <Text className="text-white text-lg font-JakartaExtraBold">
            Place Order • ${total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Checkout;
