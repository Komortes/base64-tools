import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'
import { DataUrlToolsPage } from '../../src/pages/DataUrlToolsPage'
import { useToastStore } from '../../src/store/toast'

describe('DataUrlToolsPage', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts()
  })

  test('reports UTF-8 byte size for text payloads', async () => {
    render(<DataUrlToolsPage />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'data:,Привет' },
    })

    expect(await screen.findByText('12 B')).toBeInTheDocument()
  })

  test('renders an empty text preview and 0 B for empty text payloads', async () => {
    const { container } = render(<DataUrlToolsPage />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'data:,' },
    })

    await waitFor(() => {
      expect(container.querySelector('pre.text-preview')).not.toBeNull()
    })

    const preview = container.querySelector('pre.text-preview')
    expect(preview?.textContent).toBe('')
    expect(screen.getByText('0 B')).toBeInTheDocument()
    expect(screen.queryByText('No browser preview for this type. Use download.')).not.toBeInTheDocument()
  })
})
