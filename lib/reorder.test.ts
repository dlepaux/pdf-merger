import { expect, test } from 'vitest'
import { reorder } from './reorder'
import type { PdfItem } from './types'

const item = (id: string): PdfItem => ({ id, name: `${id}.pdf`, size: 1, bytes: new Uint8Array() })

test('moves the active item to the over item position', () => {
  const items = [item('a'), item('b'), item('c')]
  expect(reorder(items, 'a', 'c').map((i) => i.id)).toEqual(['b', 'c', 'a'])
})

test('returns items unchanged when an id is missing', () => {
  const items = [item('a'), item('b')]
  expect(reorder(items, 'a', 'zzz')).toBe(items)
})
