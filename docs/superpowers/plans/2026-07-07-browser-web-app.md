# Browser-side pdf-merger web app — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Node watch-folder service with a 100% client-side Next.js web app — drop PDFs, drag to reorder, one button merges and auto-downloads — hosted static on GitHub Pages at `pdf-merger.lepaux.com`.

**Architecture:** Single static-exported Next.js App Router page, all client-side. A pure `lib/merge.ts` (bytes in, bytes out) wraps `@cantoo/pdf-lib`; React components handle drop, sortable reorder (dnd-kit), merge, and download. No API routes, no network calls after page load.

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`), React 19, TypeScript, Tailwind CSS v4 + DaisyUI 5, `@dnd-kit`, `@cantoo/pdf-lib`, Vitest + React Testing Library.

## Global Constraints

- Node >= 18.18 (Next 15 floor). ESM only — no CommonJS.
- Tailwind CSS v4: **no `tailwind.config.js`** (deprecated). Config lives in CSS via `@import "tailwindcss"` + `@plugin "daisyui"`.
- 100% client-side: zero network requests after initial load. No analytics, no uploads. This is a hard product guarantee.
- File naming: kebab-case (repo + user convention). React component *exports* stay PascalCase; their *files* are kebab-case (`drop-zone.tsx` → `export function DropZone`).
- Import alias: `@/` maps to repo root.
- Tests: Vitest (`vitest run`). Co-locate `*.test.ts(x)` next to source.
- Conventional commits (`feat:`, `chore:`, `test:`, `docs:`).
- Problem-file parity with the old service: auto-decrypt owner-password PDFs (empty user password), skip corrupt + user-password-locked files with a visible warning.

## File Structure

```
pdf-merger/                       (repo root = the Next app)
  app/
    layout.tsx                    html/body shell, imports globals.css, metadata
    page.tsx                      'use client' — holds state, composes components
    globals.css                   @import tailwindcss; @plugin daisyui
  components/
    drop-zone.tsx                 DropZone — drop target + file picker
    file-card.tsx                 FileCard — one sortable row (useSortable)
    file-list.tsx                 FileList — dnd-kit sortable list
    merge-button.tsx              MergeButton — merge + download trigger
    skipped-list.tsx              SkippedList — post-merge warnings
  lib/
    merge.ts                      pure merge core (bytes in, bytes out)
    types.ts                      PdfItem UI type
    format.ts                     formatBytes helper
    reorder.ts                    pure reorder(items, activeId, overId)
    skip-reason.ts                friendlyReason(raw) classifier
    download.ts                   downloadBytes(bytes, filename)
  public/
    CNAME                         pdf-merger.lepaux.com
  .github/workflows/deploy.yml    build → export → deploy to Pages
  next.config.ts
  postcss.config.mjs
  vitest.config.ts
  vitest.setup.ts
  tsconfig.json                   (rewritten for Next/React)
  package.json                    (rewritten)
  .gitignore                      (rewritten)
  README.md                       (rewritten)
```

**Removed** (old service): `src/` entirely (`index.ts`, `service.ts`, `log.ts`, `merge.ts`, all `*.test.ts`, `fixtures.test-helper.ts`), plus the `chokidar` dependency. The merge logic and encrypted-fixture helpers are reborn in `lib/merge.ts` and `lib/merge.test.ts`.

---

### Task 1: Scaffold the Next app (Tailwind v4 + DaisyUI + Vitest), remove old service

**Files:**
- Delete: `src/` (all files), old `package.json` scripts/deps, old `tsconfig.json`
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`, `.gitignore`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Test: `app/page.test.tsx`

**Interfaces:**
- Produces: a building, static-exportable Next app with a placeholder page and a green Vitest run. Later tasks add `lib/` and `components/` and flesh out `app/page.tsx`.

- [ ] **Step 1: Remove the old service and its dependency**

```bash
git rm -r src
npm uninstall chokidar
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "pdf-merger",
  "version": "0.3.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=18.18" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "preview": "npx serve out",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@cantoo/pdf-lib": "^2.7.1",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.15.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "daisyui": "^5.0.0",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.8.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "skipLibCheck": true,
    "allowJs": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out", ".next"]
}
```

- [ ] **Step 4: Write `next.config.ts`, `postcss.config.mjs`, `.gitignore`**

`next.config.ts`:
```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
```

