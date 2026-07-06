'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/lib/store';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  showModel?: boolean;
}

export function ChatMessage({ message, showModel = true }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-enter`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-accent-color' : 'bg-bg-tertiary'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-text-primary" />
          )}
        </div>

        <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`message-bubble px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-user-bubble text-white rounded-tr-sm'
              : 'bg-assistant-bubble text-text-primary rounded-tl-sm'
          }`}>
            <div className="markdown-content prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return inline ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {message.model && showModel && !isUser && (
            <span className="model-badge text-xs opacity-70">
              {message.model}
            </span>
          )}

          <span className="text-xs text-text-muted">
            {new Intl.DateTimeFormat('en', {
              hour: 'numeric',
              minute: '2-digit'
            }).format(new Date(message.timestamp))}
          </span>
        </div>
      </div>
    </div>
  );
}