import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { EncodersPage } from '../../src/pages/EncodersPage'
import { useToastStore } from '../../src/store/toast'

describe('EncodersPage', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('keeps previous output stable until debounced text re-encode completes', async () => {
    render(<EncodersPage />)

    fireEvent.change(screen.getByPlaceholderText('Paste plain text.'), {
      target: { value: 'Hello' },
    })

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Encoded Base64 will appear here')).toHaveValue('SGVsbG8=')
    })

    fireEvent.change(screen.getByPlaceholderText('Paste plain text.'), {
      target: { value: 'Hello!' },
    })

    expect(screen.getByPlaceholderText('Encoded Base64 will appear here')).toHaveValue('SGVsbG8=')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Encoded Base64 will appear here')).toHaveValue('SGVsbG8h')
    })
  })

  test('shows inline hex error inside the output block', async () => {
    render(<EncodersPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Hex to Base64' }))
    fireEvent.change(screen.getByPlaceholderText('Paste hex string, e.g. 48 65 6c 6c 6f'), {
      target: { value: 'zz' },
    })

    await waitFor(() => {
      expect(screen.getByText('Hex input contains invalid characters.')).toBeInTheDocument()
    })
  })

  test('clears the previously selected file when a new URL load fails', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValueOnce(
      new Response('hello', {
        status: 200,
        headers: {
          'content-type': 'text/plain',
        },
      }),
    )
    fetchMock.mockResolvedValueOnce(
      new Response('nope', {
        status: 500,
      }),
    )

    render(<EncodersPage />)

    fireEvent.click(screen.getByRole('button', { name: 'File to Base64' }))
    fireEvent.click(screen.getByRole('button', { name: 'File URL' }))

    fireEvent.change(screen.getByPlaceholderText('https://example.com/file.pdf'), {
      target: { value: 'https://example.com/one.txt' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(screen.queryByText('No file selected')).not.toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('https://example.com/file.pdf'), {
      target: { value: 'https://example.com/two.txt' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(screen.getByText('No file selected')).toBeInTheDocument()
    })
  })
})
