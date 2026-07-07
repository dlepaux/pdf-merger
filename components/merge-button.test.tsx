import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { MergeButton } from './merge-button'
import type { PdfItem } from '@/lib/types'

vi.mock('@/lib/merge', () => ({
  mergePdfs: vi.fn(async () => ({ bytes: new Uint8Array([9]), merged: ['a.pdf', 'b.pdf'], skipped: [] })),
}))
vi.mock('@/lib/download', () => ({ downloadBytes: vi.fn() }))

import { mergePdfs } from '@/lib/merge'
import { downloadBytes } from '@/lib/download'

const item = (id: string): PdfItem => ({ id, name: `${id}.pdf`, size: 1, bytes: new Uint8Array([1]) })

// clearAllMocks (afterEach) wipes the mock's default resolved value, so re-seed the
// happy-path baseline before each test. Per-test overrides use *Once to take precedence.
beforeEach(() => {
  vi.mocked(mergePdfs).mockResolvedValue({ bytes: new Uint8Array([9]), merged: ['a.pdf', 'b.pdf'], skipped: [] })
})

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

test('disables the button while merging, re-enables when done', async () => {
  let resolveMerge: (result: { bytes: Uint8Array; merged: string[]; skipped: [] }) => void = () => {}
  vi.mocked(mergePdfs).mockReturnValueOnce(
    new Promise((resolve) => {
      resolveMerge = resolve
    }),
  )
  render(<MergeButton items={[item('a'), item('b')]} onSkipped={vi.fn()} />)
  const button = screen.getByRole('button')
  await userEvent.click(button)
  await waitFor(() => expect(button).toBeDisabled())

  resolveMerge({ bytes: new Uint8Array([9]), merged: ['a.pdf', 'b.pdf'], skipped: [] })
  await waitFor(() => expect(button).not.toBeDisabled())
})

test('shows the empty-result message and does not download when nothing merges', async () => {
  vi.mocked(mergePdfs).mockResolvedValueOnce(null)
  render(<MergeButton items={[item('a'), item('b')]} onSkipped={vi.fn()} />)
  await userEvent.click(screen.getByRole('button'))
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent(/every file was corrupt or password-locked/),
  )
  expect(downloadBytes).not.toHaveBeenCalled()
})

test('shows a failure message and does not download when merge throws', async () => {
  vi.mocked(mergePdfs).mockRejectedValueOnce(new Error('boom'))
  render(<MergeButton items={[item('a'), item('b')]} onSkipped={vi.fn()} />)
  await userEvent.click(screen.getByRole('button'))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Merge failed: boom/))
  expect(downloadBytes).not.toHaveBeenCalled()
})
