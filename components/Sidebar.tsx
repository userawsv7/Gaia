'use client';

import React from 'react';
import { useChatStore, Conversation } from '@/lib/store';
import { MessageCircle, Plus, Trash2, Moon, Sun, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function Sidebar() {
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    deleteConversation,
    theme,
    toggleTheme,
    showModelInfo,
    setShowModelInfo,
  } = useChatStore();

  const handleNewChat = () => {
    createConversation();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary border-r border-border-color w-72">
      {/* Header */}
      <div className="p-4 border-b border-border-color">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-text-primary">GAIA</h1>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowModelInfo(!showModelInfo)}
              className={`p-2 rounded-lg transition-colors ${
                showModelInfo ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary'
              }`}
              title="Toggle model info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs font-medium text-text-muted px-3 py-2">Conversations</div>
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center text-text-muted text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setCurrentConversation(conv.id)}
                className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-bg-tertiary'
                    : 'hover:bg-bg-tertiary/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <MessageCircle className="w-4 h-4 text-text-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-error-color/10 text-error-color transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-color">
        <div className="text-xs text-text-muted text-center">
          Specialized in Software Testing & QA Automation
        </div>
      </div>
    </div>
  );
}