import { useState, useRef } from 'react';
import { Send, Image, Video, X } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  onSendPhoto: (file: File) => Promise<void>;
  onSendVideo: (file: File) => Promise<void>;
  isSending: boolean;
}

export default function MessageInput({ onSendMessage, onSendPhoto, onSendVideo, isSending }: MessageInputProps) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ file: File; type: 'photo' | 'video' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (selectedFile) {
      setIsUploading(true);
      try {
        if (selectedFile.type === 'photo') {
          await onSendPhoto(selectedFile.file);
        } else {
          await onSendVideo(selectedFile.file);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    await onSendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (file: File, type: 'photo' | 'video') => {
    setSelectedFile({ file, type });
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const isDisabled = isSending || isUploading;

  return (
    <div className="p-3">
      {/* File Preview */}
      {selectedFile && previewUrl && (
        <div className="mb-3 relative inline-block">
          {selectedFile.type === 'photo' ? (
            <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-neon-violet/30" />
          ) : (
            <video src={previewUrl} className="h-20 w-20 object-cover rounded-xl border border-neon-cyan/30" />
          )}
          <button
            onClick={clearFile}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Photo Button */}
        <button
          onClick={() => photoInputRef.current?.click()}
          disabled={isDisabled}
          className="w-9 h-9 rounded-xl border border-neon-violet/30 flex items-center justify-center text-neon-violet hover:bg-neon-violet/10 transition-all disabled:opacity-50 flex-shrink-0"
        >
          <Image className="w-4 h-4" />
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'photo')}
        />

        {/* Video Button */}
        <button
          onClick={() => videoInputRef.current?.click()}
          disabled={isDisabled}
          className="w-9 h-9 rounded-xl border border-neon-cyan/30 flex items-center justify-center text-neon-cyan hover:bg-neon-cyan/10 transition-all disabled:opacity-50 flex-shrink-0"
        >
          <Video className="w-4 h-4" />
        </button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'video')}
        />

        {/* Text Input */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedFile ? 'Add a caption...' : 'Type a message...'}
          disabled={isDisabled}
          rows={1}
          className="input-neon flex-1 rounded-xl px-4 py-2.5 text-sm resize-none min-h-[40px] max-h-[120px] disabled:opacity-50"
          style={{ height: 'auto' }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isDisabled || (!text.trim() && !selectedFile)}
          className="w-9 h-9 rounded-xl btn-neon-violet flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDisabled ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
