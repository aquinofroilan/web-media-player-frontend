"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { type VideoPlayerProps, type MediaMetadata, API_BASE_URL } from "@/types"
import { apiClient } from "@/lib/api"
import { cn, formatDuration } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Volume1,
    Maximize,
    Minimize,
    AlertCircle,
    Loader2,
    RefreshCw,
    PlayCircle,
    Music
} from "lucide-react"

function AudioBadge({ metadata }: { metadata: MediaMetadata | null }) {
    if (!metadata?.has51Audio) return null

    return (
        <Badge variant='warning' className='gap-1'>
            <Music className='h-3 w-3' />
            5.1
        </Badge>
    )
}

function SeekBar({
    currentTime,
    duration,
    onSeek
}: {
    currentTime: number
    duration: number
    onSeek: (time: number) => void
}) {
    const [hoverTime, setHoverTime] = useState<number | null>(null)
    const progressBarRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!progressBarRef.current) return
            const rect = progressBarRef.current.getBoundingClientRect()
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            setHoverTime(percent * duration)
        },
        [duration]
    )

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!progressBarRef.current) return
            const rect = progressBarRef.current.getBoundingClientRect()
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            onSeek(percent * duration)
        },
        [duration, onSeek]
    )

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div className='flex-1 group relative'>
            <div
                ref={progressBarRef}
                className='h-1.5 bg-muted rounded-full cursor-pointer group-hover:h-2 transition-all relative'
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverTime(null)}>
                <div
                    className='h-full bg-primary rounded-full relative transition-all'
                    style={{ width: `${progress}%` }}>
                    <div className='absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md' />
                </div>
            </div>
            {hoverTime !== null && (
                <div
                    className='absolute bottom-full mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md transform -translate-x-1/2 pointer-events-none'
                    style={{ left: `${(hoverTime / duration) * 100}%` }}>
                    {formatDuration(hoverTime)}
                </div>
            )}
        </div>
    )
}

function VolumeControl({
    volume,
    setVolume,
    isMuted,
    setIsMuted
}: {
    volume: number
    setVolume: (v: number) => void
    isMuted: boolean
    setIsMuted: (m: boolean) => void
}) {
    const [showSlider, setShowSlider] = useState(false)

    const VolumeIcon =
        isMuted || volume === 0 ? VolumeX
        : volume < 0.5 ? Volume1
        : Volume2

    return (
        <TooltipProvider>
            <div
                className='relative flex items-center'
                onMouseEnter={() => setShowSlider(true)}
                onMouseLeave={() => setShowSlider(false)}
                onFocus={() => setShowSlider(true)}
                onBlur={e => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setShowSlider(false)
                    }
                }}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => setIsMuted(!isMuted)}
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'>
                            <VolumeIcon className='h-5 w-5' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMuted ? "Unmute (M)" : "Mute (M)"}</TooltipContent>
                </Tooltip>

                {showSlider && (
                    <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-popover rounded-lg shadow-lg border'>
                        <Slider
                            value={[isMuted ? 0 : volume * 100]}
                            onValueChange={([val]) => {
                                setVolume(val / 100)
                                if (isMuted && val > 0) {
                                    setIsMuted(false)
                                }
                            }}
                            max={100}
                            step={5}
                            className='w-24'
                            orientation='horizontal'
                            aria-label='Volume'
                        />
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}

interface ControlsProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    setVolume: (volume: number) => void
    isMuted: boolean
    setIsMuted: (muted: boolean) => void
    isFullscreen: boolean
    toggleFullscreen: () => void
    togglePlayPause: () => void
    onSeek: (time: number) => void
    metadata: MediaMetadata | null
}

