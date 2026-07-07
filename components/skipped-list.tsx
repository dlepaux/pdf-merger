import { type SkippedFile } from '@/lib/merge'
import { friendlyReason } from '@/lib/skip-reason'

type Props = { skipped: SkippedFile[] }

export function SkippedList({ skipped }: Props) {
  if (skipped.length === 0) return null
  return (
    <ul className="flex flex-col gap-2">
      {skipped.map((s) => (
        <li key={s.name} role="alert" className="alert alert-warning">
          <span>
            ⚠ {s.name} — {friendlyReason(s.reason)}, skipped
          </span>
        </li>
      ))}
    </ul>
  )
}
