import { useState, useRef } from 'react';
import { ExternalBlob } from '../backend';
import { useShareVideo } from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';
import { Upload, Video, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface VideoUploaderProps {
  onUploaded?: () => void;
}

export default function VideoUploader({ onUploaded }: VideoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const shareVideo = useShareVideo();
  const { username } = useAuth();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !username) return;
    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(pct => setProgress(pct));
      await shareVideo.mutateAsync({ username, blob });
      toast.success('Video uploaded successfully!');
      setPreview(null);
      setSelectedFile(null);
      setProgress(0);
      onUploaded?.();
    } catch {
      toast.error('Failed to upload video');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setProgress(0);
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-neon-cyan/30 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-neon-cyan/60 hover:bg-neon-cyan/5 transition-all"
        >
          <Video className="w-8 h-8 text-neon-cyan opacity-60" />
          <span className="text-sm text-muted-foreground">Click to select a video</span>
          <span className="text-xs text-muted-foreground">MP4, WebM, MOV</span>
        </button>
      ) : (
        <div className="relative">
          <video src={preview} className="w-full rounded-xl max-h-48 border border-neon-cyan/30 bg-black" controls />
          <button
            onClick={clearSelection}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      {selectedFile && (
        <div className="space-y-2">
          {shareVideo.isPending && (
            <Progress value={progress} className="h-1.5" />
          )}
          <button
            onClick={handleUpload}
            disabled={shareVideo.isPending}
            className="w-full btn-neon-cyan rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {shareVideo.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Uploading {progress > 0 ? `${progress}%` : '...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Share Video
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