`postcss.config.mjs`:
```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

`.gitignore`:
```
/node_modules
/.next
/out
next-env.d.ts
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 5: Write `app/globals.css`, `app/layout.tsx`, `app/page.tsx`**

`app/globals.css`:
```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
}
```

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'pdf-merger — merge PDFs in your browser',
  description: 'Merge PDF files entirely in your browser. Nothing is uploaded.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-200">{children}</body>
    </html>
  )
}
```

`app/page.tsx` (placeholder — fleshed out in Task 8):
```tsx
export default function Page() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold">pdf-merger</h1>
    </main>
  )
}
```

- [ ] **Step 6: Write `vitest.config.ts` and `vitest.setup.ts`**

`vitest.config.ts`:
```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': new URL('.', import.meta.url).pathname } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

`vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 7: Write the smoke test `app/page.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Page from './page'

test('renders the app title', () => {
  render(<Page />)
  expect(screen.getByRole('heading', { name: 'pdf-merger' })).toBeInTheDocument()
})
```

- [ ] **Step 8: Install and verify the full chain**

```bash
npm install
npm test
npx tsc --noEmit
npm run build
```
Expected: `npm test` PASS (1 test); `tsc` no errors; `npm run build` completes and creates `out/index.html`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next static-export app, remove watch-folder service"
```

---

### Task 2: Merge core (`lib/merge.ts`)

**Files:**
- Create: `lib/merge.ts`, `lib/merge.test.ts`

**Interfaces:**
- Produces:
  - `type PdfInput = { name: string; bytes: Uint8Array }`
  - `type SkippedFile = { name: string; reason: string }`
  - `type MergeResult = { bytes: Uint8Array; merged: string[]; skipped: SkippedFile[] }`
  - `mergePdfs(inputs: PdfInput[]): Promise<MergeResult | null>` — merges in given order; skips corrupt/locked with a reason; returns `null` when nothing merged.

- [ ] **Step 1: Write the failing tests `lib/merge.test.ts`**

```ts
import { PDFDocument, PDFHeader } from '@cantoo/pdf-lib'
import { expect, test } from 'vitest'
import { mergePdfs } from './merge'

async function makePdf(widths: number[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (const w of widths) doc.addPage([w, 400])
  return doc.save()
}

// Encrypted fixture matching the production case: RC4-128 /V 2 /R 3. The cipher
// is picked from the header version, so force 1.4 — 1.7 silently switches to AES
// and stops covering the cipher real payroll files use. Empty userPassword =
// opens without a password; a non-empty one = a genuinely locked PDF.
async function makeEncryptedPdf(widths: number[], userPassword = ''): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.context.header = PDFHeader.forVersion(1, 4)
  for (const w of widths) doc.addPage([w, 400])
  doc.encrypt({ ownerPassword: 'owner-secret', userPassword })
  return doc.save()
}

const input = (name: string, bytes: Uint8Array): { name: string; bytes: Uint8Array } => ({ name, bytes })

test('concatenates pages in the given order', async () => {
  const result = await mergePdfs([
    input('01.pdf', await makePdf([111, 111])),
    input('02.pdf', await makePdf([222])),
  ])
  expect(result).not.toBeNull()
  expect(result!.merged).toEqual(['01.pdf', '02.pdf'])
  expect(result!.skipped).toEqual([])
  const doc = await PDFDocument.load(result!.bytes)
  expect(doc.getPages().map((p) => p.getWidth())).toEqual([111, 111, 222])
})

test('skips corrupt files and keeps the rest', async () => {
  const result = await mergePdfs([
    input('bad.pdf', new TextEncoder().encode('this is not a pdf')),
    input('good.pdf', await makePdf([100])),
  ])
  expect(result!.merged).toEqual(['good.pdf'])
  expect(result!.skipped).toHaveLength(1)
  expect(result!.skipped[0].name).toBe('bad.pdf')
})

test('decrypts owner-password-only PDFs (empty user password)', async () => {
  const encrypted = await makeEncryptedPdf([222])
  const raw = Buffer.from(encrypted).toString('latin1')
  expect(raw.includes('/V 2') && raw.includes('/R 3')).toBe(true) // RC4 V2/R3, not AES
  const result = await mergePdfs([
    input('plain.pdf', await makePdf([111])),
    input('enc.pdf', encrypted),
  ])
  expect(result!.merged).toEqual(['plain.pdf', 'enc.pdf'])
  expect(result!.skipped).toEqual([])
})

test('skips PDFs locked with a real user password', async () => {
  const result = await mergePdfs([
    input('locked.pdf', await makeEncryptedPdf([100], 'hunter2')),
    input('good.pdf', await makePdf([333])),
  ])
  expect(result!.merged).toEqual(['good.pdf'])
  expect(result!.skipped).toHaveLength(1)
  expect(result!.skipped[0].name).toBe('locked.pdf')
})

test('returns null when nothing is mergeable', async () => {
  expect(await mergePdfs([])).toBeNull()
  expect(await mergePdfs([input('bad.pdf', new TextEncoder().encode('garbage'))])).toBeNull()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/merge.test.ts`
