import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'TruthLens AI - Food Scanner',
  description: 'AI-Native food analyzer for EnCode 2026 Hackathon',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <div className="flex items-center justify-center min-h-screen w-full bg-zinc-950">
          {/* Mobile Container - Enforces Mobile View on Desktop */}
          <div className="relative w-full max-w-[430px] min-h-screen bg-black border-l border-r border-zinc-800 shadow-2xl">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
