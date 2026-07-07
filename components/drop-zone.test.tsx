import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { DropZone } from './drop-zone'

function pdf(name: string): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: 'application/pdf' })
}

test('reads picked PDFs into items and calls onAdd', async () => {
  const onAdd = vi.fn()
  const { container } = render(<DropZone onAdd={onAdd} />)
  const input = container.querySelector('input[type="file"]') as HTMLInputElement

  await userEvent.upload(input, [pdf('a.pdf'), pdf('b.pdf')])

  await waitFor(() => expect(onAdd).toHaveBeenCalledOnce())
  const items = onAdd.mock.calls[0][0]
  expect(items.map((i: { name: string }) => i.name)).toEqual(['a.pdf', 'b.pdf'])
  expect(items[0].id).toBeTruthy()
  expect(items[0].bytes).toBeInstanceOf(Uint8Array)
})

test('ignores non-PDF files', async () => {
  const onAdd = vi.fn()
  const { container } = render(<DropZone onAdd={onAdd} />)
  const input = container.querySelector('input[type="file"]') as HTMLInputElement

  await userEvent.upload(input, new File(['hi'], 'notes.txt', { type: 'text/plain' }))

  await waitFor(() => expect(onAdd).not.toHaveBeenCalled())
})
