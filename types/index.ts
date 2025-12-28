// API Response Types

export interface MediaFile {
    filename: string
    size: number
    extension: string
    createdAt?: string
    modifiedAt?: string
}

export interface FilesResponse {
    files: MediaFile[]
    total: number
}

export interface AudioTrack {
    index: number
    codec: string
    channels: number
    channelLayout?: string
    sampleRate?: number
    bitRate?: number
    language?: string
    title?: string
}

export interface VideoTrack {
    index: number
    codec: string
    width: number
    height: number
    frameRate?: number
    bitRate?: number
}

export interface SubtitleTrack {
    index: number
    codec: string
    language?: string
    title?: string
}

export interface MediaMetadata {
    filename: string
    duration: number
    format: string
    size: number
    video?: VideoTrack
    audio?: AudioTrack[]
    subtitles?: SubtitleTrack[]
    has51Audio: boolean
}

// Component Props Types

export interface FileListProps {
    files: MediaFile[]
    selectedFile: MediaFile | null
    onSelectFile: (file: MediaFile) => void
    isLoading: boolean
    error: string | null
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export interface VideoPlayerProps {
    filename: string | null
    metadata: MediaMetadata | null
    isLoading: boolean
    error: string | null
    onError: (error: string) => void
}

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
export const API_ENDPOINTS = {
    files: `${API_BASE_URL}/api/files`,
    stream: (filename: string) => `${API_BASE_URL}/api/stream/${encodeURIComponent(filename)}`,
    metadata: (filename: string) => `${API_BASE_URL}/api/metadata/${encodeURIComponent(filename)}`
} as const

// Utility Types
export type FileExtension =
    | "mp4"
    | "mkv"
    | "avi"
    | "mov"
    | "webm"
    | "flv"
    | "wmv"
    | "m4v"
    | "ts"
    | "unknown"

export interface ApiError {
    message: string
    status?: number
}
