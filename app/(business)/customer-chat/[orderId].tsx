import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data for customer chat
const DUMMY_ORDER = {
  id: "ORD_1024",
  customerName: "Sarah Johnson",
  customerAvatar: "👩‍💼",
  items: ["Margherita Pizza", "Caesar Salad"],
  total: 24.75,
  status: "preparing",
};

const DUMMY_CHAT_MESSAGES = [
  {
    id: "msg_1",
    sender: "customer",
    message: "Hello! How is my order coming along?",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
    isRead: true,
  },
  {
    id: "msg_2",
    sender: "business",
    message:
      "Hi Sarah! Your Margherita Pizza and Caesar Salad are being prepared and will be ready in about 10 minutes.",
    timestamp: new Date(Date.now() - 14 * 60 * 1000), // 14 min ago
    isRead: true,
  },
  {
    id: "msg_3",
    sender: "customer",
    message: "Great! Thank you for the update.",
    timestamp: new Date(Date.now() - 13 * 60 * 1000), // 13 min ago
    isRead: true,
  },
  {
    id: "msg_4",
    sender: "system",
    message: "Order status updated: Ready for pickup",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    isRead: true,
  },
  {
    id: "msg_5",
    sender: "business",
    message: "Your order is ready! A driver will pick it up shortly.",
    timestamp: new Date(Date.now() - 4 * 60 * 1000), // 4 min ago
    isRead: true,
  },
  {
    id: "msg_6",
    sender: "system",
    message: "Driver John D. assigned to delivery",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    isRead: true,
  },
  {
    id: "msg_7",
    sender: "customer",
    message: "Perfect! Looking forward to it.",
    timestamp: new Date(Date.now() - 1 * 60 * 1000), // 1 min ago
    isRead: false,
  },
];

const CustomerChatScreen = () => {
  const { orderId } = useLocalSearchParams();
  const [messages, setMessages] = useState(DUMMY_CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Simulate customer typing indicator
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setIsTyping(Math.random() > 0.7); // 30% chance of showing typing
    }, 5000);

    return () => clearInterval(typingInterval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: `msg_${Date.now()}`,
        sender: "business",
        message: newMessage.trim(),
        timestamp: new Date(),
        isRead: false,
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      // Simulate customer response after 2-5 seconds
      setTimeout(
        () => {
          const responses = [
            "Thank you for the update!",
            "That sounds great!",
            "Perfect, I'll be waiting.",
            "Thanks for letting me know.",
            "Appreciate the quick response!",
          ];

          const randomResponse =
            responses[Math.floor(Math.random() * responses.length)];

          const customerResponse = {
            id: `msg_${Date.now()}_response`,
            sender: "customer",
            message: randomResponse,
            timestamp: new Date(),
            isRead: false,
          };

          setMessages((prev) => [...prev, customerResponse]);
        },
        2000 + Math.random() * 3000,
      );
    }
  };

  const handleQuickReply = (reply: string) => {
    const message = {
      id: `msg_${Date.now()}`,
      sender: "business",
      message: reply,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages((prev) => [...prev, message]);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return timestamp.toLocaleDateString();
  };

  const getMessageBubbleStyle = (sender: string) => {
    switch (sender) {
      case "business":
        return "bg-primary-500 self-end";
      case "customer":
        return "bg-white border border-general-500 self-start";
      case "system":
        return "bg-general-500 self-center";
      default:
        return "bg-general-500";
    }
  };

  const getMessageTextStyle = (sender: string) => {
    switch (sender) {
      case "business":
        return "text-white";
      case "customer":
        return "text-secondary-700";
      case "system":
        return "text-secondary-600 text-center text-sm";
      default:
        return "text-secondary-600";
    }
  };

  const quickReplies = [
    "Your order is being prepared",
    "Your order is ready for pickup",
    "Driver is on the way",
    "Order has been delivered",
  ];

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="bg-white p-4 border-b border-general-500">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Text className="text-xl">←</Text>
              </TouchableOpacity>
              <View>
                <Text className="text-lg font-JakartaBold">
                  💬 {DUMMY_ORDER.customerName}
                </Text>
                <Text className="text-sm text-secondary-600">
                  Order {DUMMY_ORDER.id}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-sm text-secondary-600">
                {DUMMY_ORDER.items.join(", ")}
              </Text>
              <Text className="font-JakartaBold text-primary-500">
                ${DUMMY_ORDER.total}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-4 space-y-3">
            {messages.map((msg) => (
              <View key={msg.id} className="flex-row">
                {msg.sender === "business" && <View className="flex-1" />}
                <View
                  className={`max-w-[80%] ${getMessageBubbleStyle(msg.sender)} rounded-2xl px-4 py-2`}
                >
                  <Text
                    className={`${getMessageTextStyle(msg.sender)} font-JakartaMedium`}
                  >
                    {msg.message}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${
                      msg.sender === "business"
                        ? "text-primary-100"
                        : msg.sender === "customer"
                          ? "text-secondary-500"
                          : "text-secondary-600"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
                {msg.sender === "customer" && <View className="flex-1" />}
              </View>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <View className="flex-row">
                <View className="bg-white border border-general-500 rounded-2xl px-4 py-2 self-start">
                  <View className="flex-row space-x-1">
                    <View className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" />
                    <View
                      className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <View
                      className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </View>
                </View>
                <View className="flex-1" />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Quick Replies */}
        <View className="bg-white px-4 py-2 border-t border-general-500">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {quickReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickReply(reply)}
                  className="bg-general-500 px-3 py-2 rounded-full"
                >
                  <Text className="text-sm text-secondary-700 font-JakartaMedium">
                    {reply}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Message Input */}
        <View className="bg-white px-4 py-3 border-t border-general-500">
          <View className="flex-row items-center space-x-3">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              className="flex-1 bg-general-500 rounded-full px-4 py-3 font-JakartaMedium"
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                newMessage.trim() ? "bg-primary-500" : "bg-general-500"
              }`}
            >
              <Text className="text-white text-lg font-JakartaBold">📤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomerChatScreen;
