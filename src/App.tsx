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

const THEME_STORAGE_KEY = 'base64-tools-theme'
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
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
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
          <h3>{t('app.privacy.title')}</h3>
          <p>{t('app.privacy.body')}</p>
        </article>

        <article className="theme-card">
          <h3>{t('app.theme.title')}</h3>
          <div className="theme-pack-grid" role="radiogroup" aria-label={t('app.theme.selector')}>
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-pack-option${theme === option.id ? ' is-active' : ''}`}
                role="radio"
                aria-checked={theme === option.id}
                onClick={() => setTheme(option.id)}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        </article>

        <article className="theme-card">
          <h3>{t('app.language.title')}</h3>
          <div className="theme-pack-grid language-pack-grid" role="radiogroup" aria-label={t('app.language.selector')}>
            {LOCALE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`theme-pack-option${locale === option.id ? ' is-active' : ''}`}
                role="radio"
                aria-checked={locale === option.id}
                onClick={() => setLocale(option.id)}
              >
                {t(option.labelKey)}
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

      <ToastRegion />
    </div>
  )
}

export default App
