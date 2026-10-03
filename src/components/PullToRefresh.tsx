import { useRef, type ReactNode } from 'react'

interface PullToRefreshProps {
  onRefresh: () => void
  children: ReactNode
}

const THRESHOLD = 60

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const startY = useRef<number | null>(null)
  const pulling = useRef(false)

  function onTouchStart(e: React.TouchEvent) {
    const el = e.currentTarget as HTMLElement
    if (el.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > THRESHOLD) pulling.current = true
  }

  function onTouchEnd() {
    if (pulling.current) {
      onRefresh()
    }
    startY.current = null
    pulling.current = false
  }

  return (
    <div
      className="ptr-wrapper page-content"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  )
}
