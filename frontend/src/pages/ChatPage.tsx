import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useGetConversation, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import type { Message } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { partnerUsername } = useParams({ from: '/layout/chat/$partnerUsername' });
  const navigate = useNavigate();
  const { username } = useAuth();
  const [messageText, setMessageText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: partnerProfile } = useGetUserProfile(partnerUsername);
  const { data: messages = [], isLoading } = useGetConversation(username, partnerUsername);
  const sendMessage = useSendMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !username) return;
    try {
      await sendMessage.mutateAsync({
        sender: username,
        receiver: partnerUsername,
        text: messageText.trim(),
      });
      setMessageText('');
    } catch (err: any) {
      console.error('Failed to send message:', err.message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const partnerDisplayName = partnerProfile?.displayName || partnerUsername;
  const partnerInitials = partnerDisplayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/contacts' })}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Avatar>
          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
            {partnerInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">{partnerDisplayName}</p>
          <p className="text-xs text-muted-foreground">@{partnerUsername}</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="space-y-3 px-1">
            {messages.map((msg: Message, i: number) => {
              const isOwn = msg.senderUsername === username;
              return (
                <div
                  key={i}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border text-foreground rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(Number(msg.timestamp) / 1_000_000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Input
          placeholder="Type a message…"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sendMessage.isPending}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={sendMessage.isPending || !messageText.trim()}
        >
          {sendMessage.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
