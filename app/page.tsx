'use client'
import { useState } from 'react'
import { DropZone } from '@/components/drop-zone'
import { FileList } from '@/components/file-list'
import { MergeButton } from '@/components/merge-button'
import { SkippedList } from '@/components/skipped-list'
import { type SkippedFile } from '@/lib/merge'
import type { PdfItem } from '@/lib/types'

export default function Page() {
  const [items, setItems] = useState<PdfItem[]>([])
  const [skipped, setSkipped] = useState<SkippedFile[]>([])

  const addItems = (added: PdfItem[]): void => {
    setItems((prev) => [...prev, ...added])
    setSkipped([])
  }
  const removeItem = (id: string): void => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setSkipped([])
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">pdf-merger</h1>
        <p className="opacity-70">Merge PDFs in your browser. Nothing is uploaded.</p>
      </header>

      <DropZone onAdd={addItems} />

      {items.length > 0 && (
        <>
          <FileList items={items} onReorder={setItems} onRemove={removeItem} />
          <MergeButton items={items} onSkipped={setSkipped} />
        </>
      )}

      <SkippedList skipped={skipped} />

      <footer className="text-center text-xs opacity-50">100% client-side · your files never leave this page</footer>
    </main>
  )
}
