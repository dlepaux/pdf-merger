import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { FileList } from './file-list'
import type { PdfItem } from '@/lib/types'

const item = (id: string, name: string): PdfItem => ({ id, name, size: 2048, bytes: new Uint8Array() })

test('renders one row per item with name and size', () => {
  render(<FileList items={[item('a', 'a.pdf'), item('b', 'b.pdf')]} onReorder={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByText('a.pdf')).toBeInTheDocument()
  expect(screen.getByText('b.pdf')).toBeInTheDocument()
  expect(screen.getAllByText('2.0 KB')).toHaveLength(2)
})

test('clicking remove calls onRemove with the item id', async () => {
  const onRemove = vi.fn()
  render(<FileList items={[item('a', 'a.pdf')]} onReorder={vi.fn()} onRemove={onRemove} />)
  await userEvent.click(screen.getByRole('button', { name: 'Remove a.pdf' }))
  expect(onRemove).toHaveBeenCalledWith('a')
})
