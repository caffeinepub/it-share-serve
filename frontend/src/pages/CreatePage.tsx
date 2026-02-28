import React, { useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Image, Video, Upload } from 'lucide-react';
import ImageGenerator from '../components/ImageGenerator';
import VideoGenerator from '../components/VideoGenerator';
import PhotoUploader from '../components/PhotoUploader';
import VideoUploader from '../components/VideoUploader';
import DailyChallengeWidget from '../components/DailyChallengeWidget';
import AnimatedHeading from '../components/AnimatedHeading';

export default function CreatePage() {
  const imageGeneratorRef = useRef<{ setPrompt: (p: string) => void } | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border/50">
        <AnimatedHeading
          text="Create"
          variant="shimmer"
          className="text-2xl font-orbitron font-bold mb-1"
        />
        <p className="text-muted-foreground text-sm">Generate and share amazing content</p>
      </div>

      <div className="px-4 py-4">
        {/* Daily Challenge Widget */}
        <div className="mb-6">
          <DailyChallengeWidget
            onUsePrompt={(prompt) => {
              imageGeneratorRef.current?.setPrompt(prompt);
            }}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="generate-image" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-secondary/30 rounded-xl p-1 mb-6 h-auto">
            {[
              { value: 'generate-image', icon: Image, label: 'AI Image' },
              { value: 'generate-video', icon: Video, label: 'AI Video' },
              { value: 'upload-photo', icon: Upload, label: 'Photo' },
              { value: 'upload-video', icon: Upload, label: 'Video' },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Icon size={16} />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="generate-image">
            <ImageGenerator ref={imageGeneratorRef} />
          </TabsContent>
          <TabsContent value="generate-video">
            <VideoGenerator />
          </TabsContent>
          <TabsContent value="upload-photo">
            <PhotoUploader />
          </TabsContent>
          <TabsContent value="upload-video">
            <VideoUploader />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
