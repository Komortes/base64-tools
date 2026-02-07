import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router'
import { ConverterPage } from './pages/ConverterPage'
import { DataUrlToolsPage } from './pages/DataUrlToolsPage'
import { DecodeFilePage } from './pages/DecodeFilePage'
import { DecodeImagePage } from './pages/DecodeImagePage'
import { OverviewPage } from './pages/OverviewPage'
import { SmartDecodePage } from './pages/SmartDecodePage'
import { ValidatorPage } from './pages/ValidatorPage'

const navSections = [
  {
    title: 'Workspace',
    items: [
      { to: '/overview', label: 'Overview' },
      { to: '/converter', label: 'Converter' },
      { to: '/tools/smart-decode', label: 'Smart Decode' },
    ],
  },
  {
    title: 'Decode',
    items: [
      { to: '/decode/image', label: 'Decode Image' },
      { to: '/decode/file', label: 'Decode File' },
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

const pageTitleMap: Record<string, string> = {
  '/overview': 'Overview',
  '/converter': 'Text Converter',
  '/tools/smart-decode': 'Smart Decode',
  '/decode/image': 'Image Decoder',
  '/decode/file': 'File Decoder',
  '/tools/data-url': 'Data URL Utilities',
  '/tools/validator': 'Base64 Validator',
}

function App() {
  const location = useLocation()
  const currentTitle = pageTitleMap[location.pathname] ?? 'Base64 Tools'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Local-first toolkit</p>
          <h1>Base64 Tools</h1>
          <p className="brand-note">No backend. No upload. No hidden processing.</p>
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
      </aside>

      <div className="workspace">
        <header className="workspace-head">
          <p className="workspace-kicker">Current tool</p>
          <h2>{currentTitle}</h2>
        </header>

        <main className="page-wrap">
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/converter" element={<ConverterPage />} />
            <Route path="/tools/smart-decode" element={<SmartDecodePage />} />
            <Route path="/decode/image" element={<DecodeImagePage />} />
            <Route path="/decode/file" element={<DecodeFilePage />} />
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
