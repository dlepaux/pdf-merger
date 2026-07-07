'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatBytes } from '@/lib/format'
import type { PdfItem } from '@/lib/types'

type Props = { item: PdfItem; onRemove: (id: string) => void }

export function FileCard({ item, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-box bg-base-100 p-3 shadow-sm">
      <button
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${item.name}`}
        className="btn btn-ghost btn-sm cursor-grab px-2"
      >
        ⠿
      </button>
      <span className="flex-1 truncate font-medium">{item.name}</span>
      <span className="text-sm opacity-60">{formatBytes(item.size)}</span>
      <button
        aria-label={`Remove ${item.name}`}
        className="btn btn-ghost btn-sm text-error"
        onClick={() => onRemove(item.id)}
      >
        ✕
      </button>
    </li>
  )
}
