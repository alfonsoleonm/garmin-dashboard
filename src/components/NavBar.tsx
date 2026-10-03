export type Tab = 'today' | 'trends' | 'settings'

interface NavBarProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '◎' },
  { id: 'trends', label: 'Trends', icon: '↗' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 3,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: active ? 'var(--color-green)' : 'var(--color-text-secondary)',
  fontSize: 11,
  fontWeight: active ? 700 : 500,
  letterSpacing: '0.04em',
  transition: 'color 0.15s',
  WebkitTapHighlightColor: 'transparent',
})

export function NavBar({ active, onChange }: NavBarProps) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="bottom-nav-inner">
        {tabs.map(t => (
          <button
            key={t.id}
            style={tabStyle(active === t.id)}
            onClick={() => onChange(t.id)}
            aria-current={active === t.id ? 'page' : undefined}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
