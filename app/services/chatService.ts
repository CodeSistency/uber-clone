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

  async sendMessage(rideId: number, message: string): Promise<void> {
    try {
      console.log("[ChatService] Sending message:", { rideId, message });

      // Send via WebSocket
      websocketService.sendMessage(rideId, message);

      // Optimistically add to local store
      const tempMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        rideId,
        senderId: "current_user", // This should come from auth
        senderType: "passenger", // This should be determined from user role
        message,
        messageType: "text",
        timestamp: new Date(),
        isRead: true, // Own messages are always read
      };

      useChatStore.getState().addMessage(tempMessage);
    } catch (error) {
      console.error("[ChatService] Failed to send message:", error);
      throw error;
    }
  }

  async markMessagesRead(rideId: number): Promise<void> {
    try {
      console.log("[ChatService] Marking messages as read:", rideId);

      useChatStore.getState().markMessagesRead(rideId);

      // TODO: Send to server to mark as read
      // This would typically be an API call or WebSocket message
    } catch (error) {
      console.error("[ChatService] Failed to mark messages as read:", error);
      throw error;
    }
  }

  async loadMessageHistory(
    rideId: number,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    try {
      console.log("[ChatService] Loading message history:", { rideId, limit });

      // TODO: Load from API
      // const messages = await this.apiService.getChatHistory(rideId, limit);

      // For now, return empty array
      const messages: ChatMessage[] = [];

      // Load into store
      useChatStore.getState().loadMessages(rideId, messages);

      return messages;
    } catch (error) {
      console.error("[ChatService] Failed to load message history:", error);
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
      console.error("[ChatService] Failed to send typing indicator:", error);
      throw error;
    }
  }

  async shareLocation(rideId: number, location: LocationData): Promise<void> {
    try {
      console.log("[ChatService] Sharing location:", { rideId, location });

      const locationMessage: ChatMessage = {
        id: `location_${Date.now()}`,
        rideId,
        senderId: "current_user",
        senderType: "passenger",
        message: `📍 Location shared: ${location.latitude}, ${location.longitude}`,
        messageType: "location",
        timestamp: new Date(),
        isRead: true,
      };

      // Add to local store
      useChatStore.getState().addMessage(locationMessage);

      // TODO: Send location via WebSocket or API
      // websocketService.shareLocation(rideId, location);
    } catch (error) {
      console.error("[ChatService] Failed to share location:", error);
      throw error;
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
    console.log("[ChatService] Setting active chat:", rideId);
    useChatStore.getState().setActiveChat(rideId);
  }

  clearChat(rideId: number): void {
    console.log("[ChatService] Clearing chat:", rideId);
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
    console.log("[ChatService] Cleaning up...");

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
