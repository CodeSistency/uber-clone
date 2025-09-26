import { log } from "@/lib/logger";

import { fetchAPI } from "../../lib/fetch";
import { useChatStore, useNotificationStore } from "../../store";
import { ChatMessage, LocationData } from "../../types/type";

import { websocketService } from "./websocketService";

export class ChatService {
  private static instance: ChatService;

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(rideId: number, messageText: string): Promise<ChatMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info("ChatService", "Sending message via REST API", {
        messageId,
        rideId,
        messageLength: messageText.length,
      });

      // Validate message
      const validation = this.validateMessage(messageText);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Send via REST API
      const messageData = {
        senderId: "current_user", // TODO: Get from auth context
        messageText: messageText.trim(),
      };

      const response = await fetchAPI(`chat/${rideId}/messages`, {
        method: "POST",
        body: JSON.stringify(messageData),
      });

      log.info("ChatService", "Message sent successfully via REST API", {
        messageId,
        rideId,
        responseId: response.id,
      });

      // Convert response to ChatMessage format for local store
      const chatMessage: ChatMessage = {
        id: response.id,
        rideId: response.rideId,
        senderId: response.senderId,
        messageText: response.messageText,
        createdAt: response.createdAt,
        isRead: true, // Own messages are always read
        messageType: "text",
        timestamp: new Date(response.createdAt),
        sender: response.sender,
      };

      // Add to local store
      useChatStore.getState().addMessage(chatMessage);

      // Also broadcast via WebSocket for real-time updates
      this.broadcastMessageViaWebSocket(rideId, null, messageText);

