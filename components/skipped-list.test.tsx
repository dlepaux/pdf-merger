import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { SkippedList } from './skipped-list'

test('renders nothing when there are no skipped files', () => {
  const { container } = render(<SkippedList skipped={[]} />)
  expect(container).toBeEmptyDOMElement()
})

test('renders a warning per skipped file with a friendly reason', () => {
  render(
    <SkippedList
      skipped={[
        { name: 'locked.pdf', reason: 'the PDF is encrypted' },
        { name: 'broken.pdf', reason: 'Failed to parse' },
      ]}
    />,
  )
  expect(screen.getByText(/locked\.pdf — password-locked/)).toBeInTheDocument()
  expect(screen.getByText(/broken\.pdf — could not be read/)).toBeInTheDocument()
  expect(screen.getAllByRole('alert')).toHaveLength(2)
})
