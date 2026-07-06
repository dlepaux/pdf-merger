import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { PDFDocument } from '@cantoo/pdf-lib'
import { runMerge } from './service.ts'
import { makeTempDir, writePdf } from './fixtures.test-helper.ts'

test('runMerge writes merged.pdf with pages from all inbox PDFs in name order', async () => {
  const inboxDir = await makeTempDir()
  const distDir = await makeTempDir()
  await writePdf(inboxDir, '02-second.pdf', [222])
  await writePdf(inboxDir, '01-first.pdf', [111])

  await runMerge({ inboxDir, distDir, outputName: 'merged.pdf', debounceMs: 0 })

  const doc = await PDFDocument.load(await readFile(join(distDir, 'merged.pdf')))
  const widths = doc.getPages().map((p) => p.getWidth())
  assert.deepEqual(widths, [111, 222])
})

test('runMerge on empty inbox writes nothing', async () => {
  const inboxDir = await makeTempDir()
  const distDir = await makeTempDir()

  await runMerge({ inboxDir, distDir, outputName: 'merged.pdf', debounceMs: 0 })

  assert.deepEqual(await readdir(distDir), [])
})
