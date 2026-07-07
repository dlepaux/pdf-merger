import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'pdf-merger — merge PDFs in your browser',
  description: 'Merge PDF files entirely in your browser. Nothing is uploaded.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-200">{children}</body>
    </html>
  )
}
