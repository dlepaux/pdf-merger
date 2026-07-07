import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Analytics } from '@/components/analytics'
import './globals.css'

export const metadata: Metadata = {
  title: 'pdf-merger — merge PDFs in your browser',
  description:
    'Merge PDF files in your browser — drop, reorder, download. Your files never leave your device.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-200">{children}</body>
      <Analytics />
    </html>
  )
}
