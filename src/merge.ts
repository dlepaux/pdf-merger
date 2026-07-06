import { readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { EncryptedPDFError, PDFDocument } from '@cantoo/pdf-lib'

export type SkippedFile = { file: string; reason: string }

export type MergeResult = {
  bytes: Uint8Array
  merged: string[]
  skipped: SkippedFile[]
}

/** PDFs in dir, lexicographically sorted — sort order defines merge order. */
export async function listPdfs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.pdf'))
    .map((e) => join(dir, e.name))
    .sort()
}

/**
 * Owner-password-only PDFs (typical for payroll slips: viewable without a
 * password, editing restricted) decrypt with the empty user password.
 * PDFs locked with a real user password still fail and get skipped.
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
 * Merge files in given order. Unreadable/corrupt files are skipped and
 * reported, not thrown — one bad drop must not take the service down.
 * Returns null when nothing merged.
 */
export async function mergePdfs(files: string[]): Promise<MergeResult | null> {
  const out = await PDFDocument.create()
  const merged: string[] = []
  const skipped: SkippedFile[] = []

  for (const file of files) {
    try {
      const src = await loadPdf(await readFile(file))
      const pages = await out.copyPages(src, src.getPageIndices())
      for (const page of pages) out.addPage(page)
      merged.push(file)
    } catch (err) {
      skipped.push({ file, reason: err instanceof Error ? err.message : String(err) })
    }
  }

  if (merged.length === 0) return null
  return { bytes: await out.save(), merged, skipped }
}

/** Write via tmp + rename so readers never see a half-written PDF. */
export async function writeAtomic(path: string, bytes: Uint8Array): Promise<void> {
  const tmp = `${path}.tmp`
  await writeFile(tmp, bytes)
  await rename(tmp, path)
}