Expected: FAIL — `mergePdfs` is not exported / module not found.

- [ ] **Step 3: Write `lib/merge.ts`**

```ts
import { EncryptedPDFError, PDFDocument } from '@cantoo/pdf-lib'

export type PdfInput = { name: string; bytes: Uint8Array }
export type SkippedFile = { name: string; reason: string }
export type MergeResult = { bytes: Uint8Array; merged: string[]; skipped: SkippedFile[] }

/**
 * Owner-password-only PDFs (viewable without a password, editing restricted —
 * typical for payroll slips) decrypt with the empty user password. PDFs locked
 * with a real user password still fail and are skipped.
 */
async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes)
  } catch (err) {
    if (err instanceof EncryptedPDFError) return PDFDocument.load(bytes, { password: '' })
    throw err
  }
}

/**
 * Merge inputs in the given order. Corrupt/locked files are skipped and
 * reported, never thrown — one bad file must not fail the whole merge.
 * Returns null when nothing merged.
 */
export async function mergePdfs(inputs: PdfInput[]): Promise<MergeResult | null> {
  const out = await PDFDocument.create()
  const merged: string[] = []
  const skipped: SkippedFile[] = []

  for (const item of inputs) {
    try {
      const src = await loadPdf(item.bytes)
      const pages = await out.copyPages(src, src.getPageIndices())
      for (const page of pages) out.addPage(page)
      merged.push(item.name)
    } catch (err) {
      skipped.push({ name: item.name, reason: err instanceof Error ? err.message : String(err) })
    }
  }

  if (merged.length === 0) return null
  return { bytes: await out.save(), merged, skipped }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/merge.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/merge.ts lib/merge.test.ts
git commit -m "feat: browser-side PDF merge core (bytes in, bytes out)"
```

---

### Task 3: Pure helpers (`types`, `format`, `reorder`, `skip-reason`, `download`)

**Files:**
- Create: `lib/types.ts`, `lib/format.ts`, `lib/format.test.ts`, `lib/reorder.ts`, `lib/reorder.test.ts`, `lib/skip-reason.ts`, `lib/skip-reason.test.ts`, `lib/download.ts`, `lib/download.test.ts`

**Interfaces:**
- Consumes: `PdfInput`/`SkippedFile` from `lib/merge.ts`.
- Produces:
  - `type PdfItem = { id: string; name: string; size: number; bytes: Uint8Array }`
  - `formatBytes(bytes: number): string`
  - `reorder(items: PdfItem[], activeId: string, overId: string): PdfItem[]`
  - `friendlyReason(raw: string): string`
  - `downloadBytes(bytes: Uint8Array, filename: string): void`

- [ ] **Step 1: Write `lib/types.ts` (no test — type only)**

```ts
/** A dropped PDF held in memory. `id` is stable for dnd-kit keying/reordering. */
export type PdfItem = { id: string; name: string; size: number; bytes: Uint8Array }
```

- [ ] **Step 2: Write failing tests for `format`, `reorder`, `skip-reason`, `download`**

`lib/format.test.ts`:
```ts
import { expect, test } from 'vitest'
import { formatBytes } from './format'

test('bytes below 1 KB show as B', () => expect(formatBytes(512)).toBe('512 B'))
test('KB shows one decimal', () => expect(formatBytes(1536)).toBe('1.5 KB'))
test('MB scales up', () => expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB'))
```

`lib/reorder.test.ts`:
```ts
import { expect, test } from 'vitest'
import { reorder } from './reorder'
import type { PdfItem } from './types'

const item = (id: string): PdfItem => ({ id, name: `${id}.pdf`, size: 1, bytes: new Uint8Array() })

test('moves the active item to the over item position', () => {
  const items = [item('a'), item('b'), item('c')]
  expect(reorder(items, 'a', 'c').map((i) => i.id)).toEqual(['b', 'c', 'a'])
})

test('returns items unchanged when an id is missing', () => {
  const items = [item('a'), item('b')]
  expect(reorder(items, 'a', 'zzz')).toBe(items)
})
```

