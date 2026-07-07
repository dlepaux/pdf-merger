import { afterEach, expect, test, vi } from 'vitest'
import { downloadBytes } from './download'

afterEach(() => vi.restoreAllMocks())

test('creates a blob URL, clicks an anchor with the filename, then revokes', () => {
  const createURL = vi.fn(() => 'blob:mock')
  const revokeURL = vi.fn()
  Object.defineProperty(URL, 'createObjectURL', { value: createURL, configurable: true })
  Object.defineProperty(URL, 'revokeObjectURL', { value: revokeURL, configurable: true })
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  downloadBytes(new Uint8Array([1, 2, 3]), 'merged.pdf')

  expect(createURL).toHaveBeenCalledOnce()
  expect(click).toHaveBeenCalledOnce()
  expect(revokeURL).toHaveBeenCalledWith('blob:mock')
})
