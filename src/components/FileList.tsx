'use client';

import { type MediaFile, type FileListProps } from '@/types';
import { cn, formatFileSize, getFileExtension, getExtensionColor, truncateFilename } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileVideo, 
  Film, 
  AlertCircle, 
  RefreshCw,
  Check,
  FolderOpen
} from 'lucide-react';

function getExtensionIcon(extension: string) {
  switch (extension) {
    case 'mp4':
    case 'webm':
    case 'm4v':
      return <FileVideo className="h-4 w-4" />;
    case 'mkv':
    case 'avi':
    case 'mov':
    case 'flv':
    case 'wmv':
    case 'ts':
      return <Film className="h-4 w-4" />;
    default:
      return <FileVideo className="h-4 w-4" />;
  }
}

function FileItem({ 
  file, 
  isSelected, 
  onSelect 
}: { 
  file: MediaFile; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  const extension = getFileExtension(file.filename);
  const extensionColor = getExtensionColor(extension);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-3 rounded-lg transition-all duration-200 text-left",
        "flex items-center gap-3 group border",
        isSelected 
          ? "bg-primary text-primary-foreground border-primary" 
          : "bg-card hover:bg-accent border-border"
      )}
      aria-selected={isSelected}
      role="option"
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
        extensionColor
      )}>
        {getExtensionIcon(extension)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate text-sm",
          isSelected ? "text-primary-foreground" : "text-foreground"
        )} title={file.filename}>
          {truncateFilename(file.filename)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[10px] uppercase font-mono h-5",
              isSelected && "bg-primary-foreground/20 text-primary-foreground"
            )}
          >
            {extension}
          </Badge>
          <span className={cn(
            "text-xs",
            isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {formatFileSize(file.size)}
          </span>
        </div>
      </div>

      <div className={cn(
        "flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center",
        isSelected 
          ? "bg-primary-foreground border-primary-foreground" 
          : "border-muted-foreground/30 group-hover:border-muted-foreground"
      )}>
        {isSelected && <Check className="h-3 w-3 text-primary" />}
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">No media files</h3>
      <p className="text-sm text-muted-foreground">
        No video files were found on the server.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-2 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">Failed to load files</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export default function FileList({ 
  files, 
  selectedFile, 
  onSelectFile, 
  isLoading, 
  error 
}: FileListProps & { onRetry?: () => void }) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Media Files</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Media Files</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ErrorState message={error} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Media Files</CardTitle>
          <Badge variant="secondary">{files.length} files</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        {files.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea className="h-full">
            <div 
              className="p-4 pt-0 space-y-2"
              role="listbox"
              aria-label="Media files"
            >
              {files.map((file) => (
                <FileItem
                  key={file.filename}
                  file={file}
                  isSelected={selectedFile?.filename === file.filename}
                  onSelect={() => onSelectFile(file)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
