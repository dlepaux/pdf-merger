import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PDFDocument } from 'pdf-lib'

/** PDF with one page per width — distinct widths let tests assert merge order. */
export async function makePdf(pageWidths: number[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  for (const width of pageWidths) doc.addPage([width, 400])
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