function Controls({
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isFullscreen,
    toggleFullscreen,
    togglePlayPause,
    onSeek,
    metadata
}: ControlsProps) {
    return (
        <TooltipProvider>
            <div className='absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/60 to-transparent p-4 pt-12'>
                <div className='flex items-center gap-4 mb-3'>
                    <SeekBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
                    <span className='text-xs text-muted-foreground font-mono whitespace-nowrap'>
                        {formatDuration(currentTime)} / {formatDuration(duration)}
                    </span>
                </div>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={togglePlayPause}
                                    variant='ghost'
                                    size='icon'
                                    className='h-9 w-9'>
                                    {isPlaying ?
                                        <Pause className='h-5 w-5' />
                                    :   <Play className='h-5 w-5' />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isPlaying ? "Pause (K)" : "Play (K)"}</TooltipContent>
                        </Tooltip>

                        <VolumeControl
                            volume={volume}
                            setVolume={setVolume}
                            isMuted={isMuted}
                            setIsMuted={setIsMuted}
                        />

                        <AudioBadge metadata={metadata} />
                    </div>

                    <div className='flex items-center gap-1'>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={toggleFullscreen}
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8'>
                                    {isFullscreen ?
                                        <Minimize className='h-5 w-5' />
                                    :   <Maximize className='h-5 w-5' />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}

function LoadingOverlay() {
    return (
        <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
            <div className='flex flex-col items-center gap-3'>
                <Loader2 className='h-12 w-12 animate-spin text-primary' />
                <span className='text-sm text-muted-foreground'>Loading video...</span>
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div className='absolute inset-0 flex items-center justify-center bg-card'>
            <div className='text-center'>
                <div className='w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4'>
                    <PlayCircle className='w-10 h-10 text-muted-foreground' />
                </div>
                <h3 className='text-lg font-medium text-muted-foreground mb-2'>
                    No video selected
                </h3>
                <p className='text-sm text-muted-foreground/70'>
                    Select a file from the list to start playback
                </p>
            </div>
        </div>
    )
}

function ErrorOverlay({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className='absolute inset-0 flex items-center justify-center bg-card'>
            <div className='text-center'>
                <div className='w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <AlertCircle className='w-10 h-10 text-destructive' />
                </div>
                <h3 className='text-lg font-medium text-foreground mb-2'>Playback Error</h3>
                <p className='text-sm text-muted-foreground mb-4'>{message}</p>
                {onRetry && (
                    <Button onClick={onRetry} variant='outline' size='sm'>
                        <RefreshCw className='h-4 w-4 mr-2' />
                        Try Again
                    </Button>
                )}
            </div>
        </div>
    )
}

export default function VideoPlayer({
    filename,
    metadata,
    isLoading: isMetadataLoading,
    error: metadataError,
    onError
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [startTime, setStartTime] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isVideoLoading, setIsVideoLoading] = useState(false)
    const [videoError, setVideoError] = useState<string | null>(null)
    const [showControls, setShowControls] = useState(true)

    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isPlayingRef = useRef(isPlaying)
    const resumeOnLoadRef = useRef(false)

    useEffect(() => {
        isPlayingRef.current = isPlaying
    }, [isPlaying])

    // Reset state when filename changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStartTime(0)
        setCurrentTime(0)
        setDuration(0)
        setIsPlaying(false)
    }, [filename])

    const streamUrl = useMemo(() => {
        if (!filename) return null
        const baseUrl = apiClient.getStreamUrl(filename)
        const url = metadata?.has51Audio ? `${baseUrl}?transcode=true` : baseUrl
        return startTime > 0 ?
                `${url}${url.includes("?") ? "&" : "?"}startTime=${Math.floor(startTime)}`
            :   url
    }, [filename, metadata?.has51Audio, startTime])

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(console.error)
        } else {
            document.exitFullscreen().catch(console.error)
        }
    }, [])

    const togglePlayPause = useCallback(() => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
    }, [isPlaying])

    const handleSeek = useCallback(
        (time: number) => {
            if (!videoRef.current) return

            if (metadata?.has51Audio) {
                setStartTime(time)
                setCurrentTime(time)
            } else {
                videoRef.current.currentTime = time
            }
        },
        [metadata?.has51Audio]
    )

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!videoRef.current || !filename) return

            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return
            }

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault()
                    togglePlayPause()
                    break
                case "arrowleft":
                case "j":
                    e.preventDefault()
                    if (metadata?.has51Audio) {
                        const currentTotalTime = startTime + videoRef.current.currentTime
                        const newTime = Math.max(0, currentTotalTime - 10)
                        setStartTime(newTime)
                        setCurrentTime(newTime)
                    } else {
                        videoRef.current.currentTime = Math.max(
                            0,
                            videoRef.current.currentTime - 10
                        )
                    }
                    break
                case "arrowright":
                case "l":
                    e.preventDefault()
                    if (metadata?.has51Audio) {
                        const currentTotalTime = startTime + videoRef.current.currentTime
                        const newTime = Math.min(duration, currentTotalTime + 10)
                        setStartTime(newTime)
                        setCurrentTime(newTime)
                    } else {
                        videoRef.current.currentTime = Math.min(
                            duration,
                            videoRef.current.currentTime + 10
                        )
                    }
                    break
                case "arrowup":
                    e.preventDefault()
                    setVolume(v => Math.min(1, v + 0.1))
                    setIsMuted(false)
                    break
                case "arrowdown":
                    e.preventDefault()
                    setVolume(v => Math.max(0, v - 0.1))
                    break
                case "f":
                    e.preventDefault()
                    toggleFullscreen()
                    break
                case "m":
                    e.preventDefault()
                    setIsMuted(m => !m)
                    break
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    e.preventDefault()
                    const percent = parseInt(e.key) / 10
                    const newTime = duration * percent
                    if (metadata?.has51Audio) {
                        setStartTime(newTime)
                        setCurrentTime(newTime)
                    } else {
                        videoRef.current.currentTime = newTime
                    }
                    break
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [duration, filename, toggleFullscreen, togglePlayPause, metadata?.has51Audio, startTime])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume
            videoRef.current.muted = isMuted
        }
    }, [volume, isMuted])

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true)

            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }

            if (isPlaying) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false)
                }, 3000)
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener("mousemove", handleMouseMove)
            return () => {
                container.removeEventListener("mousemove", handleMouseMove)
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current)
                }
            }
        }
    }, [isPlaying])

    useEffect(() => {
        if (videoRef.current && streamUrl) {
            console.log("Stream URL changed, reloading:", streamUrl)
            if (isPlayingRef.current) {
                resumeOnLoadRef.current = true
            }
            videoRef.current.load()
        }
    }, [streamUrl])

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(startTime + videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            console.log("Video loaded metadata:")
            console.log("- Duration:", videoRef.current.duration)
            console.log("- Metadata Duration:", metadata?.duration)
            console.log("- ReadyState:", videoRef.current.readyState)
            console.log(
                "- Seekable:",
                videoRef.current.seekable.length > 0 ?
                    `${videoRef.current.seekable.start(0)} - ${videoRef.current.seekable.end(0)}`
                :   "none"
            )
            console.log("- Src:", videoRef.current.currentSrc)

            if (metadata?.duration) {
                setDuration(metadata.duration)
            } else {
                setDuration(videoRef.current.duration)
            }
            setIsVideoLoading(false)
        }
    }

    const handleDurationChange = () => {
        if (videoRef.current) {
            console.log("Duration change:", videoRef.current.duration)
            if (!metadata?.duration) {
                setDuration(videoRef.current.duration)
            }
        }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => {
        setIsPlaying(false)
        resumeOnLoadRef.current = false
    }
    const handleWaiting = () => setIsVideoLoading(true)
    const handleCanPlay = () => {
        setIsVideoLoading(false)
        if (resumeOnLoadRef.current) {
            console.log("Resuming playback after load")
            videoRef.current?.play().catch(console.error)
            resumeOnLoadRef.current = false
        }
    }

    const handleVideoError = () => {
        const errorMessage = "Failed to load video. Please try again."
        setVideoError(errorMessage)
        setIsVideoLoading(false)
        onError(errorMessage)
    }

    const handleLoadStart = () => {
        setIsVideoLoading(true)
        setVideoError(null)
    }

    const handleRetry = () => {
        setVideoError(null)
        if (videoRef.current && streamUrl) {
            videoRef.current.load()
        }
    }

    const hasError = metadataError || videoError
    const isLoading = isMetadataLoading || isVideoLoading

    if (!filename) {
        return (
            <Card className='aspect-video relative overflow-hidden'>
                <EmptyState />
            </Card>
        )
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "bg-black rounded-xl overflow-hidden relative group",
                isFullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-video"
            )}>
            <video
                ref={videoRef}
                className='w-full h-full'
                onClick={togglePlayPause}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onDurationChange={handleDurationChange}
                onPlay={handlePlay}
                onPause={handlePause}
                onWaiting={handleWaiting}
                onCanPlay={handleCanPlay}
                onError={handleVideoError}
                onLoadStart={handleLoadStart}
                preload='auto'
                playsInline>
                {streamUrl && <source src={streamUrl} type='video/mp4' />}
                {filename && (
                    <track
                        label='English'
                        kind='subtitles'
                        srcLang='en'
                        src={`${API_BASE_URL}/api/subtitles/${encodeURIComponent(filename)}`}
                        default
                    />
                )}
            </video>

            {isLoading && !hasError && <LoadingOverlay />}

            {hasError && (
                <ErrorOverlay
                    message={metadataError || videoError || "An error occurred"}
                    onRetry={handleRetry}
                />
            )}

            {!hasError && (
                <div
                    className={cn(
                        "transition-opacity duration-300",
                        showControls ? "opacity-100" : "opacity-0"
                    )}>
                    <Controls
                        videoRef={videoRef}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        duration={duration}
                        volume={volume}
                        setVolume={setVolume}
                        isMuted={isMuted}
                        setIsMuted={setIsMuted}
                        isFullscreen={isFullscreen}
                        toggleFullscreen={toggleFullscreen}
                        togglePlayPause={togglePlayPause}
                        onSeek={handleSeek}
                        metadata={metadata}
                    />
                </div>
            )}
        </div>
    )
}