      return chatMessage;
    } catch (error) {
      log.error(
        "ChatService",
        "Failed to send message",
        {
          messageId,
          rideId,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  async markMessagesRead(rideId: number): Promise<void> {
    try {
      log.info("ChatService", "Marking messages as read", { rideId });

      useChatStore.getState().markMessagesRead(rideId);

      // TODO: Send to server to mark as read
      // This would typically be an API call or WebSocket message
    } catch (error) {
      log.error("ChatService", "Failed to mark messages as read", {
        rideId,
        error: (error as Error)?.message,
      }, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async loadMessageHistory(
    rideId: number,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    try {
      log.info("ChatService", "Loading message history from API", {
        rideId,
        limit,
      });

      // Load from REST API
      const response = await fetchAPI(`chat/${rideId}/messages`, {
        method: "GET",
      });

      // Convert API response to ChatMessage format
      const messages: ChatMessage[] = response.map((msg: any) => ({
        id: msg.id,
        rideId: msg.rideId,
        senderId: msg.senderId,
        messageText: msg.messageText,
        createdAt: msg.createdAt,
        isRead: false, // TODO: Implement read status from API
        messageType: "text",
        timestamp: new Date(msg.createdAt),
        sender: msg.sender,
      }));

      log.info("ChatService", "Message history loaded successfully", {
        rideId,
        messageCount: messages.length,
      });

      // Load into store
      useChatStore.getState().loadMessages(rideId, messages);

      return messages;
    } catch (error) {
      log.error(
        "ChatService",
        "Failed to load message history",
        {
          rideId,
          limit,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  async sendMessageToOrder(
    orderId: number,
    messageText: string,
  ): Promise<ChatMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      log.info("ChatService", "Sending message to order via REST API", {
        messageId,
        orderId,
        messageLength: messageText.length,
      });

      // Validate message
      const validation = this.validateMessage(messageText);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Send via REST API
      const messageData = {
        senderId: "current_user", // TODO: Get from auth context
        messageText: messageText.trim(),
      };

      const response = await fetchAPI(`chat/order/${orderId}/messages`, {
        method: "POST",
        body: JSON.stringify(messageData),
      });

      log.info("ChatService", "Order message sent successfully via REST API", {
        messageId,
        orderId,
        responseId: response.id,
      });

      // Convert response to ChatMessage format for local store
      const chatMessage: ChatMessage = {
        id: response.id,
        orderId: response.orderId,
        senderId: response.senderId,
        messageText: response.messageText,
        createdAt: response.createdAt,
        isRead: true, // Own messages are always read
        messageType: "text",
        timestamp: new Date(response.createdAt),
        sender: response.sender,
      };

      // Add to local store (using rideId as key for compatibility)
      // TODO: Update store to support orderId as well
      useChatStore.getState().addMessage(chatMessage);

      // Also broadcast via WebSocket for real-time updates
      this.broadcastMessageViaWebSocket(null, orderId, messageText);

      return chatMessage;
    } catch (error) {
      log.error(
        "ChatService",
        "Failed to send message to order",
        {
          messageId,
          orderId,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  async loadOrderMessageHistory(
    orderId: number,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    try {
      log.info("ChatService", "Loading order message history from API", {
        orderId,
        limit,
      });

      // Load from REST API
      const response = await fetchAPI(`chat/order/${orderId}/messages`, {
        method: "GET",
      });

      // Convert API response to ChatMessage format
      const messages: ChatMessage[] = response.map((msg: any) => ({
        id: msg.id,
        orderId: msg.orderId,
        senderId: msg.senderId,
        messageText: msg.messageText,
        createdAt: msg.createdAt,
        isRead: false, // TODO: Implement read status from API
        messageType: "text",
        timestamp: new Date(msg.createdAt),
        sender: msg.sender,
      }));

      log.info("ChatService", "Order message history loaded successfully", {
        orderId,
        messageCount: messages.length,
      });

      // Load into store (using orderId as rideId for compatibility)
      // TODO: Update store to support orderId as separate key
      useChatStore.getState().loadMessages(orderId, messages);

      return messages;
    } catch (error) {
      log.error(
        "ChatService",
        "Failed to load order message history",
        {
          orderId,
          limit,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  async sendTypingIndicator(rideId: number, isTyping: boolean): Promise<void> {
    try {
      if (isTyping) {
        websocketService.sendTypingStart(rideId);
      } else {
        websocketService.sendTypingStop(rideId);
      }

      // Update local state
      useChatStore.getState().setTyping(isTyping);
    } catch (error) {
      log.error("ChatService", "Failed to send typing indicator", {
        rideId,
        isTyping,
        error: (error as Error)?.message,
      }, error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async shareLocation(rideId: number, location: LocationData): Promise<void> {
    try {
      log.info("ChatService", "Sharing location", {
        rideId,
        location: { lat: location.latitude, lng: location.longitude },
      });

      const locationMessage: ChatMessage = {
        id: Date.now(), // Temporary ID until API response
        rideId,
        senderId: "current_user",
        messageText: `📍 Location shared: ${location.latitude}, ${location.longitude}`,
        messageType: "location",
        createdAt: new Date().toISOString(),
        isRead: true,
        timestamp: new Date(),
      };

      // Add to local store
      useChatStore.getState().addMessage(locationMessage);

      // TODO: Send location via WebSocket or API
      // websocketService.shareLocation(rideId, location);
      log.warn("ChatService", "Location sharing via API not implemented yet", {
        rideId,
      });
    } catch (error) {
      log.error(
        "ChatService",
        "Failed to share location",
        {
          rideId,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
      throw error;
    }
  }

  /**
   * Broadcast message via WebSocket for real-time updates
   */
  private broadcastMessageViaWebSocket(
    rideId: number | null,
    orderId: number | null,
    message: string,
  ): void {
    try {
      // Connect to the correct WebSocket namespace according to docs
      // Note: This should be handled by the WebSocketService
      log.debug("ChatService", "Broadcasting message via WebSocket", {
        rideId,
        orderId,
        messageLength: message.length,
      });

      // TODO: Implement WebSocket broadcasting according to new API
      // The WebSocket events should be updated in websocketService.ts
    } catch (error) {
      log.error(
        "ChatService",
        "Failed to broadcast message via WebSocket",
        {
          rideId,
          orderId,
          error: (error as Error)?.message,
        },
        error instanceof Error ? error : undefined,
      );
    }
  }

  getMessagesForRide(rideId: number): ChatMessage[] {
    const allMessages = useChatStore.getState().messages;
    return allMessages.filter(
      (message: ChatMessage) => message.rideId === rideId,
    );
  }

  getUnreadCountForRide(rideId: number): number {
    const unreadMessages = useChatStore.getState().unreadMessages;
    return unreadMessages[rideId] || 0;
  }

  getTotalUnreadCount(): number {
    const unreadMessages = useChatStore.getState().unreadMessages;
    return (Object.values(unreadMessages) as number[]).reduce(
      (total: number, count: number) => total + count,
      0,
    );
  }

  setActiveChat(rideId: number): void {
    log.info("ChatService", "Setting active chat", { rideId });
    useChatStore.getState().setActiveChat(rideId);
  }

  clearChat(rideId: number): void {
    log.info("ChatService", "Clearing chat", { rideId });
    useChatStore.getState().clearChat(rideId);
  }

  // Message formatting utilities
  formatMessagePreview(message: string, maxLength: number = 50): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + "...";
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return timestamp.toLocaleDateString();
  }

  // Message validation
  validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: "Message cannot be empty" };
    }

    if (message.length > 1000) {
      return {
        isValid: false,
        error: "Message too long (max 1000 characters)",
      };
    }

    return { isValid: true };
  }

  // Typing indicator management
  private typingTimeouts: Map<number, number> = new Map();

  handleUserTyping(rideId: number): void {
    // Clear existing timeout
    const existingTimeout = this.typingTimeouts.get(rideId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Send typing start
    this.sendTypingIndicator(rideId, true);

    // Set timeout to stop typing indicator
    const timeout = setTimeout(() => {
      this.sendTypingIndicator(rideId, false);
      this.typingTimeouts.delete(rideId);
    }, 3000); // Stop typing after 3 seconds of inactivity

    this.typingTimeouts.set(rideId, timeout);
  }

  stopUserTyping(rideId: number): void {
    const timeout = this.typingTimeouts.get(rideId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(rideId);
    }

    this.sendTypingIndicator(rideId, false);
  }

  // Cleanup method
  cleanup(): void {
    log.info("ChatService", "Cleaning up chat service");

    // Clear all typing timeouts
    this.typingTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.typingTimeouts.clear();
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();

export default chatService;
