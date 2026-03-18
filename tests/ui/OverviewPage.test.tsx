import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, test } from 'vitest'
import { OverviewPage } from '../../src/pages/OverviewPage'

describe('OverviewPage', () => {
  test('renders hero, mode map links, and about card', () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>,
    )

    // useI18n falls back to 'en' when rendered without a provider — confirmed by the existing passing test
    expect(screen.getByRole('heading', { name: 'Fast Base64 Workspace' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mode Map' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Encoders/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Decoders/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Performance Note' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Why I Built This' })).not.toBeInTheDocument()
  })
})
