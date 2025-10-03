import { useEffect, useCallback, useState } from "react";

import { useChatStore } from "../../store";
import { LocationData } from "../../types/type";
import { chatStorage } from "../lib/storage";
import { chatService } from "../services/chatService";
import { log } from "../../lib/logger";

export const useChat = (rideId: number | null, orderId?: number | null) => {
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

  // Load messages when rideId or orderId changes
  useEffect(() => {
    const loadChat = async () => {
      try {
        if (rideId) {
          await loadChatHistory(rideId);
          setActiveChat(rideId);
        } else if (orderId) {
          await loadOrderChatHistory(orderId);
          setActiveChat(orderId); // Using orderId as chat ID for compatibility
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load chat";
        log.error(
          "useChat",
          "Failed to initialize chat",
          {
            rideId,
            orderId,
            error: errorMessage,
          },
          error instanceof Error ? error : undefined,
        );
        setError(errorMessage);
      }
    };

    loadChat();
  }, [rideId, orderId, setActiveChat]);

  // Load chat history from storage and API
  const loadChatHistory = useCallback(
    async (chatRideId: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // Load from local storage first
        const cachedMessages = await chatStorage.getChatHistory(
          chatRideId,
          "ride",
        );
        if (cachedMessages.length > 0) {
          loadMessages(chatRideId, cachedMessages);
        }

        // Load from API (would sync with server)
        const freshMessages = await chatService.loadMessageHistory(chatRideId);
        if (freshMessages.length !== cachedMessages.length) {
          loadMessages(chatRideId, freshMessages);
          // Update cache
          await chatStorage.saveChatHistory(chatRideId, freshMessages, "ride");
        }
      } catch (error) {
        log.error(
          "useChat",
          "Failed to load chat history",
          {
            rideId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          error instanceof Error ? error : undefined,
        );
        setError(
          error instanceof Error ? error.message : "Failed to load messages",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [loadMessages],
  );

  // Load order chat history
  const loadOrderChatHistory = useCallback(
    async (chatOrderId: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // Load from local storage first
        const cachedMessages = await chatStorage.getChatHistory(
          chatOrderId,
          "order",
        );
        if (cachedMessages.length > 0) {
          loadMessages(chatOrderId, cachedMessages);
        }

        // Load from API
        const freshMessages =
          await chatService.loadOrderMessageHistory(chatOrderId);
        if (freshMessages.length !== cachedMessages.length) {
          loadMessages(chatOrderId, freshMessages);
          // Update cache
          await chatStorage.saveChatHistory(
            chatOrderId,
            freshMessages,
            "order",
          );
        }
      } catch (error) {
        log.error(
          "useChat",
          "Failed to load order chat history",
          {
            orderId: chatOrderId,
            error: (error as Error)?.message,
          },
          error instanceof Error ? error : undefined,
        );
        setError(
          error instanceof Error ? error.message : "Failed to load messages",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [loadMessages],
  );

  // Send message (supports both rides and orders)
  const sendMessage = useCallback(
    async (messageText: string) => {
      const chatId = rideId || orderId;
      if (!chatId) {
        setError("No active chat");
        return;
      }

      try {
        setError(null);

        let sentMessage;
        if (rideId) {
          sentMessage = await chatService.sendMessage(rideId, messageText);
        } else if (orderId) {
          sentMessage = await chatService.sendMessageToOrder(
            orderId,
            messageText,
          );
        }

        log.info("useChat", "Message sent successfully", {
          messageId: sentMessage?.id,
          rideId,
          orderId,
          messageLength: messageText.length,
        });

        // Message is already added to store by chatService
        // WebSocket will broadcast to other participants
      } catch (error) {
        log.error(
          "useChat",
          "Failed to send message",
          {
            rideId,
            orderId,
            error: (error as Error)?.message,
          },
          error instanceof Error ? error : undefined,
        );
        setError(
          error instanceof Error ? error.message : "Failed to send message",
        );
        throw error;
      }
    },
    [rideId, orderId],
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
        log.error(
          "useChat",
          "Failed to share location",
          {
            rideId,
            error:
              error instanceof Error
                ? error.message
                : "Failed to share location",
          },
          error instanceof Error ? error : undefined,
        );
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
      log.error(
        "useChat",
        "Failed to mark messages as read",
        {
          rideId,
          error:
            error instanceof Error
              ? error.message
              : "Failed to mark messages as read",
        },
        error instanceof Error ? error : undefined,
      );
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
    const chatId = rideId || orderId;
    const chatType = rideId ? "ride" : "order";

    if (!chatId) return;

    try {
      await chatStorage.clearChatHistory(chatId, chatType);
      clearChat(chatId);
    } catch (error) {
      log.error(
        "useChat",
        "Failed to clear chat",
        {
          chatId,
          chatType,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
      setError(error instanceof Error ? error.message : "Failed to clear chat");
    }
  }, [rideId, orderId, clearChat]);

  // Get messages for current chat (ride or order)
  const chatId = rideId || orderId;
  const currentMessages = chatId ? chatService.getMessagesForRide(chatId) : [];

  // Get unread count for current chat
  const currentUnreadCount = chatId
    ? chatService.getUnreadCountForRide(chatId)
    : 0;

  // Get total unread count across all chats
  const totalUnreadCount = chatService.getTotalUnreadCount();

  // Format message preview
  const formatMessagePreview = useCallback(
    (messageText: string, maxLength: number = 50) => {
      return chatService.formatMessagePreview(messageText, maxLength);
    },
    [],
  );

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: Date) => {
    return chatService.formatTimestamp(timestamp);
  }, []);

  // Validate message
  const validateMessage = useCallback((messageText: string) => {
    return chatService.validateMessage(messageText);
  }, []);

  return {
    // State
    messages: currentMessages,
    isTyping,
    isLoading,
    error,
    unreadCount: currentUnreadCount,
    totalUnreadCount,
    isActive: activeChat === chatId,
    chatType: rideId ? "ride" : orderId ? "order" : null,
    rideId,
    orderId,

    // Actions
    sendMessage,
    shareLocation,
    markAsRead,
    startTyping,
    stopTyping,
    clearChatHistory,
    loadChatHistory: () => {
      if (rideId) loadChatHistory(rideId);
      else if (orderId) loadOrderChatHistory(orderId);
    },

    // Utilities
    formatMessagePreview,
    formatTimestamp,
    validateMessage,
    setError,
  };
};

export default useChat;
