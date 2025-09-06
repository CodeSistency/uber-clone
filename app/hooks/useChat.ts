import { useEffect, useCallback, useState } from "react";

import { useChatStore } from "../../store";
import { LocationData } from "../../types/type";
import { chatStorage } from "../lib/storage";
import { chatService } from "../services/chatService";

export const useChat = (rideId: number | null) => {
  const {
    messages,
    activeChat,
    unreadMessages,
    isTyping,
    addMessage,
    setActiveChat,
    markMessagesRead,
    setTyping,
    clearChat,
    loadMessages,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages when rideId changes
  useEffect(() => {
    if (rideId) {
      loadChatHistory(rideId);
      setActiveChat(rideId);
    }
  }, [rideId, setActiveChat]);

  // Load chat history from storage and API
  const loadChatHistory = useCallback(
    async (chatRideId: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // Load from local storage first
        const cachedMessages = await chatStorage.getChatHistory(chatRideId);
        if (cachedMessages.length > 0) {
          loadMessages(chatRideId, cachedMessages);
        }

        // Load from API (would sync with server)
        const freshMessages = await chatService.loadMessageHistory(chatRideId);
        if (freshMessages.length !== cachedMessages.length) {
          loadMessages(chatRideId, freshMessages);
          // Update cache
          await chatStorage.saveChatHistory(chatRideId, freshMessages);
        }
      } catch (error) {
        console.error("[useChat] Failed to load chat history:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load messages",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [loadMessages],
  );

  // Send message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!rideId) {
        setError("No active chat");
        return;
      }

      try {
        setError(null);
        await chatService.sendMessage(rideId, message);

        // Message will be added to store via WebSocket callback
        // This is optimistic UI - message appears immediately
      } catch (error) {
        console.error("[useChat] Failed to send message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to send message",
        );
        throw error;
      }
    },
    [rideId],
  );

  // Share location
  const shareLocation = useCallback(
    async (location: LocationData) => {
      if (!rideId) {
        setError("No active chat");
        return;
      }

      try {
        setError(null);
        await chatService.shareLocation(rideId, location);
      } catch (error) {
        console.error("[useChat] Failed to share location:", error);
        setError(
          error instanceof Error ? error.message : "Failed to share location",
        );
        throw error;
      }
    },
    [rideId],
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!rideId) return;

    try {
      await chatService.markMessagesRead(rideId);
    } catch (error) {
      console.error("[useChat] Failed to mark messages as read:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to mark messages as read",
      );
    }
  }, [rideId]);

  // Start/stop typing
  const startTyping = useCallback(() => {
    if (!rideId) return;
    chatService.sendTypingIndicator(rideId, true);
  }, [rideId]);

  const stopTyping = useCallback(() => {
    if (!rideId) return;
    chatService.sendTypingIndicator(rideId, false);
  }, [rideId]);

  // Clear chat
  const clearChatHistory = useCallback(async () => {
    if (!rideId) return;

    try {
      await chatStorage.clearChatHistory(rideId);
      clearChat(rideId);
    } catch (error) {
      console.error("[useChat] Failed to clear chat:", error);
      setError(error instanceof Error ? error.message : "Failed to clear chat");
    }
  }, [rideId, clearChat]);

  // Get messages for current ride
  const currentMessages = rideId ? chatService.getMessagesForRide(rideId) : [];

  // Get unread count for current ride
  const currentUnreadCount = rideId
    ? chatService.getUnreadCountForRide(rideId)
    : 0;

  // Get total unread count across all chats
  const totalUnreadCount = chatService.getTotalUnreadCount();

  // Format message preview
  const formatMessagePreview = useCallback(
    (message: string, maxLength: number = 50) => {
      return chatService.formatMessagePreview(message, maxLength);
    },
    [],
  );

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: Date) => {
    return chatService.formatTimestamp(timestamp);
  }, []);

  // Validate message
  const validateMessage = useCallback((message: string) => {
    return chatService.validateMessage(message);
  }, []);

  return {
    // State
    messages: currentMessages,
    isTyping,
    isLoading,
    error,
    unreadCount: currentUnreadCount,
    totalUnreadCount,
    isActive: activeChat === rideId,

    // Actions
    sendMessage,
    shareLocation,
    markAsRead,
    startTyping,
    stopTyping,
    clearChatHistory,
    loadChatHistory: () => loadChatHistory(rideId!),

    // Utilities
    formatMessagePreview,
    formatTimestamp,
    validateMessage,
    setError,
  };
};

export default useChat;