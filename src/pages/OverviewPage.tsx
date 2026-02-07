import { Link } from 'react-router'

export function OverviewPage() {
  return (
    <section className="tool-panel overview-page">
      <div className="overview-hero">
        <div className="overview-hero-main">
          <h2>Fast Base64 Workspace</h2>
          <p>
            Encode and decode text, media, files, and data URLs in one place.
          </p>
        </div>
      </div>

      <div className="overview-grid">
        <article className="preview-card mode-map-card">
          <h3>Mode Map</h3>
          <div className="mode-map-grid">
            <Link className="mode-map-link" to="/encoders">
              <div className="mode-map-item">
                <h4>Encoders</h4>
                <p>Best when you have source content and need Base64.</p>
              </div>
            </Link>
            <Link className="mode-map-link" to="/decoders">
              <div className="mode-map-item">
                <h4>Decoders</h4>
                <p>Best when you already have Base64 and need usable output.</p>
              </div>
            </Link>
            <Link className="mode-map-link" to="/tools/data-url">
              <div className="mode-map-item">
                <h4>Data URL</h4>
                <p>Parse payload, inspect metadata, and extract clean content.</p>
              </div>
            </Link>
            <Link className="mode-map-link" to="/tools/validator">
              <div className="mode-map-item">
                <h4>Validator</h4>
                <p>Check invalid symbols, bad padding, and normalization issues.</p>
              </div>
            </Link>
          </div>
        </article>

        <article className="preview-card accent">
          <h3>Performance Note</h3>
          <p>
            For very large payloads, use dedicated modes in Decoders and split heavy
            operations if needed. Web Worker support can be added next for smoother UX.
          </p>
        </article>

        <article className="preview-card accent">
          <h3>Why I Built This</h3>
          <p>
            This started as a personal pet project because I wanted a Base64 tool
            that feels fast and straightforward for everyday use. I keep it intentionally
            practical and add improvements gradually as new real use cases appear.
          </p>
        </article>
      </div>
    </section>
  )
}
