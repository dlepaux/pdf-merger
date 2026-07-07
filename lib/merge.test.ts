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
