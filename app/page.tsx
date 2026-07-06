'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore, Message } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StreamResponse {
  type: 'model' | 'content' | 'done' | 'error';
  model?: string;
  content?: string;
  message?: string;
}

export default function GaiaChat() {
  const {
    getCurrentConversation,
    createConversation,
    addMessage,
    updateMessage,
    isLoading,
    setIsLoading,
    showModelInfo,
    theme,
  } = useChatStore();

  const [isListening, setIsListening] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = getCurrentConversation();
  const messages = currentConversation?.messages || [];

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        toast.error('Voice recognition failed');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening...');
    }
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    let conversationId = currentConversation?.id;

    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = createConversation();
    }

    // Add user message
    const userMessage: Omit<Message, 'id' | 'timestamp'> = {
      role: 'user',
      content,
    };
    addMessage(conversationId, userMessage);

    // Start assistant message placeholder
    const assistantPlaceholder: Omit<Message, 'id' | 'timestamp'> = {
      role: 'assistant',
      content: '',
    };
    addMessage(conversationId, assistantPlaceholder);
    const lastMessage = useChatStore.getState().getMessages().slice(-1)[0];

    setIsLoading(true);
    setCurrentModel(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: useChatStore.getState().getMessages().slice(0, -1).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: StreamResponse = JSON.parse(line.slice(6));

                if (data.type === 'model' && data.model) {
                  setCurrentModel(data.model);
                  // Update the message with model info
                  if (lastMessage) {
                    updateMessage(conversationId, lastMessage.id, assistantContent);
                  }
                } else if (data.type === 'content' && data.content) {
                  assistantContent += data.content;
                  if (lastMessage) {
                    updateMessage(conversationId, lastMessage.id, assistantContent);
                  }
                } else if (data.type === 'done') {
                  if (lastMessage) {
                    // Final update with model
                    const finalMessage = { ...lastMessage, content: assistantContent };
                    // Store will be updated via the updateMessage
                  }
                } else if (data.type === 'error') {
                  throw new Error(data.message || 'Unknown error');
                }
              } catch (e) {
                // Skip parsing errors for incomplete chunks
              }
            }
          }
        }
      }

      // Update final message with model
      if (lastMessage && currentModel) {
        // The message already has the content, we just need to ensure it's persisted
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.info('Message cancelled');
      } else {
        toast.error(error.message || 'Failed to send message');
        // Remove the empty assistant message on error
        if (lastMessage && lastMessage.content === '') {
          // We should remove this message, but the store doesn't support removal yet
        }
      }
    } finally {
      setIsLoading(false);
      setCurrentModel(null);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header - Coach Style */}
        <div className="coach-header px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {currentConversation?.title || 'Training Session'}
            </h2>
            <p className="text-sm text-white/80">
              Seasoned Testing Coach • Direct • Actionable
            </p>
          </div>
          {currentModel && showModelInfo && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Coach:</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white font-medium">{currentModel}</span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto chat-container px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-color to-accent-hover flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">G</span>
              </div>
              <h1 className="text-3xl font-semibold mb-3">Welcome to GAIA</h1>
              <p className="text-lg text-text-secondary mb-8">
                Your personal AI mentor for Software Testing & Test Automation excellence
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "Start a Playwright project",
                  "Explain POM pattern",
                  "Prep for QA interview",
                  "Best React testing tool?"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="suggestion-card p-3 text-left rounded-lg border border-border-color hover:bg-bg-secondary transition-all text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  showModel={showModelInfo}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          isListening={isListening}
          onVoiceToggle={recognitionRef.current ? handleVoiceToggle : undefined}
        />
      </div>
    </div>
  );
}