import { create } from "zustand";
import { ChatMessage } from "@/types/type";

// Chat Store Interface
interface ChatStore {
  messages: ChatMessage[];
  activeChat: number | null; // rideId
  unreadMessages: Record<number, number>;
  isTyping: boolean;

  // Actions
  addMessage: (message: ChatMessage) => void;
  setActiveChat: (rideId: number) => void;
  markMessagesRead: (rideId: number) => void;
  setTyping: (isTyping: boolean) => void;
  clearChat: (rideId: number) => void;
  loadMessages: (rideId: number, messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  activeChat: null,
  unreadMessages: {},
  isTyping: false,

  addMessage: (message: ChatMessage) => {
    set((state) => {
      const existingMessages = state.messages.filter(
        (m) => m.rideId === message.rideId,
      );
      const newMessages = [...existingMessages, message];

      const newUnreadMessages = { ...state.unreadMessages };
      if (
        message.rideId &&
        message.rideId !== state.activeChat &&
        !message.isRead
      ) {
        newUnreadMessages[message.rideId] =
          (newUnreadMessages[message.rideId] || 0) + 1;
      }

      return {
        messages: state.messages
          .filter((m) => m.rideId !== message.rideId)
          .concat(newMessages),
        unreadMessages: newUnreadMessages,
      };
    });
  },

  setActiveChat: (rideId: number) => {
    set((state) => ({
      activeChat: rideId,
      unreadMessages: {
        ...state.unreadMessages,
        [rideId]: 0, // Clear unread count for this chat
      },
    }));
  },

  markMessagesRead: (rideId: number) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.rideId === rideId ? { ...message, isRead: true } : message,
      ),
      unreadMessages: {
        ...state.unreadMessages,
        [rideId]: 0,
      },
    }));
  },

  setTyping: (isTyping: boolean) => {
    set(() => ({ isTyping }));
  },

  clearChat: (rideId: number) => {
    set((state) => ({
      messages: state.messages.filter((message) => message.rideId !== rideId),
      unreadMessages: {
        ...state.unreadMessages,
        [rideId]: 0,
      },
    }));
  },

  loadMessages: (rideId: number, messages: ChatMessage[]) => {
    set((state) => ({
      messages: state.messages
        .filter((m) => m.rideId !== rideId)
        .concat(messages),
    }));
  },
}));
