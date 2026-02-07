import type { ToolTypeIconKind } from '../ToolTypeIcon'
import { ToolTypeIcon } from '../ToolTypeIcon'

interface ModeSelectorItem<TKind extends ToolTypeIconKind> {
  kind: TKind
  label: string
}

interface ModeSelectorProps<TKind extends ToolTypeIconKind> {
  activeKind: TKind
  items: Array<ModeSelectorItem<TKind>>
  onSelect: (kind: TKind) => void
}

export function ModeSelector<TKind extends ToolTypeIconKind>({
  activeKind,
  items,
  onSelect,
}: ModeSelectorProps<TKind>) {
  return (
    <div className="encoder-type-grid">
      {items.map((item) => (
        <button
          key={item.kind}
          type="button"
          onClick={() => onSelect(item.kind)}
          className={`mode-pill${activeKind === item.kind ? ' is-active' : ''}`}
        >
          <span className="mode-pill-inner">
            <ToolTypeIcon kind={item.kind} />
            <span>{item.label}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
