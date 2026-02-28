import React from 'react';
import { Message } from '../backend';

interface MessageListProps {
  messages: Message[];
  myUsername: string;
}

export default function MessageList({ messages, myUsername }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <p className="text-muted-foreground text-sm">No messages yet</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Send a message to start the conversation</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, i) => {
        const isMine = msg.senderUsername === myUsername;
        const time = new Date(Number(msg.timestamp) / 1_000_000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            {!isMine && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mr-2 self-end"
                style={{ background: 'linear-gradient(135deg, var(--neon-violet), var(--neon-pink))', color: 'var(--background)' }}
              >
                {msg.senderUsername[0]?.toUpperCase()}
              </div>
            )}
            <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div
                className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  isMine
                    ? {
                        background: 'linear-gradient(135deg, var(--neon-cyan)30, var(--neon-violet)30)',
                        border: '1px solid var(--neon-cyan)40',
                        color: 'var(--foreground)',
                        borderRadius: '18px 18px 4px 18px',
                      }
                    : {
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        borderRadius: '18px 18px 18px 4px',
                      }
                }
              >
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground/60 px-1">{time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
