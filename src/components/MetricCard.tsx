import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  children: ReactNode
}

export function MetricCard({ title, children }: MetricCardProps) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      {children}
    </div>
  )
}
