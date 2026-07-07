# Design: browser-side pdf-merger web app

Date: 2026-07-07
Status: approved (brainstorming), pending implementation plan

## Goal

Turn `pdf-merger` from a Node watch-folder service into a **100% client-side web
app**, hosted static on GitHub Pages at `pdf-merger.lepaux.com`. No server, no
uploads: PDFs are read, merged, and downloaded entirely in the browser.

The current CLI/watch-folder service is **replaced**, not kept. The merge engine
is portable already — it is the reason this is feasible with no backend.

## Why it works

- `@cantoo/pdf-lib` (a `pdf-lib` fork) is pure JS with zero native/Node
  dependencies. It runs unchanged in the browser.
- The existing `mergePdfs` logic in `src/merge.ts` is portable; only its inputs
  are Node-specific (`readFile` of paths). The browser supplies bytes via
  `File.arrayBuffer()` instead.
- Only genuinely Node-only pieces are `chokidar` (folder watch) and `node:fs`
  writes. Folder-watch was deemed unnecessary, so both are dropped.

## Privacy as the headline feature

Because everything runs client-side, source PDFs (payroll slips, bank
statements) **never leave the browser** — there are zero network calls. The UI
states this plainly ("Files stay in your browser — nothing is uploaded"). This
is a genuine, verifiable trust guarantee, not marketing.

## Decisions (from brainstorming)

| Question | Decision |
| --- | --- |
| Core interaction | Drop PDFs onto the page → drag to reorder freely → one Merge button → auto-download `merged.pdf`. No folder watch. |
| Existing Node service | Replaced entirely. Merge core survives; service/watcher/CLI removed. |
| Bundler / framework | Next.js (App Router) with `output: 'export'` (static). |
| Styling | Tailwind CSS + DaisyUI. Neat, modern, minimal, straight to the point. |
| Hosting | GitHub Pages, custom domain `pdf-merger.lepaux.com`. |
| v1 scope | Merge-only, mirroring current problem-file behavior. |
| Reorder DnD | `@dnd-kit` — justified below. |
| e2e tests | Deferred from v1; core + component tests cover it. |

## Architecture

```
Browser (only runtime)
 ├─ app/page.tsx        one route, 'use client', all UI
 ├─ components/         DropZone, FileList (drag-reorder), MergeButton, SkippedList
 ├─ lib/merge.ts        pure merge core (adapted from src/merge.ts)
 └─ @cantoo/pdf-lib     bundled, runs in browser
Next.js output:'export' → out/ → GitHub Pages
```

No API routes. No server work. Every component is client-side because all work
is browser-side. The app makes no network requests after the initial page load.

## Repo restructure

The repo stays `pdf-merger` and becomes the Next app at its root.

- **Remove:** `src/service.ts`, `src/index.ts`, `chokidar` dependency,
  `listPdfs` / `writeAtomic` (node:fs), `src/service.test.ts`, `src/log.ts`
  (console logger — the UI replaces it).
- **Keep + adapt:** merge core → `lib/merge.ts`. The decrypt logic (`loadPdf`,
  owner-password → empty user password) is copied verbatim; it is already
  browser-safe.
- **Add:** `app/`, `components/`, `next.config.mjs`, `tailwind.config.ts`,
  `postcss.config.mjs`, rewritten `package.json`, `public/CNAME`,
  `public/.nojekyll`, GitHub Actions deploy workflow.

## Merge core (browser)

The signature changes from "read paths" to "take bytes". The UI reads
`File.arrayBuffer()`; the core stays a pure function.

```ts
type PdfInput = { name: string; bytes: Uint8Array }
type SkippedFile = { name: string; reason: string }
type MergeResult = { bytes: Uint8Array; merged: string[]; skipped: SkippedFile[] }

// Merge in the given order. Corrupt/locked files are skipped and reported,
// never thrown — one bad file must not fail the whole merge. Returns null
// when nothing merged.
mergePdfs(inputs: PdfInput[]): Promise<MergeResult | null>
```

Same per-file `try/catch` skip semantics and same decrypt fallback as today.
Being pure and Node-runnable (pdf-lib works in Node), it is unit-testable
without a browser, so the existing `merge.test.ts` adapts directly.

## UI / interaction

- **DropZone** — full-page drop target plus click-to-pick
  (`<input type="file" multiple accept="application/pdf">`). Works on mobile.
- **FileList** — one card per file (name, size, remove ✕) with a drag handle to
  reorder. Empty state shows the drop prompt.
- **Reorder** — `@dnd-kit`. Doing reorder well (touch, keyboard, a11y,
  animation) is well over the 20-line threshold in the dependency rule; dnd-kit
  is well-established and actively maintained. The zero-dep alternative (native
  HTML5 drag events) is desktop-mouse-only — rejected because best UX was an
  explicit requirement.
- **MergeButton** — disabled with fewer than 2 files and during a merge
  (DaisyUI spinner). On click: `mergePdfs` → `Blob` → auto-download
  `merged.pdf`.
- **SkippedList** — after a merge, inline DaisyUI alerts for skipped files,
  preserving today's behavior:
  `⚠ statement.pdf — password-locked, skipped`,
  `⚠ broken.pdf — corrupt, skipped`.

Styling: Tailwind for layout, DaisyUI for components (file-input, card, btn,
alert, loading). One clean theme. Modern and minimal.

## Problem-file handling (parity with current service)

- Owner-password-only PDFs (viewable without a password) auto-decrypt via the
  empty user password.
- PDFs locked with a real user password are skipped with a visible warning.
- Corrupt/unreadable files are skipped with a visible warning; the rest merge.
- Empty / single-file selection: Merge disabled until ≥ 2 files.

## Deployment

- **GitHub Actions:** on push to `main`, run `next build`, upload `out/`, deploy
  via `actions/deploy-pages`.
- `public/CNAME` = `pdf-merger.lepaux.com`.
- `public/.nojekyll` — prevents Pages from stripping the `_next/` directory.
- `next.config.mjs`: `output: 'export'`, `images: { unoptimized: true }`,
  `trailingSlash: true`, **no** `basePath` (custom domain serves at root).
- **User one-time infra (out of this repo's control):** add a DNS `CNAME`
  record `pdf-merger` → `<gh-user>.github.io`, and set the custom domain in the
  repo's Pages settings. GitHub auto-issues the HTTPS certificate.

## Testing (quality floor)

Single runner: **Vitest** (replaces `node --test`, since React components need a
jsdom environment and two runners is not worth it).

- **Merge core** — adapt `merge.test.ts` as plain Vitest unit tests: merges N
  files and preserves page counts; skips corrupt; decrypts owner-password; skips
  user-password-locked.
- **Components** — Vitest (jsdom) + React Testing Library: merge-button
  enable/disable states, remove-file, skipped-list rendering, reorder result
  ordering.
- **e2e** — deferred from v1. A single Playwright flow (drop → reorder → merge →
  download) can be added later.

## Deferred (YAGNI — not in v1)

- Web Worker for merge (main thread + spinner until proven janky).
- Page-level operations (rotate / delete / split).
- Password prompt for user-password-locked files.

## Open risks

- `@cantoo/pdf-lib` bundling under Next's bundler — pure JS, expected to bundle
  cleanly; verify during implementation.
- Large-file merges block the main thread — accepted for v1 with a loading
  state; Web Worker is the escape hatch if it janks.
