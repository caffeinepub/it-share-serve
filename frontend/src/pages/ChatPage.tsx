import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGetContacts, useGetConversation, useSendMessage } from '../hooks/useQueries';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';

export default function ChatPage() {
  const params = useParams({ strict: false }) as { username?: string };
  const partnerUsername = params.username;
  const navigate = useNavigate();
  const { username: myUsername } = useAuth();
  const { data: contacts = [] } = useGetContacts(myUsername || '');

  const [selectedPartner, setSelectedPartner] = useState<string | null>(partnerUsername || null);

  useEffect(() => {
    if (partnerUsername) setSelectedPartner(partnerUsername);
  }, [partnerUsername]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Contacts sidebar */}
      <div className={`${selectedPartner ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-border/50 bg-card/30`}>
        <div className="p-4 border-b border-border/50">
          <h2 className="font-orbitron font-bold text-lg gradient-neon-text">Messages</h2>
          <p className="text-muted-foreground text-xs mt-1">{contacts.length} contacts</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <MessageCircle size={32} className="text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">No contacts yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Add contacts to start chatting</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {contacts.map((contact) => (
                <button
                  key={contact.username}
                  onClick={() => {
                    setSelectedPartner(contact.username);
                    navigate({ to: '/chat/$username', params: { username: contact.username } });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${
                    selectedPartner === contact.username
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-secondary/50'
                  }`}
                  style={
                    selectedPartner === contact.username
                      ? { borderColor: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)20' }
                      : {}
                  }
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
                      color: 'var(--background)',
                    }}
                  >
                    {contact.displayName[0]?.toUpperCase() || contact.username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">{contact.displayName}</div>
                    <div className="text-muted-foreground text-xs truncate">@{contact.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`${selectedPartner ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedPartner ? (
          <ChatConversation
            myUsername={myUsername || ''}
            partnerUsername={selectedPartner}
            onBack={() => {
              setSelectedPartner(null);
              navigate({ to: '/contacts' });
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--neon-cyan)20, var(--neon-violet)20)',
                border: '1px solid var(--neon-cyan)40',
              }}
            >
              <MessageCircle size={36} style={{ color: 'var(--neon-cyan)' }} />
            </div>
            <h3 className="font-orbitron font-bold text-xl gradient-neon-text mb-2">Start a Conversation</h3>
            <p className="text-muted-foreground text-sm">Select a contact to begin chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatConversation({
  myUsername,
  partnerUsername,
  onBack,
}: {
  myUsername: string;
  partnerUsername: string;
  onBack: () => void;
}) {
  const { data: messages = [], refetch } = useGetConversation(myUsername, partnerUsername);
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(() => refetch(), 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !myUsername) return;
    await sendMessage.mutateAsync({ sender: myUsername, receiver: partnerUsername, text });
    refetch();
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="md:hidden p-2 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-violet))',
            color: 'var(--background)',
          }}
        >
          {partnerUsername[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-foreground">@{partnerUsername}</div>
          <div className="text-xs" style={{ color: 'var(--neon-green)' }}>● Online</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} myUsername={myUsername} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-card/30">
        <MessageInput onSend={handleSend} isLoading={sendMessage.isPending} />
      </div>
    </>
  );
}
