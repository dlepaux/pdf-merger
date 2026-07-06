import assert from 'node:assert/strict'
import { join } from 'node:path'
import { test } from 'node:test'
import { displayPath, shortReason } from './log.ts'

test('displayPath relativizes paths under cwd', () => {
  assert.equal(displayPath(join(process.cwd(), 'inbox', 'a.pdf')), join('inbox', 'a.pdf'))
})

test('displayPath keeps foreign paths absolute', () => {
  assert.equal(displayPath('/elsewhere/a.pdf'), '/elsewhere/a.pdf')
})

test('shortReason keeps only the first sentence', () => {
  assert.equal(
    shortReason('Input document to `PDFDocument.load` is encrypted. You can use `ignoreEncryption`.'),
    'Input document to `PDFDocument.load` is encrypted',
  )
})

test('shortReason caps very long reasons', () => {
  const capped = shortReason('x'.repeat(200))
  assert.equal(capped.length, 120)
  assert.ok(capped.endsWith('…'))
})
