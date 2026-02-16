import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router'
import { DataUrlToolsPage } from './pages/DataUrlToolsPage'
import { DecodersPage } from './pages/DecodersPage'
import { EncodersPage } from './pages/EncodersPage'
import { OverviewPage } from './pages/OverviewPage'
import { ValidatorPage } from './pages/ValidatorPage'

type ThemePack = 'atlas' | 'terminal' | 'sunset'

const THEME_STORAGE_KEY = 'base64-tools-theme'
const THEME_OPTIONS: Array<{ id: ThemePack; label: string; note: string }> = [
  { id: 'atlas', label: 'Atlas', note: 'Balanced blue workspace.' },
  { id: 'terminal', label: 'Terminal', note: 'Dark console vibe.' },
  { id: 'sunset', label: 'Sunset', note: 'Warm, high-contrast palette.' },
]

const navSections = [
  {
    title: 'Workspace',
    items: [
      { to: '/overview', label: 'Overview' },
      { to: '/encoders', label: 'Encoders' },
      { to: '/decoders', label: 'Decoders' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { to: '/tools/data-url', label: 'Data URL' },
      { to: '/tools/validator', label: 'Validator' },
    ],
  },
]

function App() {
  const [theme, setTheme] = useState<ThemePack>(() => {
    if (typeof window === 'undefined') {
      return 'atlas'
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'atlas' || storedTheme === 'terminal' || storedTheme === 'sunset') {
      return storedTheme
    }

    return 'atlas'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Local-first toolkit</p>
          <h1>
            <span className="brand-title">Base64 Tools</span>
            <span className="brand-loop-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12a8 8 0 10-2.3 5.7" />
                <path d="M20 7v5h-5" />
              </svg>
            </span>
          </h1>
        </div>

        {navSections.map((section) => (
          <section key={section.title} className="sidebar-section">
            <h2>{section.title}</h2>
            <nav aria-label={section.title}>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `side-link${isActive ? ' is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </section>
        ))}

        <article className="privacy-card">
          <h3>Privacy</h3>
          <p>Everything is computed in your browser tab, including decode and preview.</p>
        </article>

        <article className="theme-card">
          <h3>Theme Pack</h3>
          <div className="theme-pack-grid" role="radiogroup" aria-label="Theme pack selector">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-pack-option${theme === option.id ? ' is-active' : ''}`}
                role="radio"
                aria-checked={theme === option.id}
                onClick={() => setTheme(option.id)}
              >
                <span>{option.label}</span>
                <span>{option.note}</span>
              </button>
            ))}
          </div>
        </article>
      </aside>

      <div className="workspace">
        <main className="page-wrap">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/encoders" element={<EncodersPage />} />
            <Route path="/decoders" element={<DecodersPage />} />
            <Route path="/decode/smart" element={<Navigate to="/decoders" replace />} />
            <Route path="/tools/smart-decode" element={<Navigate to="/decoders" replace />} />
            <Route path="/decode/image" element={<Navigate to="/decoders" replace />} />
            <Route path="/decode/file" element={<Navigate to="/decoders" replace />} />
            <Route path="/tools/data-url" element={<DataUrlToolsPage />} />
            <Route path="/tools/validator" element={<ValidatorPage />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
