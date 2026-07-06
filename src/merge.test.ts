import assert from 'node:assert/strict'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { PDFDocument } from '@cantoo/pdf-lib'
import { listPdfs, mergePdfs, writeAtomic } from './merge.ts'
import { makeEncryptedPdf, makeTempDir, writePdf } from './fixtures.test-helper.ts'

test('listPdfs returns only PDFs, lexicographically sorted', async () => {
  const dir = await makeTempDir()
  await writePdf(dir, 'b.pdf', [100])
  await writePdf(dir, 'a.PDF', [100])
  await writeFile(join(dir, 'notes.txt'), 'not a pdf')

  const files = await listPdfs(dir)
  assert.deepEqual(files, [join(dir, 'a.PDF'), join(dir, 'b.pdf')])
})

test('mergePdfs concatenates pages in given order', async () => {
  const dir = await makeTempDir()
  const first = await writePdf(dir, '01-first.pdf', [111, 111])
  const second = await writePdf(dir, '02-second.pdf', [222])

  const result = await mergePdfs([first, second])
  assert.ok(result)
  assert.deepEqual(result.merged, [first, second])
  assert.deepEqual(result.skipped, [])

  const doc = await PDFDocument.load(result.bytes)
  const widths = doc.getPages().map((p) => p.getWidth())
  assert.deepEqual(widths, [111, 111, 222])
})

test('mergePdfs skips corrupt files and keeps the rest', async () => {
  const dir = await makeTempDir()
  const good = await writePdf(dir, 'good.pdf', [100])
  const bad = join(dir, 'bad.pdf')
  await writeFile(bad, 'this is not a pdf')

  const result = await mergePdfs([bad, good])
  assert.ok(result)
  assert.deepEqual(result.merged, [good])
  assert.equal(result.skipped.length, 1)
  assert.equal(result.skipped[0]?.file, bad)
})

test('mergePdfs decrypts owner-password-only PDFs (empty user password)', async () => {
  const dir = await makeTempDir()
  const plain = await writePdf(dir, '01-plain.pdf', [111])
  const encrypted = join(dir, '02-encrypted.pdf')
  const encryptedBytes = await makeEncryptedPdf([222])
  await writeFile(encrypted, encryptedBytes)

  // Guard the fixture itself: must use RC4 V2/R3 like the real payroll files,
  // not AES — otherwise this test stops covering the production cipher.
  const raw = Buffer.from(encryptedBytes).toString('latin1')
  assert.ok(raw.includes('/V 2') && raw.includes('/R 3'), 'fixture must be RC4 V2/R3')

  const result = await mergePdfs([plain, encrypted])
  assert.ok(result)
  assert.deepEqual(result.merged, [plain, encrypted])
  assert.deepEqual(result.skipped, [])

  const doc = await PDFDocument.load(result.bytes)
  const widths = doc.getPages().map((p) => p.getWidth())
  assert.deepEqual(widths, [111, 222])
})

test('mergePdfs skips PDFs locked with a real user password', async () => {
  const dir = await makeTempDir()
  const locked = join(dir, 'locked.pdf')
  await writeFile(locked, await makeEncryptedPdf([100], 'hunter2'))
  const good = await writePdf(dir, 'good.pdf', [333])

  const result = await mergePdfs([locked, good])
  assert.ok(result)
  assert.deepEqual(result.merged, [good])
  assert.equal(result.skipped.length, 1)
  assert.equal(result.skipped[0]?.file, locked)
})

test('mergePdfs returns null when nothing is mergeable', async () => {
  const dir = await makeTempDir()
  const bad = join(dir, 'bad.pdf')
  await writeFile(bad, 'garbage')

  assert.equal(await mergePdfs([]), null)
  assert.equal(await mergePdfs([bad]), null)
})

test('writeAtomic writes content and leaves no tmp file', async () => {
  const dir = await makeTempDir()
  const target = join(dir, 'out.pdf')
  await writeAtomic(target, new TextEncoder().encode('payload'))

  assert.equal(await readFile(target, 'utf8'), 'payload')
  assert.deepEqual(await readdir(dir), ['out.pdf'])
})
