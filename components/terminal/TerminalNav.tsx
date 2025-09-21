'use client'

import * as React from 'react'


type OnSelect = (key: string, index: number) => void

export function TerminalNav({
  sections,
  onSelectSection,
  activeSection,
}: {
  sections: Record<string, React.ReactNode>
  activeSection?: number | string
  onSelectSection?: OnSelect
}) {

  const keys = React.useMemo(() => Object.keys(sections), [sections])
  const listRef = React.useRef<HTMLUListElement | null>(null)
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([])
  const scrollIdle = React.useRef<number | null>(null)

  const activeIndex = React.useMemo(() => {
    if (typeof activeSection === 'number') return Math.max(0, Math.min(keys.length - 1, activeSection))
    if (typeof activeSection === 'string') return Math.max(0, keys.indexOf(activeSection))
    return 0
  }, [activeSection, keys])

  React.useEffect(() => {
    const el = itemRefs.current[activeIndex]
    if (!el) return
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' as any })
    } catch {
      // fallback center calculation
      const list = listRef.current
      if (!list) return
      const liRect = el.getBoundingClientRect()
      const listRect = list.getBoundingClientRect()
      const delta = (liRect.left + liRect.width / 2) - (listRect.left + listRect.width / 2)
      list.scrollLeft += delta
    }
  }, [activeIndex])

  const onScroll: React.UIEventHandler<HTMLUListElement> = () => {
    if (scrollIdle.current) {
      window.clearTimeout(scrollIdle.current)
    }
    scrollIdle.current = window.setTimeout(() => {
      const list = listRef.current
      if (!list) return
      const listRect = list.getBoundingClientRect()
      const centerX = listRect.left + listRect.width / 2
      let bestIdx = 0
      let bestDist = Number.POSITIVE_INFINITY
      for (let i = 0; i < itemRefs.current.length; i++) {
        const li = itemRefs.current[i]
        if (!li) continue
        const r = li.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const d = Math.abs(cx - centerX)
        if (d < bestDist) {
          bestDist = d
          bestIdx = i
        }
      }
      const key = keys[bestIdx]
      onSelectSection?.(key, bestIdx)
    }, 120)
  }

  return (
    <div className="space-y-3 py-6 px-4">
      {/* Navigation Bar */}
      <div className="rounded-md border border-terminal-green/40 bg-terminal/60 text-terminal-green py-4 md:py-0">
        <div className="flex items-stretch justify-between px-2 sm:px-4 py-2 font-mono select-none"
             style={{ textShadow: '0 0 6px rgba(0,255,156,0.45)' }}>
          {/* Left cluster: indicators + id (static) */}
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-terminal-green/30 flex-none">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-terminal-green/30" />
              <span className="h-2.5 w-2.5 rounded-sm bg-terminal-green/60" />
              <span className="h-2.5 w-2.5 rounded-sm bg-terminal-green" />
            </div>
            <span className="text-[10px] tracking-widest uppercase opacity-80">R.U.E - PORT</span>
            <span className="text-[10px] opacity-50">v1.0</span>
          </div>

          {/* Center: bracketed menu (static mapping) */}
          <nav className="flex-1 min-w-0 flex items-center justify-start sm:justify-center" role="tablist">
            <ul
              ref={listRef}
              onScroll={onScroll}
              className="w-full flex items-center gap-2 sm:gap-6 text-[10px] sm:text-xs tracking-wide overflow-x-auto sm:overflow-x-visible no-scrollbar snap-x snap-mandatory sm:snap-none scroll-smooth touch-pan-x overscroll-x-contain px-2 sm:px-0"
            >
              {keys.map((key, index) => {
                const isActive = typeof activeSection === 'number' ? activeSection === index : activeSection === key
                return (
                  <li
                    key={key}
                    ref={(el) => { itemRefs.current[index] = el }}
                    className={[
                      'whitespace-nowrap cursor-pointer transition-all duration-200 snap-center [scroll-snap-stop:always] px-3 py-1 rounded',
                      'min-w-[66%] sm:min-w-0',
                      isActive ? 'opacity-100 underline' : 'opacity-80 hover:opacity-100 hover:underline',
                    ].join(' ')}
                    onClick={() => onSelectSection?.(key, index)}
                    role="tab"
                  >
                    {`< ${key.toUpperCase()} >`}
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Right cluster: faux meters (static) */}
          <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-terminal-green/30 text-[10px] flex-none">
            <div className="flex items-center gap-2">
              <span className="opacity-70">SIG</span>
              <div className="flex items-end gap-0.5">
                <span className="block h-1.5 w-1 bg-terminal-green/40" />
                <span className="block h-2 w-1 bg-terminal-green/60" />
                <span className="block h-2.5 w-1 bg-terminal-green/80" />
                <span className="block h-3 w-1 bg-terminal-green" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-70">HP</span>
              <div className="h-1.5 w-20 bg-terminal-green/10">
                <div className="h-1.5 w-3/4 bg-terminal-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hairline & scan accent */}
        <div className="flex h-px w-full bg-terminal-green/30 hidden md:blcok" />
        <div className="flex h-1 w-full bg-[repeating-linear-gradient(90deg,rgba(0,255,156,0.15)_0_8px,transparent_8px_16px)] hidden md:block" />
      </div>
    </div>
  )
}