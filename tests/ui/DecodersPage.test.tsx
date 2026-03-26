import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'
import { DecodersPage } from '../../src/pages/DecodersPage'
import { useToastStore } from '../../src/store/toast'

describe('DecodersPage', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts()
  })

  test('keeps previous decoded text visible until debounced recompute finishes', async () => {
    render(<DecodersPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Text Decoder' }))

    fireEvent.change(screen.getByPlaceholderText('Paste Base64 or Data URL'), {
      target: { value: 'SGVsbG8=' },
    })

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('Paste Base64 or Data URL'), {
      target: { value: 'V29ybGQ=' },
    })

    expect(screen.getByText('Hello')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('World')).toBeInTheDocument()
    })
  })

  test('shows a calm inline invalid-state message for bad base64 input', async () => {
    render(<DecodersPage />)

    fireEvent.change(screen.getByPlaceholderText('Paste Base64 or Data URL'), {
      target: { value: '%%%' },
    })

    await waitFor(() => {
      expect(screen.getByText('Invalid Base64 input.')).toBeInTheDocument()
    })
  })
})
