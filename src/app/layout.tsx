import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Media Player",
  description: "A modern media player for streaming video files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
