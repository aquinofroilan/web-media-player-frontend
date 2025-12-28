import { type FileExtension } from "@/types"

export function getFileExtension(filename: string): FileExtension {
    const ext = filename.split(".").pop()?.toLowerCase()
    const validExtensions: FileExtension[] = [
        "mp4",
        "mkv",
        "avi",
        "mov",
        "webm",
        "flv",
        "wmv",
        "m4v",
        "ts"
    ]

    if (ext && validExtensions.includes(ext as FileExtension)) {
        return ext as FileExtension
    }
    return "unknown"
}

export function getExtensionColor(extension: FileExtension): string {
    const colors: Record<FileExtension, string> = {
        mp4: "bg-blue-500",
        mkv: "bg-purple-500",
        avi: "bg-yellow-500",
        mov: "bg-green-500",
        webm: "bg-red-500",
        flv: "bg-orange-500",
        wmv: "bg-cyan-500",
        m4v: "bg-indigo-500",
        ts: "bg-pink-500",
        unknown: "bg-gray-500"
    }

    return colors[extension]
}

export function getExtensionIcon(extension: FileExtension): string {
    const icons: Record<FileExtension, string> = {
        mp4: "🎬",
        mkv: "📦",
        avi: "🎞️",
        mov: "🍎",
        webm: "🌐",
        flv: "⚡",
        wmv: "🪟",
        m4v: "📱",
        ts: "📺",
        unknown: "📄"
    }

    return icons[extension]
}

export function truncateFilename(filename: string, maxLength: number = 40): string {
    if (filename.length <= maxLength) return filename

    const ext = filename.split(".").pop() || ""
    const name = filename.slice(0, filename.length - ext.length - 1)

    // Ensure we have enough room for at least some characters + "..." + extension
    const minNameLength = 3
    const availableSpace = maxLength - ext.length - 4 // 4 = "..." + "."

    if (availableSpace < minNameLength) {
        // If extension is too long, just truncate the whole filename
        return filename.slice(0, maxLength - 3) + "..."
    }

    const truncatedName = name.slice(0, availableSpace) + "..."
    return `${truncatedName}.${ext}`
}
