import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type FileExtension } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function getFileExtension(filename: string): FileExtension {
  const ext = filename.split('.').pop()?.toLowerCase();
  const validExtensions: FileExtension[] = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', 'ts'];
  
  if (ext && validExtensions.includes(ext as FileExtension)) {
    return ext as FileExtension;
  }
  return 'unknown';
}

export function getExtensionColor(extension: FileExtension): string {
  const colors: Record<FileExtension, string> = {
    mp4: 'bg-blue-500',
    mkv: 'bg-purple-500',
    avi: 'bg-yellow-500',
    mov: 'bg-green-500',
    webm: 'bg-red-500',
    flv: 'bg-orange-500',
    wmv: 'bg-cyan-500',
    m4v: 'bg-indigo-500',
    ts: 'bg-pink-500',
    unknown: 'bg-gray-500',
  };
  
  return colors[extension];
}

export function getExtensionIcon(extension: FileExtension): string {
  const icons: Record<FileExtension, string> = {
    mp4: '🎬',
    mkv: '📦',
    avi: '🎞️',
    mov: '🍎',
    webm: '🌐',
    flv: '⚡',
    wmv: '🪟',
    m4v: '📱',
    ts: '📺',
    unknown: '📄',
  };
  
  return icons[extension];
}

export function truncateFilename(filename: string, maxLength: number = 40): string {
  if (filename.length <= maxLength) return filename;
  
  const ext = filename.split('.').pop() || '';
  const name = filename.slice(0, filename.length - ext.length - 1);
  const truncatedName = name.slice(0, maxLength - ext.length - 4) + '...';
  
  return `${truncatedName}.${ext}`;
}
