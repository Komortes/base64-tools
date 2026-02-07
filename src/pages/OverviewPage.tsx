export function OverviewPage() {
  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>All-in-one Base64 Workspace</h2>
        <p>Private, browser-only utilities for text, images, files, data URLs and validation.</p>
      </div>

      <div className="overview-grid">
        <article className="preview-card">
          <h3>What is included</h3>
          <ul>
            <li>Converter with URL-safe and padding controls.</li>
            <li>Smart decode for image, PDF, text, audio and video.</li>
            <li>Data URL parser with payload extraction and download.</li>
            <li>Detailed validator with normalization and error reasons.</li>
          </ul>
        </article>

        <article className="preview-card">
          <h3>Privacy model</h3>
          <ul>
            <li>No backend calls for encode/decode operations.</li>
            <li>Input stays in your browser session.</li>
            <li>Blob previews are generated locally.</li>
            <li>No hidden upload queue.</li>
          </ul>
        </article>

        <article className="preview-card">
          <h3>Quick flow</h3>
          <ol>
            <li>Paste Base64 or Data URL into Smart Decode.</li>
            <li>Check detected MIME and preview block.</li>
            <li>Download with the suggested extension.</li>
          </ol>
        </article>

        <article className="preview-card accent">
          <h3>Tip for big payloads</h3>
          <p>
            For very large strings, decode in chunks or move heavy operations to Web Worker
            in v2 to avoid UI freezes.
          </p>
        </article>
      </div>
    </section>
  )
}
