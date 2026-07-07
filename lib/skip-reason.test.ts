import { expect, test } from 'vitest'
import { friendlyReason } from './skip-reason'

test('encryption/password errors map to "password-locked"', () => {
  expect(friendlyReason('the PDF is encrypted')).toBe('password-locked')
  expect(friendlyReason('Incorrect password provided')).toBe('password-locked')
})

test('anything else maps to "could not be read"', () => {
  expect(friendlyReason('Failed to parse PDF document')).toBe('could not be read')
})
