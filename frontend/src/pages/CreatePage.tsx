import { useState } from 'react';
import { Sparkles, Image, Video, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AnimatedHeading from '../components/AnimatedHeading';
import ImageGenerator from '../components/ImageGenerator';
import VideoGenerator from '../components/VideoGenerator';
import PhotoUploader from '../components/PhotoUploader';
import VideoUploader from '../components/VideoUploader';

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-neon-violet" />
        <AnimatedHeading text="Create" variant="gradient" as="h1" className="text-2xl font-bold" />
      </div>

      {/* Mode Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 border border-border w-full">
          <TabsTrigger
            value="generate"
            className="flex-1 flex items-center gap-2 data-[state=active]:bg-neon-violet/20 data-[state=active]:text-neon-violet"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="flex-1 flex items-center gap-2 data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
          >
            <Upload className="w-4 h-4" />
            Upload Media
          </TabsTrigger>
        </TabsList>

        {/* AI Generation Tab */}
        <TabsContent value="generate" className="mt-6 space-y-8">
          {/* Image Generation */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-neon-violet/20 border border-neon-violet/30 flex items-center justify-center">
                <Image className="w-4 h-4 text-neon-violet" />
              </div>
              <div>
                <h2 className="font-orbitron font-semibold text-sm text-neon-violet">Image Generation</h2>
                <p className="text-xs text-muted-foreground">Create stunning images from text prompts</p>
              </div>
            </div>
            <div className="card-dark rounded-2xl p-5 border border-neon-violet/15">
              <ImageGenerator />
            </div>
          </section>

          <Separator className="border-neon-violet/10" />

          {/* Video Generation */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center">
                <Video className="w-4 h-4 text-neon-cyan" />
              </div>
              <div>
                <h2 className="font-orbitron font-semibold text-sm text-neon-cyan">Video Generation</h2>
                <p className="text-xs text-muted-foreground">Generate short video clips from descriptions</p>
              </div>
            </div>
            <div className="card-dark rounded-2xl p-5 border border-neon-cyan/15">
              <VideoGenerator />
            </div>
          </section>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-6 space-y-8">
          {/* Photo Upload */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-neon-violet/20 border border-neon-violet/30 flex items-center justify-center">
                <Image className="w-4 h-4 text-neon-violet" />
              </div>
              <div>
                <h2 className="font-orbitron font-semibold text-sm text-neon-violet">Share a Photo</h2>
                <p className="text-xs text-muted-foreground">Upload and share photos to your profile</p>
              </div>
            </div>
            <div className="card-dark rounded-2xl p-5 border border-neon-violet/15">
              <PhotoUploader />
            </div>
          </section>

          <Separator className="border-neon-violet/10" />

          {/* Video Upload */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center">
                <Video className="w-4 h-4 text-neon-cyan" />
              </div>
              <div>
                <h2 className="font-orbitron font-semibold text-sm text-neon-cyan">Share a Video</h2>
                <p className="text-xs text-muted-foreground">Upload and share videos to your profile</p>
              </div>
            </div>
            <div className="card-dark rounded-2xl p-5 border border-neon-cyan/15">
              <VideoUploader />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
