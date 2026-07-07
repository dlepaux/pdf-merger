'use client'
import { useRef, useState, type DragEvent } from 'react'
import type { PdfItem } from '@/lib/types'

type Props = { onAdd: (items: PdfItem[]) => void }

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

async function toItem(file: File): Promise<PdfItem> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  return { id: crypto.randomUUID(), name: file.name, size: file.size, bytes }
}

export function DropZone({ onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  async function ingest(files: FileList | null): Promise<void> {
    if (!files) return
    const items = await Promise.all(Array.from(files).filter(isPdf).map(toItem))
    if (items.length > 0) onAdd(items)
  }

  return (
    <div
      onDragOver={(e: DragEvent) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault()
        setDragging(false)
        void ingest(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-box border-2 border-dashed p-10 text-center transition-colors ${
        dragging ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-100'
      }`}
    >
      <p className="text-lg font-medium">Drop PDFs here</p>
      <p className="text-sm opacity-70">or click to choose files</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          void ingest(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
