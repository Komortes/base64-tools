export type ToolTypeIconKind =
  | 'auto'
  | 'audio'
  | 'css'
  | 'file'
  | 'hex'
  | 'html'
  | 'image'
  | 'pdf'
  | 'text'
  | 'url'
  | 'video'

interface ToolTypeIconProps {
  kind: ToolTypeIconKind
}

export function ToolTypeIcon({ kind }: ToolTypeIconProps) {
  return (
    <span className="tool-type-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'auto' && (
          <>
            <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
            <path d="M18.5 14.5l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8.8-1.8z" />
          </>
        )}
        {kind === 'audio' && (
          <>
            <path d="M5 10h3l4-4v12l-4-4H5z" />
            <path d="M16 9.5c1.5 1.5 1.5 3.5 0 5" />
            <path d="M18.5 7c3 3 3 7 0 10" />
          </>
        )}
        {kind === 'css' && (
          <>
            <path d="M8 6L5 12l3 6" />
            <path d="M16 6l3 6-3 6" />
            <path d="M11 8h2" />
            <path d="M10 12h4" />
            <path d="M11 16h2" />
          </>
        )}
        {kind === 'file' && (
          <>
            <path d="M7 3h7l5 5v13H7z" />
            <path d="M14 3v5h5" />
          </>
        )}
        {kind === 'hex' && (
          <>
            <path d="M8 4l5-2 5 2 3 5v6l-3 5-5 2-5-2-3-5V9z" />
            <path d="M10 12h4" />
            <path d="M12 10v4" />
          </>
        )}
        {kind === 'html' && (
          <>
            <path d="M8 6l-4 6 4 6" />
            <path d="M16 6l4 6-4 6" />
            <path d="M11 5l2 14" />
          </>
        )}
        {kind === 'image' && (
          <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="M4.5 17l5-5 3 3 3-2 4.5 4" />
          </>
        )}
        {kind === 'pdf' && (
          <>
            <path d="M7 3h7l5 5v13H7z" />
            <path d="M14 3v5h5" />
            <path d="M9 15h2" />
            <path d="M12 15h3" />
            <path d="M9 18h6" />
          </>
        )}
        {kind === 'text' && (
          <>
            <path d="M6 6h12" />
            <path d="M10 6v12" />
            <path d="M8 18h4" />
            <path d="M14 10h4" />
            <path d="M14 14h4" />
          </>
        )}
        {kind === 'url' && (
          <>
            <path d="M10 14l4-4" />
            <path d="M7.5 16.5l-1.5 1.5a3 3 0 104.2 4.2l1.5-1.5" />
            <path d="M16.5 7.5l1.5-1.5a3 3 0 10-4.2-4.2l-1.5 1.5" />
          </>
        )}
        {kind === 'video' && (
          <>
            <rect x="3" y="5" width="14" height="14" rx="2" />
            <path d="M11 10l4 2-4 2z" />
            <path d="M17 10l4-2v8l-4-2" />
          </>
        )}
      </svg>
    </span>
  )
}
