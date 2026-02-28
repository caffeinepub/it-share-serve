import React, { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
  isLoading?: boolean;
}

export default function MessageInput({ onSend, isLoading = false }: MessageInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex items-end gap-2 p-3">
      <button
        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 shrink-0"
        title="Attach file"
      >
        <Paperclip size={18} />
      </button>

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type a message..."
          rows={1}
          className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-200 resize-none"
          onFocus={(e) => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 8px var(--neon-cyan)'; }}
          onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!text.trim() || isLoading}
        className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        style={{
          background: text.trim() ? 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))' : 'var(--secondary)',
          color: text.trim() ? 'var(--background)' : 'var(--muted-foreground)',
          boxShadow: text.trim() ? '0 0 10px var(--neon-cyan)40' : 'none',
        }}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </div>
  );
}
