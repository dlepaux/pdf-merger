import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { MergeButton } from './merge-button'
import type { PdfItem } from '@/lib/types'

vi.mock('@/lib/merge', () => ({
  mergePdfs: vi.fn(async () => ({ bytes: new Uint8Array([9]), merged: ['a.pdf', 'b.pdf'], skipped: [] })),
}))
vi.mock('@/lib/download', () => ({ downloadBytes: vi.fn() }))

import { mergePdfs } from '@/lib/merge'
import { downloadBytes } from '@/lib/download'

const item = (id: string): PdfItem => ({ id, name: `${id}.pdf`, size: 1, bytes: new Uint8Array([1]) })

afterEach(() => vi.clearAllMocks())

test('is disabled with fewer than two items', () => {
  render(<MergeButton items={[item('a')]} onSkipped={vi.fn()} />)
  expect(screen.getByRole('button')).toBeDisabled()
})

test('merges, downloads, and reports skipped on click', async () => {
  const onSkipped = vi.fn()
  render(<MergeButton items={[item('a'), item('b')]} onSkipped={onSkipped} />)
  await userEvent.click(screen.getByRole('button'))
  await waitFor(() => expect(downloadBytes).toHaveBeenCalledOnce())
  expect(mergePdfs).toHaveBeenCalledOnce()
  expect(downloadBytes).toHaveBeenCalledWith(new Uint8Array([9]), 'merged.pdf')
  expect(onSkipped).toHaveBeenLastCalledWith([])
})
