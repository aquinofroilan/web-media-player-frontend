"use client"

import { useState, useEffect, useCallback } from "react"
import { type MediaFile, type MediaMetadata, type ApiError } from "../types"
import { apiClient } from "@/lib/api"

interface UseMediaFilesReturn {
    files: MediaFile[]
    selectedFile: MediaFile | null
    metadata: MediaMetadata | null
    isLoadingFiles: boolean
    isLoadingMetadata: boolean
    filesError: string | null
    metadataError: string | null
    selectFile: (file: MediaFile) => void
    refreshFiles: () => Promise<void>
    clearError: () => void
}

export function useMediaFiles(): UseMediaFilesReturn {
    const [files, setFiles] = useState<MediaFile[]>([])
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
    const [metadata, setMetadata] = useState<MediaMetadata | null>(null)
    const [isLoadingFiles, setIsLoadingFiles] = useState(true)
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
    const [filesError, setFilesError] = useState<string | null>(null)
    const [metadataError, setMetadataError] = useState<string | null>(null)

    const fetchFiles = useCallback(async () => {
        setIsLoadingFiles(true)
        setFilesError(null)

        try {
            const response = await apiClient.getFiles()
            setFiles(response.files)
        } catch (error) {
            const apiError = error as ApiError
            setFilesError(apiError.message || "Failed to fetch files")
            setFiles([])
        } finally {
            setIsLoadingFiles(false)
        }
    }, [])

    const fetchMetadata = useCallback(async (filename: string) => {
        setIsLoadingMetadata(true)
        setMetadataError(null)

        try {
            const response = await apiClient.getMetadata(filename)
            setMetadata(response)
        } catch (error) {
            const apiError = error as ApiError
            setMetadataError(apiError.message || "Failed to fetch metadata")
            setMetadata(null)
        } finally {
            setIsLoadingMetadata(false)
        }
    }, [])

    const selectFile = useCallback(
        (file: MediaFile) => {
            setSelectedFile(file)
            setMetadata(null)
            setMetadataError(null)
            fetchMetadata(file.filename)
        },
        [fetchMetadata]
    )

    const clearError = useCallback(() => {
        setFilesError(null)
        setMetadataError(null)
    }, [])

    // Fetch files on mount
    useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

    return {
        files,
        selectedFile,
        metadata,
        isLoadingFiles,
        isLoadingMetadata,
        filesError,
        metadataError,
        selectFile,
        refreshFiles: fetchFiles,
        clearError
    }
}
