'use client'
import { useState } from 'react'
import { downloadBytes } from '@/lib/download'
import { mergePdfs, type SkippedFile } from '@/lib/merge'
import type { PdfItem } from '@/lib/types'

type Props = { items: PdfItem[]; onSkipped: (skipped: SkippedFile[]) => void }

export function MergeButton({ items, onSkipped }: Props) {
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const disabled = items.length < 2 || merging

  async function handleMerge(): Promise<void> {
    setMerging(true)
    setError(null)
    onSkipped([])
    try {
      const result = await mergePdfs(items.map((i) => ({ name: i.name, bytes: i.bytes })))
      if (result) {
        downloadBytes(result.bytes, 'merged.pdf')
        onSkipped(result.skipped)
      } else {
        setError('No PDF could be merged — every file was corrupt or password-locked.')
      }
    } catch (err) {
      setError(`Merge failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setMerging(false)
    }
  }

  const label = merging ? null : items.length < 2 ? 'Add at least 2 PDFs' : `Merge ${items.length} PDFs → download`

  return (
    <div className="w-full">
      <button className="btn btn-primary btn-lg w-full" disabled={disabled} onClick={() => void handleMerge()}>
        {merging ? <span className="loading loading-spinner" aria-label="merging" /> : label}
      </button>
      {error && (
        <p role="alert" className="alert alert-error mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
