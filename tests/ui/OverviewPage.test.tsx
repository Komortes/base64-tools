import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, test } from 'vitest'
import { OverviewPage } from '../../src/pages/OverviewPage'

describe('OverviewPage', () => {
  test('renders mode map links and guidance cards', () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Mode Map' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Encoders/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Decoders/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Performance Note' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Why I Built This' })).toBeInTheDocument()
  })
})
