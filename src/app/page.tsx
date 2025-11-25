'use client';

import { FileList, VideoPlayer } from '@/components';
import { useMediaFiles } from '@/hooks/useMediaFiles';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Music, 
  FileVideo,
  Keyboard
} from 'lucide-react';

export default function Home() {
  const {
    files,
    selectedFile,
    metadata,
    isLoadingFiles,
    isLoadingMetadata,
    filesError,
    metadataError,
    selectFile,
  } = useMediaFiles();

  const [playerError, setPlayerError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Web Media Player
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mt-1">
          Stream your media files with ease
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
          <VideoPlayer
            filename={selectedFile?.filename || null}
            metadata={metadata}
            isLoading={isLoadingMetadata}
            error={metadataError || playerError}
            onError={setPlayerError}
          />
          
          {/* Video Info */}
          {selectedFile && metadata && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg truncate" title={selectedFile.filename}>
                  {selectedFile.filename}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {metadata.video && (
                    <div className="flex items-center gap-1.5">
                      <Monitor className="w-4 h-4" />
                      <span>{metadata.video.width}x{metadata.video.height}</span>
                    </div>
                  )}
                  {metadata.audio && metadata.audio.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <FileVideo className="w-4 h-4" />
                      <span>{metadata.audio.length} audio track{metadata.audio.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {metadata.has51Audio && (
                    <div className="flex items-center gap-1.5 text-yellow-500">
                      <Music className="w-4 h-4" />
                      <span>5.1 Surround</span>
                    </div>
                  )}
                  {metadata.format && (
                    <Badge variant="secondary" className="uppercase font-mono text-xs">
                      {metadata.format}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* File List Section */}
        <div className="lg:col-span-4 xl:col-span-3 order-1 lg:order-2 h-[300px] lg:h-[calc(100vh-200px)]">
          <FileList
            files={files}
            selectedFile={selectedFile}
            onSelectFile={selectFile}
            isLoading={isLoadingFiles}
            error={filesError}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <Card className="mt-8">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs flex-wrap justify-center">
            <Keyboard className="w-4 h-4" />
            <span className="font-semibold">Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space/K</kbd> Play/Pause
            <span className="text-muted-foreground/50">•</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">J/←</kbd> -10s
            <span className="text-muted-foreground/50">•</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">L/→</kbd> +10s
            <span className="text-muted-foreground/50">•</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑/↓</kbd> Volume
            <span className="text-muted-foreground/50">•</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">F</kbd> Fullscreen
            <span className="text-muted-foreground/50">•</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">M</kbd> Mute
            <span className="text-muted-foreground/50">•</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">0-9</kbd> Seek
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
