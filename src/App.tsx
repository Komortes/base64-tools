import { useEffect } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router'
import { useI18n } from './i18n/useI18n'
import { DataUrlToolsPage } from './pages/DataUrlToolsPage'
import { DecodersPage } from './pages/DecodersPage'
import { EncodersPage } from './pages/EncodersPage'
import { OverviewPage } from './pages/OverviewPage'
import { ValidatorPage } from './pages/ValidatorPage'
import type { Locale } from './i18n/translations'
import { usePreferencesStore, type ThemePack } from './store/preferences'
import { ToastRegion } from './components/ToastRegion'

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/overview': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  '/encoders': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
    </svg>
  ),
  '/decoders': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
    </svg>
  ),
  '/tools/data-url': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  '/tools/validator': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
}

const THEME_OPTIONS: Array<{ id: ThemePack; labelKey: string }> = [
  { id: 'atlas', labelKey: 'app.theme.atlas' },
  { id: 'terminal', labelKey: 'app.theme.terminal' },
  { id: 'sunset', labelKey: 'app.theme.sunset' },
]
const LOCALE_OPTIONS: Array<{ id: Locale; labelKey: string }> = [
  { id: 'en', labelKey: 'app.language.en' },
  { id: 'ru', labelKey: 'app.language.ru' },
  { id: 'uk', labelKey: 'app.language.uk' },
]

function App() {
  const { locale, setLocale, t } = useI18n()
  const theme = usePreferencesStore((state) => state.theme)
  const setTheme = usePreferencesStore((state) => state.setTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const navSections = [
    {
      title: t('app.nav.workspace'),
      items: [
        { to: '/overview', label: t('app.nav.overview') },
        { to: '/encoders', label: t('app.nav.encoders') },
        { to: '/decoders', label: t('app.nav.decoders') },
      ],
    },
    {
      title: t('app.nav.tools'),
      items: [
        { to: '/tools/data-url', label: t('app.nav.dataUrl') },
        { to: '/tools/validator', label: t('app.nav.validator') },
      ],
    },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">{t('app.eyebrow')}</p>
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

        <hr className="sidebar-divider" />

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
                  {NAV_ICONS[item.to]}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </section>
        ))}

        <hr className="sidebar-divider" />

        <div className="sidebar-footer">
          <div className="sidebar-footer-privacy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Runs locally, no server</span>
          </div>

          <div className="theme-pack-grid" role="radiogroup" aria-label={t('app.theme.selector')}>
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-pack-option${theme === option.id ? ' is-active' : ''}`}
                role="radio"
                aria-checked={theme === option.id}
                aria-label={t(option.labelKey)}
                onClick={() => setTheme(option.id)}
              >
                {option.id === 'atlas' ? 'A' : option.id === 'terminal' ? 'T' : 'S'}
              </button>
            ))}
          </div>

          <div className="theme-pack-grid" role="radiogroup" aria-label={t('app.language.selector')}>
            {LOCALE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-pack-option${locale === option.id ? ' is-active' : ''}`}
                role="radio"
                aria-checked={locale === option.id}
                aria-label={t(option.labelKey)}
                onClick={() => setLocale(option.id)}
              >
                {option.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
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

      <ToastRegion />
    </div>
  )
}

export default App
