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
