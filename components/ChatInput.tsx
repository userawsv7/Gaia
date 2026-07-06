'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Mic, MicOff, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
  isListening?: boolean;
  onVoiceToggle?: () => void;
}

export function ChatInput({
  onSend,
  disabled = false,
  isListening = false,
  onVoiceToggle
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((!input.trim() && files.length === 0) || disabled) return;

    let message = input.trim();
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      message = message ? `${message}\n\n[Attached files: ${fileNames}]` : `[Attached files: ${fileNames}]`;
    }

    onSend(message, files);
    setInput('');
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border-color bg-bg-primary p-4">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-bg-tertiary px-3 py-1.5 rounded-lg text-sm"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="max-w-[200px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-text-muted hover:text-error-color transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="file-upload"
          disabled={disabled}
          title="Attach files"
        >
          <Paperclip className="w-4 h-4" />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </button>

        {onVoiceToggle && (
          <button
            onClick={onVoiceToggle}
            className={`file-upload ${isListening ? 'voice-active' : ''}`}
            disabled={disabled}
            title={isListening ? 'Stop recording' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about testing, automation, or anything QA-related..."
            className="chat-input w-full px-4 py-3 pr-12 bg-bg-secondary border border-border-color rounded-2xl text-text-primary placeholder-text-muted resize-none overflow-hidden focus:border-accent-color"
            disabled={disabled}
            rows={1}
          />
          <button
            onClick={handleSubmit}
            disabled={(!input.trim() && files.length === 0) || disabled}
            className="absolute right-2 bottom-2 p-2 rounded-xl bg-accent-color text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-xs text-text-muted mt-2 text-center">
        GAIA specializes in Software Testing & Automation • Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}