`lib/skip-reason.test.ts`:
```ts
import { expect, test } from 'vitest'
import { friendlyReason } from './skip-reason'

test('encryption/password errors map to "password-locked"', () => {
  expect(friendlyReason('the PDF is encrypted')).toBe('password-locked')
  expect(friendlyReason('Incorrect password provided')).toBe('password-locked')
})

test('anything else maps to "could not be read"', () => {
  expect(friendlyReason('Failed to parse PDF document')).toBe('could not be read')
})
```

`lib/download.test.ts`:
```ts
import { afterEach, expect, test, vi } from 'vitest'
import { downloadBytes } from './download'

afterEach(() => vi.restoreAllMocks())

test('creates a blob URL, clicks an anchor with the filename, then revokes', () => {
  const createURL = vi.fn(() => 'blob:mock')
  const revokeURL = vi.fn()
  Object.defineProperty(URL, 'createObjectURL', { value: createURL, configurable: true })
  Object.defineProperty(URL, 'revokeObjectURL', { value: revokeURL, configurable: true })
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  downloadBytes(new Uint8Array([1, 2, 3]), 'merged.pdf')

  expect(createURL).toHaveBeenCalledOnce()
  expect(click).toHaveBeenCalledOnce()
  expect(revokeURL).toHaveBeenCalledWith('blob:mock')
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- lib/format.test.ts lib/reorder.test.ts lib/skip-reason.test.ts lib/download.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 4: Write the implementations**

`lib/format.ts`:
```ts
/** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(1)} ${units[unit]}`
}
```

`lib/reorder.ts`:
```ts
import { arrayMove } from '@dnd-kit/sortable'
import type { PdfItem } from './types'

/** Move the item with `activeId` to where `overId` sits. Unchanged if either is absent. */
export function reorder(items: PdfItem[], activeId: string, overId: string): PdfItem[] {
  const from = items.findIndex((i) => i.id === activeId)
  const to = items.findIndex((i) => i.id === overId)
  if (from === -1 || to === -1) return items
  return arrayMove(items, from, to)
}
```

`lib/skip-reason.ts`:
```ts
/** Turn a raw pdf-lib error message into a short, user-facing skip reason. */
export function friendlyReason(raw: string): string {
  if (/encrypt|password/i.test(raw)) return 'password-locked'
  return 'could not be read'
}
```

`lib/download.ts`:
```ts
/** Trigger a browser download of `bytes` as `filename`. */
export function downloadBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- lib/format.test.ts lib/reorder.test.ts lib/skip-reason.test.ts lib/download.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/format.ts lib/reorder.ts lib/skip-reason.ts lib/download.ts lib/*.test.ts
git commit -m "feat: add PdfItem type and format/reorder/skip-reason/download helpers"
```

---

### Task 4: DropZone component

**Files:**
- Create: `components/drop-zone.tsx`, `components/drop-zone.test.tsx`

**Interfaces:**
- Consumes: `PdfItem` from `lib/types.ts`.
- Produces: `DropZone({ onAdd }: { onAdd: (items: PdfItem[]) => void })` — reads dropped/picked `.pdf` files into `PdfItem`s (bytes via `File.arrayBuffer()`, id via `crypto.randomUUID()`), filters out non-PDFs, calls `onAdd` with the new items.

- [ ] **Step 1: Write the failing test `components/drop-zone.test.tsx`**

```tsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- components/drop-zone.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `components/drop-zone.tsx`**

```tsx
'use client'
import { useRef, useState, type DragEvent } from 'react'
import type { PdfItem } from '@/lib/types'

type Props = { onAdd: (items: PdfItem[]) => void }

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

async function toItem(file: File): Promise<PdfItem> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  return { id: crypto.randomUUID(), name: file.name, size: file.size, bytes }
}

export function DropZone({ onAdd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  async function ingest(files: FileList | null): Promise<void> {
    if (!files) return
    const items = await Promise.all(Array.from(files).filter(isPdf).map(toItem))
    if (items.length > 0) onAdd(items)
  }

  return (
    <div
      onDragOver={(e: DragEvent) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault()
        setDragging(false)
        void ingest(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-box border-2 border-dashed p-10 text-center transition-colors ${
        dragging ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-100'
      }`}
    >
      <p className="text-lg font-medium">Drop PDFs here</p>
      <p className="text-sm opacity-70">or click to choose files</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          void ingest(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- components/drop-zone.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/drop-zone.tsx components/drop-zone.test.tsx
git commit -m "feat: DropZone — read dropped/picked PDFs into items"
```

---

### Task 5: FileCard + FileList (sortable)

**Files:**
- Create: `components/file-card.tsx`, `components/file-list.tsx`, `components/file-list.test.tsx`

**Interfaces:**
- Consumes: `PdfItem` (`lib/types.ts`), `reorder` (`lib/reorder.ts`), `formatBytes` (`lib/format.ts`).
- Produces:
  - `FileCard({ item, onRemove }: { item: PdfItem; onRemove: (id: string) => void })`
  - `FileList({ items, onReorder, onRemove }: { items: PdfItem[]; onReorder: (items: PdfItem[]) => void; onRemove: (id: string) => void })`

- [ ] **Step 1: Write the failing test `components/file-list.test.tsx`**

The drag *gesture* isn't simulated (jsdom has no layout); the reorder math is already covered by `lib/reorder.test.ts`. Here we cover rendering and removal.

```tsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- components/file-list.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `components/file-card.tsx`**

```tsx
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
```

- [ ] **Step 4: Write `components/file-list.tsx`**

```tsx
'use client'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { reorder } from '@/lib/reorder'
import type { PdfItem } from '@/lib/types'
import { FileCard } from './file-card'

type Props = {
  items: PdfItem[]
  onReorder: (items: PdfItem[]) => void
  onRemove: (id: string) => void
}

export function FileList({ items, onReorder, onRemove }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(reorder(items, String(active.id), String(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <FileCard key={item.id} item={item} onRemove={onRemove} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- components/file-list.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add components/file-card.tsx components/file-list.tsx components/file-list.test.tsx
git commit -m "feat: sortable FileList with drag-reorder and remove"
```

---

### Task 6: MergeButton

**Files:**
- Create: `components/merge-button.tsx`, `components/merge-button.test.tsx`

**Interfaces:**
- Consumes: `PdfItem` (`lib/types.ts`), `mergePdfs`/`SkippedFile` (`lib/merge.ts`), `downloadBytes` (`lib/download.ts`).
- Produces: `MergeButton({ items, onSkipped }: { items: PdfItem[]; onSkipped: (skipped: SkippedFile[]) => void })` — disabled with < 2 items or while merging; on click merges, downloads `merged.pdf`, reports skipped.

- [ ] **Step 1: Write the failing test `components/merge-button.test.tsx`**

```tsx
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- components/merge-button.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `components/merge-button.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { downloadBytes } from '@/lib/download'
import { mergePdfs, type SkippedFile } from '@/lib/merge'
import type { PdfItem } from '@/lib/types'

type Props = { items: PdfItem[]; onSkipped: (skipped: SkippedFile[]) => void }

export function MergeButton({ items, onSkipped }: Props) {
  const [merging, setMerging] = useState(false)
  const disabled = items.length < 2 || merging

  async function handleMerge(): Promise<void> {
    setMerging(true)
    onSkipped([])
    try {
      const result = await mergePdfs(items.map((i) => ({ name: i.name, bytes: i.bytes })))
      if (result) {
        downloadBytes(result.bytes, 'merged.pdf')
        onSkipped(result.skipped)
      }
    } finally {
      setMerging(false)
    }
  }

  const label = merging ? null : items.length < 2 ? 'Add at least 2 PDFs' : `Merge ${items.length} PDFs → download`

  return (
    <button className="btn btn-primary btn-lg w-full" disabled={disabled} onClick={() => void handleMerge()}>
      {merging ? <span className="loading loading-spinner" aria-label="merging" /> : label}
    </button>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- components/merge-button.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/merge-button.tsx components/merge-button.test.tsx
git commit -m "feat: MergeButton — merge in-browser and auto-download"
```

---

### Task 7: SkippedList

**Files:**
- Create: `components/skipped-list.tsx`, `components/skipped-list.test.tsx`

**Interfaces:**
- Consumes: `SkippedFile` (`lib/merge.ts`), `friendlyReason` (`lib/skip-reason.ts`).
- Produces: `SkippedList({ skipped }: { skipped: SkippedFile[] })` — renders nothing when empty; one warning alert per skipped file otherwise.

- [ ] **Step 1: Write the failing test `components/skipped-list.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { SkippedList } from './skipped-list'

test('renders nothing when there are no skipped files', () => {
  const { container } = render(<SkippedList skipped={[]} />)
  expect(container).toBeEmptyDOMElement()
})

test('renders a warning per skipped file with a friendly reason', () => {
  render(
    <SkippedList
      skipped={[
        { name: 'locked.pdf', reason: 'the PDF is encrypted' },
        { name: 'broken.pdf', reason: 'Failed to parse' },
      ]}
    />,
  )
  expect(screen.getByText(/locked\.pdf — password-locked/)).toBeInTheDocument()
  expect(screen.getByText(/broken\.pdf — could not be read/)).toBeInTheDocument()
  expect(screen.getAllByRole('alert')).toHaveLength(2)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- components/skipped-list.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `components/skipped-list.tsx`**

```tsx
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- components/skipped-list.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/skipped-list.tsx components/skipped-list.test.tsx
git commit -m "feat: SkippedList — inline warnings for skipped files"
```

---

### Task 8: Wire it all together in `app/page.tsx`

**Files:**
- Modify: `app/page.tsx` (replace placeholder), `app/page.test.tsx` (replace smoke test)

**Interfaces:**
- Consumes: all four components + `PdfItem` + `SkippedFile`.
- Produces: the full single-page app. Holds `items` and `skipped` state; wires add/remove/reorder.

- [ ] **Step 1: Replace `app/page.test.tsx` with an integration test**

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import Page from './page'

vi.mock('@/lib/download', () => ({ downloadBytes: vi.fn() }))
import { downloadBytes } from '@/lib/download'

function pdf(name: string): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: 'application/pdf' })
}

afterEach(() => vi.clearAllMocks())

test('drop two PDFs, list them, merge, and download', async () => {
  const { container } = render(<Page />)
  const input = container.querySelector('input[type="file"]') as HTMLInputElement

  await userEvent.upload(input, [pdf('a.pdf'), pdf('b.pdf')])

  await waitFor(() => expect(screen.getByText('a.pdf')).toBeInTheDocument())
  expect(screen.getByText('b.pdf')).toBeInTheDocument()

  const merge = screen.getByRole('button', { name: /Merge 2 PDFs/ })
  expect(merge).toBeEnabled()
  await userEvent.click(merge)

  await waitFor(() => expect(downloadBytes).toHaveBeenCalledOnce())
})
```

Note: this test uses the real `mergePdfs` on 3-byte "PDFs", which will fail to parse and return `null` — so `downloadBytes` would NOT be called. To keep the merge real but the bytes valid, generate real one-page PDFs in the test instead:

```tsx
import { PDFDocument } from '@cantoo/pdf-lib'

async function realPdf(name: string): Promise<File> {
  const doc = await PDFDocument.create()
  doc.addPage([100, 100])
  return new File([await doc.save()], name, { type: 'application/pdf' })
}
```
Use `await realPdf('a.pdf')` in the `upload` call. Replace the `pdf()` helper above with `realPdf()`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- app/page.test.tsx`
Expected: FAIL — page still renders only the placeholder heading; no file input.

- [ ] **Step 3: Write the full `app/page.tsx`**

```tsx
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

  const addItems = (added: PdfItem[]): void => setItems((prev) => [...prev, ...added])
  const removeItem = (id: string): void => setItems((prev) => prev.filter((i) => i.id !== id))

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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- app/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Run the whole suite, typecheck, and build**

```bash
npm test
npx tsc --noEmit
npm run build
```
Expected: all tests PASS; no type errors; `out/index.html` produced.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "feat: compose the merge app in the page"
```

---

### Task 9: Deployment (Pages workflow, CNAME) + README

**Files:**
- Create: `public/CNAME`, `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Produces: a push-to-`main` GitHub Actions pipeline that builds, exports, and deploys `out/` to Pages under the custom domain.

- [ ] **Step 1: Write `public/CNAME`**

```
pdf-merger.lepaux.com
```

- [ ] **Step 2: Write `.github/workflows/deploy.yml`**

`.nojekyll` is created on the built output so Pages does not strip the `_next/` directory. (The `deploy-pages` artifact flow does not run Jekyll, but this makes it robust regardless.)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: touch out/.nojekyll
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Rewrite `README.md`**

````markdown
# pdf-merger

Merge PDF files entirely in your browser — drop them in, drag to reorder, click Merge, and your combined `merged.pdf` downloads. **Nothing is uploaded: your files never leave the page.** Handy for stitching together sensitive documents (payroll slips, bank statements) without trusting a server.

Live at **https://pdf-merger.lepaux.com**.

## How it works

- Drop PDFs onto the page (or click to pick them).
- Drag the rows to set the merge order.
- Click **Merge** — the combined PDF downloads automatically.
- Owner-password-only PDFs (openable without a password) are decrypted automatically. Files locked with a real user password, and corrupt files, are skipped with an inline warning; the rest still merge.

All processing runs client-side via [`@cantoo/pdf-lib`](https://github.com/cantoo-scribe/pdf-lib). There is no backend and no network request after the page loads.

## Development

```sh
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest
npm run typecheck
npm run build    # static export to out/
npm run preview  # serve the built out/ locally
```

Requires Node >= 18.18. Stack: Next.js (App Router, static export), React, Tailwind CSS v4 + DaisyUI, dnd-kit.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the static export and deploys it to GitHub Pages.

One-time setup (outside this repo):
- Repo **Settings → Pages → Source: GitHub Actions**.
- DNS: add a `CNAME` record `pdf-merger` → `<your-gh-user>.github.io`.
- The `public/CNAME` file binds the custom domain; GitHub auto-issues the HTTPS certificate.
````

- [ ] **Step 4: Verify the build still includes the domain file**

```bash
npm run build
test -f out/CNAME && echo "CNAME present in out/"
```
Expected: prints `CNAME present in out/`.

- [ ] **Step 5: Commit**

```bash
git add public/CNAME .github/workflows/deploy.yml README.md
git commit -m "ci: deploy static export to GitHub Pages; docs: rewrite README for web app"
```

- [ ] **Step 6: Manual browser verification (real end-to-end)**

The unit tests exercise logic in jsdom; this confirms `@cantoo/pdf-lib` actually bundles and runs in a real browser.

```bash
npm run dev
```
Then in the browser: drop 2+ real PDFs (include one owner-password payslip if available), reorder, click Merge, and confirm `merged.pdf` downloads with pages in the chosen order and the encrypted file included. Confirm a corrupt/user-locked file shows an inline warning and the rest still merge.

---

## Self-Review

**1. Spec coverage:**
- Client-side merge core → Task 2. ✅
- Drop + pick → Task 4. ✅
- Drag-reorder (dnd-kit) → Task 5 (+ pure `reorder` in Task 3). ✅
- One Merge button, auto-download → Task 6. ✅
- Problem-file parity (auto-decrypt owner-pw, skip corrupt + user-pw with visible warning) → Task 2 (logic) + Task 7 (display). ✅
- Next static export + Tailwind v4 + DaisyUI → Task 1. ✅
- Privacy copy ("nothing is uploaded") → Task 1 metadata + Task 8 footer + README. ✅
- GitHub Pages + CNAME + `.nojekyll` → Task 9. ✅
- Vitest (single runner) → Task 1. ✅
- e2e deferred → not in plan (matches spec). ✅
- Deferred items (Web Worker, page-ops, password prompt) → not in plan (matches spec). ✅

**2. Placeholder scan:** No TBD/TODO; every code step shows full code. The one "note" in Task 8 Step 1 is resolved inline (use `realPdf` with real bytes). ✅

**3. Type consistency:** `PdfItem` (`{id,name,size,bytes}`) consistent across DropZone/FileList/FileCard/MergeButton/page. `SkippedFile` (`{name,reason}`) consistent across merge/SkippedList/MergeButton/page. `mergePdfs(PdfInput[])` inputs built via `.map(i => ({name, bytes}))` in MergeButton. `reorder(items, activeId, overId)` signature matches FileList call (`String(active.id)`, `String(over.id)`). ✅

## Open risks

- `@cantoo/pdf-lib` bundling/running in a real browser under Next — pure JS, expected fine; Task 9 Step 6 verifies it for real.
- Large-file merges block the main thread — accepted for v1 (spinner shown). Web Worker is the deferred escape hatch.
- dnd-kit peer-dep versions (`@dnd-kit/sortable` ^10 needs `@dnd-kit/core` ^6.3): pinned together in Task 1; if `npm install` warns on peers, align to the versions npm resolves.
