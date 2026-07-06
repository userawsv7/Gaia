import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  selectedModel: string | null;
  theme: 'light' | 'dark';
  showModelInfo: boolean;

  // Actions
  createConversation: () => string;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  setIsLoading: (loading: boolean) => void;
  setSelectedModel: (model: string | null) => void;
  toggleTheme: () => void;
  setShowModelInfo: (show: boolean) => void;

  // Getters
  getCurrentConversation: () => Conversation | null;
  getMessages: () => Message[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      selectedModel: null,
      theme: 'dark',
      showModelInfo: true,

      createConversation: () => {
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const newConversation: Conversation = {
          id,
          title: 'New Conversation',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));

        return id;
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },

      addMessage: (conversationId, message) => {
        const messageWithId: Message = {
          ...message,
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          timestamp: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              const updatedMessages = [...conv.messages, messageWithId];
              // Auto-generate title from first user message
              let title = conv.title;
              if (conv.messages.length === 0 && message.role === 'user') {
                title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
              }
              return {
                ...conv,
                messages: updatedMessages,
                title,
                updatedAt: new Date(),
              };
            }
            return conv;
          }),
        }));
      },

      updateMessage: (conversationId, messageId, content) => {
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: conv.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, content } : msg
                ),
                updatedAt: new Date(),
              };
            }
            return conv;
          }),
        }));
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter((conv) => conv.id !== id);
          const newCurrentId =
            state.currentConversationId === id
              ? newConversations.length > 0
                ? newConversations[0].id
                : null
              : state.currentConversationId;

          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          };
        });
      },

      clearAllConversations: () => {
        set({
          conversations: [],
          currentConversationId: null,
        });
      },

      setIsLoading: (loading) => set({ isLoading: loading }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setShowModelInfo: (show) => set({ showModelInfo: show }),

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get();
        return conversations.find((conv) => conv.id === currentConversationId) || null;
      },

      getMessages: () => {
        const current = get().getCurrentConversation();
        return current?.messages || [];
      },
    }),
    {
      name: 'gaia-chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        theme: state.theme,
        showModelInfo: state.showModelInfo,
      }),
    }
  )
);