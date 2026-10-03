interface RingGaugeProps {
  /** Fill level 0-100 (100 = full ring). */
  value: number | null
  size?: number
  strokeWidth?: number
  label: string
  /** Override zone-based color with an explicit CSS value. */
  color?: string
  /** Override the center text (default: Math.round(value)). */
  centerText?: string
}

function zoneColor(value: number): string {
  if (value >= 67) return 'var(--color-green)'
  if (value >= 34) return 'var(--color-amber)'
  return 'var(--color-red)'
}

export function RingGauge({ value, size = 96, strokeWidth = 9, label, color, centerText }: RingGaugeProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const pct = value != null ? Math.min(Math.max(value / 100, 0), 1) : 0
  const offset = circumference * (1 - pct)
  const ringColor = color ?? (value != null ? zoneColor(value) : 'var(--color-border)')
  const cx = size / 2
  const cy = size / 2
  const display = centerText ?? (value != null ? String(Math.round(value)) : '—')

  return (
    <div className="ring-wrapper">
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={`${label}: ${display}`}
      >
        {/* track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        {/* fill */}
        {value != null && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        )}
        {/* center value */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={ringColor}
          fontSize={size * 0.22}
          fontWeight={700}
        >
          {display}
        </text>
      </svg>
      <span className="ring-label">{label}</span>
    </div>
  )
}
