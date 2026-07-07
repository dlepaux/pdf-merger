import { expect, test } from 'vitest'
import { formatBytes } from './format'

test('bytes below 1 KB show as B', () => expect(formatBytes(512)).toBe('512 B'))
test('KB shows one decimal', () => expect(formatBytes(1536)).toBe('1.5 KB'))
test('MB scales up', () => expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB'))
test('promotes across a unit boundary instead of showing 1024', () =>
  expect(formatBytes(1048560)).toBe('1.0 MB'))
