import { Link } from 'react-router'
import { useI18n } from '../i18n/useI18n'

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
                <h4>{t('overview.map.encoders.title')}</h4>
                <p>{t('overview.map.encoders.desc')}</p>
              </div>
            </Link>
            <Link className="mode-map-link" to="/decoders">
              <div className="mode-map-item">
                <h4>{t('overview.map.decoders.title')}</h4>
                <p>{t('overview.map.decoders.desc')}</p>
              </div>
            </Link>
            <Link className="mode-map-link" to="/tools/data-url">
              <div className="mode-map-item">
                <h4>{t('overview.map.dataUrl.title')}</h4>
                <p>{t('overview.map.dataUrl.desc')}</p>
              </div>
            </Link>
            <Link className="mode-map-link" to="/tools/validator">
              <div className="mode-map-item">
                <h4>{t('overview.map.validator.title')}</h4>
                <p>{t('overview.map.validator.desc')}</p>
              </div>
            </Link>
          </div>
        </article>

        <article className="preview-card accent">
          <h3>{t('overview.performance.title')}</h3>
          <p>
            {t('overview.performance.body')}
          </p>
        </article>

        <article className="preview-card accent">
          <h3>{t('overview.story.title')}</h3>
          <p>
            {t('overview.story.body')}
          </p>
        </article>
      </div>
    </section>
  )
}
