import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetCallerContacts, useGetConversation, useSendMessage, useSharePhoto, useShareVideo } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { type UserProfile, ExternalBlob } from '../backend';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedHeading from '../components/AnimatedHeading';
import { toast } from 'sonner';

export default function ChatPage() {
  const params = useParams({ from: '/layout/chat/$contactId' });
  const contactId = params.contactId;

  const { identity } = useInternetIdentity();
  const { data: contacts = [] } = useGetCallerContacts();

  // Find contact by username (contactId is username)
  const contact = contacts.find(c => c.username === contactId);

  // We need the principal to fetch conversation — but we only have UserProfile
  // The chat routing uses username, but getConversation needs Principal
  // Since we can't get principal from UserProfile, we'll show a message
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: messages = [], isLoading } = useGetConversation(undefined);
  const sendMessage = useSendMessage();
  const sharePhoto = useSharePhoto();
  const shareVideo = useShareVideo();

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <div className="text-4xl mb-4">💬</div>
        <p className="font-medium">Contact not found</p>
        <p className="text-sm mt-1">This user may not be in your contacts</p>
        <Link to="/contacts" className="mt-4 btn-neon-violet rounded-xl px-4 py-2 text-sm">
          Go to Contacts
        </Link>
      </div>
    );
  }

  const avatarUrl = contact.profilePic?.getDirectURL() || contact.avatarUrl;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] max-w-3xl mx-auto">
      {/* Chat Header */}
      <div className="card-dark rounded-t-2xl border border-neon-violet/20 px-4 py-3 flex items-center gap-3">
        <Link to="/contacts" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Avatar className="w-9 h-9 border border-neon-violet/30">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-secondary text-xs font-orbitron text-neon-violet">
            {contact.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{contact.displayName}</p>
          <p className="text-xs text-neon-green">● Online</p>
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-neon-violet hover:border-neon-violet/40 transition-all">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-neon-violet hover:border-neon-violet/40 transition-all">
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notice about principal limitation */}
      <div className="bg-neon-violet/5 border-x border-neon-violet/20 px-4 py-2 text-xs text-muted-foreground text-center">
        Chat with <span className="text-neon-violet">@{contact.username}</span> · #{String(contact.profileNumber).padStart(5, '0')}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden border-x border-neon-violet/20 bg-background/50">
        <MessageList
          messages={messages}
          myPrincipal={myPrincipal || ''}
          isLoading={isLoading}
          contactName={contact.displayName}
          contactAvatar={avatarUrl}
        />
      </div>

      {/* Input */}
      <div className="card-dark rounded-b-2xl border border-neon-violet/20 border-t-0">
        <MessageInput
          onSendMessage={async (text) => {
            toast.info('Direct messaging requires principal ID lookup. Feature coming soon.');
          }}
          onSendPhoto={async (file) => {
            try {
              const bytes = new Uint8Array(await file.arrayBuffer());
              const blob = ExternalBlob.fromBytes(bytes);
              await sharePhoto.mutateAsync(blob);
              toast.success('Photo shared!');
            } catch {
              toast.error('Failed to share photo');
            }
          }}
          onSendVideo={async (file) => {
            try {
              const bytes = new Uint8Array(await file.arrayBuffer());
              const blob = ExternalBlob.fromBytes(bytes);
              await shareVideo.mutateAsync(blob);
              toast.success('Video shared!');
            } catch {
              toast.error('Failed to share video');
            }
          }}
          isSending={sendMessage.isPending}
        />
      </div>
    </div>
  );
}
