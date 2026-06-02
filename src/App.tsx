import { useEffect } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router'
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

const SEO_BY_PATH: Record<string, { title: string; description: string }> = {
  '/overview': {
    title: 'Base64 Tools - Encode, Decode, Validate',
    description: 'Fast browser-based Base64 tools for encoding, decoding, validating, and working with Data URLs. All processing runs locally in your browser.',
  },
  '/encoders': {
    title: 'Base64 Encoder - Text, Files, Images, PDF, URL',
    description: 'Encode text, files, images, PDFs, video, audio, HTML, CSS, URLs, and hex data to Base64 directly in your browser.',
  },
  '/decoders': {
    title: 'Base64 Decoder - Text, Files, Media, Data URLs',
    description: 'Decode Base64 and Data URL payloads into text, files, images, PDFs, audio, video, HTML, CSS, URLs, and hex output.',
  },
  '/tools/data-url': {
    title: 'Data URL Tools - Parse, Preview, Extract Payloads',
    description: 'Parse Data URLs, inspect MIME metadata, preview supported payloads, copy clean content, and download decoded data.',
  },
  '/tools/validator': {
    title: 'Base64 Validator - Check Padding, Alphabet, Length',
    description: 'Validate Base64 strings, find invalid characters, check padding, normalize whitespace, and convert URL-safe payloads.',
  },
}

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.content = content
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }

  element.href = href
}

function ThemeSwatch({ id }: { id: ThemePack }) {
  const palettes: Record<ThemePack, { sidebar: string; accent: string }> = {
    atlas:    { sidebar: 'linear-gradient(160deg, #133f67, #103454)', accent: '#0f6ea3' },
    terminal: { sidebar: 'linear-gradient(160deg, #091811, #050d0a)', accent: '#23b36b' },
    sunset:   { sidebar: 'linear-gradient(160deg, #7c2f22, #5c1f16)', accent: '#ec8b43' },
  }
  const { sidebar, accent } = palettes[id]
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '26px', height: '22px' }}>
      <span style={{ flex: 1, borderRadius: '3px', background: sidebar }} />
      <span style={{ height: '5px', borderRadius: '2px', background: accent }} />
    </span>
  )
}

function App() {
  const { locale, setLocale, t } = useI18n()
  const location = useLocation()
  const theme = usePreferencesStore((state) => state.theme)
  const setTheme = usePreferencesStore((state) => state.setTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    const path = location.pathname === '/' ? '/overview' : location.pathname
    const metadata = SEO_BY_PATH[path] ?? SEO_BY_PATH['/overview']
    const canonicalPath = SEO_BY_PATH[path] ? path : '/overview'
    const canonicalUrl = `${window.location.origin}${canonicalPath}`

    document.title = metadata.title
    setMeta('description', metadata.description)
    setMeta('robots', 'index, follow')
    setMeta('og:title', metadata.title, 'property')
    setMeta('og:description', metadata.description, 'property')
    setMeta('og:url', canonicalUrl, 'property')
    setMeta('twitter:title', metadata.title)
    setMeta('twitter:description', metadata.description)
    setLink('canonical', canonicalUrl)
  }, [location.pathname])

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
            <span>{t('app.privacy.body')}</span>
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
                <ThemeSwatch id={option.id} />
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
