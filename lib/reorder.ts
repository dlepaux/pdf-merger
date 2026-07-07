import { arrayMove } from '@dnd-kit/sortable'
import type { PdfItem } from './types'

/** Move the item with `activeId` to where `overId` sits. Unchanged if either is absent. */
export function reorder(items: PdfItem[], activeId: string, overId: string): PdfItem[] {
  const from = items.findIndex((i) => i.id === activeId)
  const to = items.findIndex((i) => i.id === overId)
  if (from === -1 || to === -1) return items
  return arrayMove(items, from, to)
}
