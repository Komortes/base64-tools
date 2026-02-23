import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, test } from 'vitest'
import App from '../../src/App'
import { I18nProvider } from '../../src/i18n/I18nProvider'

function renderApp(initialEntry: string) {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('App routing', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  test('renders overview on explicit overview route', () => {
    renderApp('/overview')

    expect(screen.getByRole('heading', { name: 'Fast Base64 Workspace' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
  })

  test('redirects unknown routes to overview', () => {
    renderApp('/missing-route')

    expect(screen.getByRole('heading', { name: 'Fast Base64 Workspace' })).toBeInTheDocument()
  })

  test('persists selected theme to localStorage and html data attribute', () => {
    renderApp('/overview')

    fireEvent.click(screen.getByRole('radio', { name: 'Terminal' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'terminal')
    expect(window.localStorage.getItem('base64-tools-theme')).toBe('terminal')
  })

  test('switches locale to russian and persists it', () => {
    renderApp('/overview')

    fireEvent.click(screen.getByRole('radio', { name: 'Russian' }))

    expect(screen.getByRole('heading', { name: 'Быстрая Base64-рабочая область' })).toBeInTheDocument()
    expect(window.localStorage.getItem('base64-tools-locale')).toBe('ru')
  })

  test('switches locale to ukrainian and persists it', () => {
    renderApp('/overview')

    fireEvent.click(screen.getByRole('radio', { name: 'Ukrainian' }))

    expect(screen.getByRole('heading', { name: 'Швидкий Base64 Workspace' })).toBeInTheDocument()
    expect(window.localStorage.getItem('base64-tools-locale')).toBe('uk')
  })
})
