import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Easing,
} from "react-native";

import { useUI } from "@/components/UIWrapper";
import { icons } from "@/constants";

interface ChatMessage {
  id: string | number;
  senderId: string;
  senderName?: string;
  message?: string; // For backward compatibility
  messageText?: string; // New API format
  timestamp?: Date;
  createdAt?: string;
  isOwnMessage?: boolean;
  isRead?: boolean;
  messageType?: "text" | "system";
  sender?: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  driverName: string;
  driverImage?: string;
  rideId: string;
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  isTyping?: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({
  visible,
  onClose,
  driverName,
  driverImage,
  rideId,
  onSendMessage,
  messages,
  isTyping = false,
}) => {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useUI();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const typingDotsAnim = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // Modal animation effect
  useEffect(() => {
    if (visible) {
      // Animate modal entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    } else {
      // Reset animations when modal closes
      fadeAnim.setValue(0);
      slideAnim.setValue(300);
    }
  }, [visible, fadeAnim, slideAnim]);

  // Typing indicator animation
  useEffect(() => {
    if (isTyping) {
      const animateTyping = () => {
        Animated.sequence([
          Animated.timing(typingDotsAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(typingDotsAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isTyping) animateTyping();
        });
      };
      animateTyping();
    } else {
      typingDotsAnim.setValue(0);
    }
  }, [isTyping, typingDotsAnim]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (visible && flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  const handleSendMessage = async () => {
    if (messageText.trim() && !isSending) {
      setIsSending(true);

      // Animate send button
      Animated.sequence([
        Animated.timing(sendButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(sendButtonScale, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(sendButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        await onSendMessage(messageText.trim());
        setMessageText("");
      } catch (error) {
        // Error handling is done in the parent component
        console.error('Failed to send message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.isOwnMessage;

    return (
      <Animated.View
        className={`mb-3 ${isOwn ? "items-end" : "items-start"}`}
        style={{
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 300],
              outputRange: [0, 20],
            }),
          }],
        }}
      >
        <View
          className={`max-w-[80%] ${isOwn ? "flex-row-reverse" : "flex-row"} items-end`}
        >
          {/* Driver Avatar (only for received messages) */}
          {!isOwn && driverImage && (
            <Image
              source={{ uri: driverImage }}
              className="w-8 h-8 rounded-full mr-2 mb-1"
            />
          )}

          {/* Message Bubble */}
          <View
            className={`px-4 py-2 rounded-2xl max-w-[70%] ${
              isOwn
                ? "bg-primary rounded-br-md"
                : item.messageType === "system"
                  ? `bg-gray-100 dark:bg-gray-700 rounded-lg`
                  : `bg-brand-primary dark:bg-brand-primaryDark border border-gray-200 dark:border-gray-600 rounded-bl-md`
            }`}
          >
            {/* Sender name for received messages */}
            {!isOwn && item.messageType !== "system" && (
              <Text
                className={`text-xs text-gray-500 dark:text-gray-400 mb-1 font-JakartaMedium`}
              >
                {item.senderName || item.sender?.name || "Unknown"}
              </Text>
            )}

            {/* Message text */}
            <Text
              className={`text-sm ${
                isOwn ? "text-white" : `text-gray-800 dark:text-gray-200`
              }`}
            >
              {item.messageText || item.message}
            </Text>

            {/* Timestamp */}
            <Text
              className={`text-xs mt-1 ${
                isOwn ? "text-blue-100" : `text-gray-500 dark:text-gray-400`
              }`}
            >
              {item.timestamp
                ? item.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : item.createdAt
                  ? new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={true}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          style={{
            flex: 1,
            marginTop: 50,
            transform: [{ translateY: slideAnim }],
          }}
        >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={`flex-1 bg-brand-primary dark:bg-brand-primaryDark`}
      >
        {/* Header */}
        <View
          className={`flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 bg-brand-primary dark:bg-brand-primaryDark`}
        >
          <View className="flex-row items-center">
            {driverImage && (
              <Image
                source={{ uri: driverImage }}
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <View>
              <Text
                className={`font-JakartaBold text-lg text-black dark:text-white`}
              >
                {driverName}
              </Text>
              <Text className={`text-sm text-gray-600 dark:text-gray-300`}>
                Driver
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} className="p-2">
            <Image source={icons.close} className="w-6 h-6" />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500 text-center">
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />

        {/* Typing Indicator */}
        {isTyping && (
          <Animated.View
            className="px-4 pb-2"
            style={{
              opacity: fadeAnim,
              transform: [{
                scale: typingDotsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              }],
            }}
          >
            <View className="flex-row items-center">
              {driverImage && (
                <Animated.Image
                  source={{ uri: driverImage }}
                  className="w-6 h-6 rounded-full mr-2"
                  style={{
                    transform: [{
                      scale: typingDotsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      }),
                    }],
                  }}
                />
              )}
              <View
                className={`bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full flex-row items-center`}
              >
                <Text className={`text-xs text-gray-500 dark:text-gray-400 mr-2`}>
                  {driverName} is typing
                </Text>
                <View className="flex-row">
                  {[0, 1, 2].map((i) => (
                    <Animated.View
                      key={i}
                      className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full mx-0.5"
                      style={{
                        opacity: typingDotsAnim.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [
                            i === 0 ? 1 : 0.3,
                            i === 1 ? 1 : 0.3,
                            i === 2 ? 1 : 0.3,
                            i === 0 ? 1 : 0.3,
                          ],
                        }),
                        transform: [{
                          scaleY: typingDotsAnim.interpolate({
                            inputRange: [0, 0.33, 0.66, 1],
                            outputRange: [
                              i === 0 ? 1 : 0.5,
                              i === 1 ? 1 : 0.5,
                              i === 2 ? 1 : 0.5,
                              i === 0 ? 1 : 0.5,
                            ],
                          }),
                        }],
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Message Input */}
        <View
          className={`flex-row items-center p-4 border-t border-gray-200 dark:border-gray-600 bg-brand-primary dark:bg-brand-primaryDark`}
        >
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            className={`flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-3 mr-3 text-sm text-black dark:text-white`}
            placeholderTextColor={`#6b7280`}
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
          />

          <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                messageText.trim() && !isSending ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <Image
                source={icons.send}
                className="w-5 h-5"
                style={{
                  tintColor: messageText.trim() && !isSending ? "white" : "#9CA3AF",
                }}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ChatModal;
