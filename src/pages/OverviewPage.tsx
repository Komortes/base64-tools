import { Link } from 'react-router'
import { useI18n } from '../i18n/useI18n'

const TOOL_ICONS: Record<string, React.ReactNode> = {
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

export function OverviewPage() {
  const { t } = useI18n()

  return (
    <section className="tool-panel overview-page">
      <div className="overview-hero">
        <div className="overview-hero-main">
          <h2>{t('overview.hero.title')}</h2>
          <p>
            {t('overview.hero.subtitle')}
          </p>
        </div>
      </div>

      <div className="overview-grid">
        <article className="preview-card mode-map-card">
          <h3>{t('overview.map.title')}</h3>
          <div className="mode-map-grid">
            <Link className="mode-map-link" to="/encoders">
              <div className="mode-map-item">
                <div className="mode-map-item-inner">
                  <div className="mode-map-item-content">
                    {TOOL_ICONS['/encoders']}
                    <div>
                      <h4>{t('overview.map.encoders.title')}</h4>
                      <p>{t('overview.map.encoders.desc')}</p>
                    </div>
                  </div>
                  <span className="mode-map-arrow" aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
            <Link className="mode-map-link" to="/decoders">
              <div className="mode-map-item">
                <div className="mode-map-item-inner">
                  <div className="mode-map-item-content">
                    {TOOL_ICONS['/decoders']}
                    <div>
                      <h4>{t('overview.map.decoders.title')}</h4>
                      <p>{t('overview.map.decoders.desc')}</p>
                    </div>
                  </div>
                  <span className="mode-map-arrow" aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
            <Link className="mode-map-link" to="/tools/data-url">
              <div className="mode-map-item">
                <div className="mode-map-item-inner">
                  <div className="mode-map-item-content">
                    {TOOL_ICONS['/tools/data-url']}
                    <div>
                      <h4>{t('overview.map.dataUrl.title')}</h4>
                      <p>{t('overview.map.dataUrl.desc')}</p>
                    </div>
                  </div>
                  <span className="mode-map-arrow" aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
            <Link className="mode-map-link" to="/tools/validator">
              <div className="mode-map-item">
                <div className="mode-map-item-inner">
                  <div className="mode-map-item-content">
                    {TOOL_ICONS['/tools/validator']}
                    <div>
                      <h4>{t('overview.map.validator.title')}</h4>
                      <p>{t('overview.map.validator.desc')}</p>
                    </div>
                  </div>
                  <span className="mode-map-arrow" aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
          </div>
        </article>

        <article className="preview-card">
          <p>{t('overview.story.body')}</p>
        </article>
      </div>
    </section>
  )
}
