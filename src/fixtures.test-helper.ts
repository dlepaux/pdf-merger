import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PDFDocument, PDFHeader } from '@cantoo/pdf-lib'

/** PDF with one page per width — distinct widths let tests assert merge order. */
export async function makePdf(pageWidths: number[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (const width of pageWidths) doc.addPage([width, 400])
  return doc.save()
}

/**
 * Encrypted fixture matching the production case: Standard security handler,
 * RC4-128 /V 2 /R 3 (the cipher is picked from the PDF header version, so we
 * force 1.4 — header 1.7 would silently switch to AES and stop covering the
 * cipher the real payroll files use). Empty userPassword mimics PDFs that
 * open without a password; a non-empty one makes a genuinely locked PDF.
 */
export async function makeEncryptedPdf(pageWidths: number[], userPassword = ''): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.context.header = PDFHeader.forVersion(1, 4)
  for (const width of pageWidths) doc.addPage([width, 400])
  doc.encrypt({ ownerPassword: 'owner-secret', userPassword })
  return doc.save()
}

export async function makeTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'pdf-merger-test-'))
}

export async function writePdf(dir: string, name: string, pageWidths: number[]): Promise<string> {
  const path = join(dir, name)
  await writeFile(path, await makePdf(pageWidths))
  return path
}
