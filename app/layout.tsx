import type { Metadata } from "next"
import "./globals.css"
import { Inter} from "next/font/google"

export const metadata: Metadata = {
    title: "Web Media Player",
    description: "A modern media player for streaming video files"
}

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "700"] })

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en'>
            <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    )
}
