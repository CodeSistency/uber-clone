import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useChatStore, useRealtimeStore } from '@/store';
import { websocketService } from '@/app/services/websocketService';
import { chatService } from '@/app/services/chatService';
import { log } from '@/lib/logger';
import BackendConnectivityTest from './BackendConnectivityTest';

interface ChatDiagnosticsProps {
  isVisible?: boolean;
  onClose?: () => void;
  rideId?: number;
  orderId?: number;
}

export const ChatDiagnostics: React.FC<ChatDiagnosticsProps> = ({
  isVisible = false,
  onClose,
  rideId,
  orderId,
}) => {
  const [showBackendTest, setShowBackendTest] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);

  const chatStore = useChatStore();
  const realtimeStore = useRealtimeStore();

  useEffect(() => {
    if (isVisible) {
      collectDiagnosticData();
    }
  }, [isVisible]);

  const collectDiagnosticData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      chat: {
        messages: chatStore.messages.length,
        activeChat: chatStore.activeChat,
        unreadCount: Object.values(chatStore.unreadMessages).reduce((a: number, b: number) => a + b, 0),
        isTyping: chatStore.isTyping,
        totalUnread: chatStore.unreadMessages,
      },
      websocket: {
        connected: websocketService.isConnected(),
        connectionState: websocketService.getConnectionState(),
        lastPing: websocketService.getLastPing(),
        messageQueueSize: websocketService.getMessageQueueSize(),
      },
      realtime: {
        connectionStatus: realtimeStore.connectionStatus,
        activeRide: realtimeStore.activeRide?.id || null,
        rideStatus: realtimeStore.rideStatus,
        isTracking: realtimeStore.isTracking,
      },
      config: {
        serverUrl: process.env.EXPO_PUBLIC_SERVER_URL,
        wsUrl: process.env.EXPO_PUBLIC_WS_URL,
        rideId,
        orderId,
      },
    };

    setDiagnosticData(data);
  };

  const testChatFunctionality = async () => {
    if (!rideId && !orderId) {
      Alert.alert('Error', 'No ride or order ID provided for testing');
      return;
    }

    try {
      log.info('ChatDiagnostics', 'Starting chat functionality test', { rideId, orderId });

      // Test sending a message
      const testMessage = `Test message ${Date.now()}`;
      if (rideId) {
        await chatService.sendMessage(rideId, testMessage);
      } else if (orderId) {
        await chatService.sendMessageToOrder(orderId, testMessage);
      }

      // Test typing indicators
      chatService.sendTypingIndicator(rideId || orderId!, true);
      setTimeout(() => {
        chatService.sendTypingIndicator(rideId || orderId!, false);
      }, 2000);

      Alert.alert('Success', 'Chat functionality test completed. Check logs for details.');
      collectDiagnosticData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('ChatDiagnostics', 'Chat functionality test failed', { error: errorMessage }, error);
      Alert.alert('Test Failed', errorMessage);
    }
  };

  const clearChatHistory = async () => {
    const chatId = rideId || orderId;
    if (!chatId) return;

    Alert.alert(
      'Clear Chat History',
      'This will remove all messages from local storage. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.clearChat(chatId);
              Alert.alert('Success', 'Chat history cleared');
              collectDiagnosticData();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear chat history');
            }
          }
        }
      ]
    );
  };

  const reconnectWebSocket = () => {
    log.info('ChatDiagnostics', 'Manual WebSocket reconnection triggered');
    websocketService.reconnect();
    setTimeout(() => collectDiagnosticData(), 2000);
  };

  const exportLogs = () => {
    const logs = log.getLogs();
    const recentLogs = logs.slice(-50); // Last 50 logs

    const logText = recentLogs.map(log =>
      `[${log.timestamp}] ${log.level.toUpperCase()} ${log.category}: ${log.message}`
    ).join('\n');

    Alert.alert(
      'Recent Logs',
      logText,
      [
        { text: 'Copy', onPress: () => {/* Could implement clipboard copy */} },
        { text: 'OK' }
      ]
    );
  };

  if (!isVisible) return null;

  return (
    <>
      <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
        <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800 dark:text-white">
              Chat Diagnostics
            </Text>
            {onClose && (
              <TouchableOpacity onPress={onClose} className="p-2">
                <Text className="text-2xl text-gray-500">×</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView className="flex-1">
            {diagnosticData && (
              <View className="space-y-4">
                {/* Chat Store Status */}
                <View className="p-3 bg-blue-50 dark:bg-blue-900 rounded">
                  <Text className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    📱 Chat Store
                  </Text>
                  <Text className="text-sm text-blue-700 dark:text-blue-300">
                    Messages: {diagnosticData.chat.messages}
                    {'\n'}Active Chat: {diagnosticData.chat.activeChat || 'None'}
                    {'\n'}Unread: {diagnosticData.chat.unreadCount}
                    {'\n'}Typing: {diagnosticData.chat.isTyping ? 'Yes' : 'No'}
                  </Text>
                </View>

                {/* WebSocket Status */}
                <View className={`p-3 rounded ${
                  diagnosticData.websocket.connected
                    ? 'bg-green-50 dark:bg-green-900'
                    : 'bg-red-50 dark:bg-red-900'
                }`}>
                  <Text className={`font-semibold mb-2 ${
                    diagnosticData.websocket.connected
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    🌐 WebSocket
                  </Text>
                  <Text className={`text-sm ${
                    diagnosticData.websocket.connected
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    Status: {diagnosticData.websocket.connected ? 'Connected' : 'Disconnected'}
                    {'\n'}State: {diagnosticData.websocket.connectionState}
                    {'\n'}Queue: {diagnosticData.websocket.messageQueueSize} messages
                    {'\n'}Last Ping: {diagnosticData.websocket.lastPing || 'Never'}
                  </Text>
                </View>

                {/* Realtime Store Status */}
                <View className="p-3 bg-purple-50 dark:bg-purple-900 rounded">
                  <Text className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    ⚡ Realtime Store
                  </Text>
                  <Text className="text-sm text-purple-700 dark:text-purple-300">
                    Connection: {diagnosticData.realtime.connectionStatus?.isConnected ? 'Online' : 'Offline'}
                    {'\n'}Active Ride: {diagnosticData.realtime.activeRide || 'None'}
                    {'\n'}Ride Status: {diagnosticData.realtime.rideStatus}
                    {'\n'}Tracking: {diagnosticData.realtime.isTracking ? 'Yes' : 'No'}
                  </Text>
                </View>

                {/* Configuration */}
                <View className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <Text className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    ⚙️ Configuration
                  </Text>
                  <Text className="text-sm text-gray-700 dark:text-gray-300">
                    Server: {diagnosticData.config.serverUrl}
                    {'\n'}WebSocket: {diagnosticData.config.wsUrl}
                    {'\n'}Ride ID: {diagnosticData.config.rideId || 'None'}
                    {'\n'}Order ID: {diagnosticData.config.orderId || 'None'}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="mt-6 space-y-2">
              <TouchableOpacity
                onPress={testChatFunctionality}
                className="p-3 bg-blue-500 rounded"
              >
                <Text className="text-white text-center font-semibold">
                  Test Chat Functionality
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={reconnectWebSocket}
                className="p-3 bg-orange-500 rounded"
              >
                <Text className="text-white text-center font-semibold">
                  Reconnect WebSocket
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowBackendTest(true)}
                className="p-3 bg-green-500 rounded"
              >
                <Text className="text-white text-center font-semibold">
                  Test Backend Connectivity
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={clearChatHistory}
                className="p-3 bg-red-500 rounded"
              >
                <Text className="text-white text-center font-semibold">
                  Clear Chat History
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={exportLogs}
                className="p-3 bg-gray-500 rounded"
              >
                <Text className="text-white text-center font-semibold">
                  View Recent Logs
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={collectDiagnosticData}
                className="p-3 bg-purple-500 rounded"
              >
                <Text className="text-white text-center font-semibold">
                  Refresh Diagnostics
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            <Text className="text-gray-800 dark:text-white text-center font-semibold">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <BackendConnectivityTest
        isVisible={showBackendTest}
        onClose={() => setShowBackendTest(false)}
      />
    </>
  );
};

export default ChatDiagnostics;
