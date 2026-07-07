import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { PDFDocument } from '@cantoo/pdf-lib'
import Page from './page'

vi.mock('@/lib/download', () => ({ downloadBytes: vi.fn() }))
import { downloadBytes } from '@/lib/download'

async function realPdf(name: string): Promise<File> {
  const doc = await PDFDocument.create()
  doc.addPage([100, 100])
  // Same @types/node vs lib.dom BlobPart typing mismatch documented in lib/download.ts.
  return new File([(await doc.save()) as BlobPart], name, { type: 'application/pdf' })
}

afterEach(() => vi.clearAllMocks())

test('drop two PDFs, list them, merge, and download', async () => {
  const { container } = render(<Page />)
  const input = container.querySelector('input[type="file"]') as HTMLInputElement

  await userEvent.upload(input, [await realPdf('a.pdf'), await realPdf('b.pdf')])

  await waitFor(() => expect(screen.getByText('a.pdf')).toBeInTheDocument())
  expect(screen.getByText('b.pdf')).toBeInTheDocument()

  const merge = screen.getByRole('button', { name: /Merge 2 PDFs/ })
  expect(merge).toBeEnabled()
  await userEvent.click(merge)

  await waitFor(() => expect(downloadBytes).toHaveBeenCalledOnce())
})
