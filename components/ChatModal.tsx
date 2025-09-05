import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { icons } from '@/constants';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isOwnMessage: boolean;
  messageType: 'text' | 'system';
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
  isTyping = false
}) => {
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.isOwnMessage;

    return (
      <View className={`mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
        <View className={`max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end`}>
          {/* Driver Avatar (only for received messages) */}
          {!isOwn && driverImage && (
            <Image
              source={{ uri: driverImage }}
              className="w-8 h-8 rounded-full mr-2 mb-1"
            />
          )}

          {/* Message Bubble */}
          <View className={`px-4 py-2 rounded-2xl max-w-[70%] ${
            isOwn
              ? 'bg-primary rounded-br-md'
              : item.messageType === 'system'
              ? 'bg-gray-100 rounded-lg'
              : 'bg-white border border-gray-200 rounded-bl-md'
          }`}>
            {/* Sender name for received messages */}
            {!isOwn && item.messageType !== 'system' && (
              <Text className="text-xs text-gray-500 mb-1 font-JakartaMedium">
                {item.senderName}
              </Text>
            )}

            {/* Message text */}
            <Text className={`text-sm ${
              isOwn ? 'text-white' : 'text-gray-800'
            }`}>
              {item.message}
            </Text>

            {/* Timestamp */}
            <Text className={`text-xs mt-1 ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {item.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center">
            {driverImage && (
              <Image
                source={{ uri: driverImage }}
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <View>
              <Text className="font-JakartaBold text-lg">{driverName}</Text>
              <Text className="text-sm text-gray-600">Driver</Text>
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
          <View className="px-4 pb-2">
            <View className="flex-row items-center">
              {driverImage && (
                <Image
                  source={{ uri: driverImage }}
                  className="w-6 h-6 rounded-full mr-2"
                />
              )}
              <View className="bg-gray-100 px-3 py-2 rounded-full">
                <Text className="text-xs text-gray-500">{driverName} is typing...</Text>
              </View>
            </View>
          </View>
        )}

        {/* Message Input */}
        <View className="flex-row items-center p-4 border-t border-gray-200 bg-white">
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 mr-3 text-sm"
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              messageText.trim() ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <Image
              source={icons.send}
              className="w-5 h-5"
              style={{
                tintColor: messageText.trim() ? 'white' : '#9CA3AF'
              }}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChatModal;
