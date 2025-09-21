'use client'

import * as React from 'react'


type OnSelect = (key: string, index: number) => void

export function TerminalNav({
  sections,
  onSelectSection,
}: {
  sections: Record<string, React.ReactNode>
  activeSection?: number | string
  onSelectSection?: OnSelect
}) {

  const keys = React.useMemo(() => Object.keys(sections), [sections])

  return (
    <div className="space-y-3">
      {/* Navigation Bar */}
      <div className="rounded-md border border-terminal-green/40 bg-terminal/60 text-terminal-green">
        <div className="flex items-stretch justify-between px-2 sm:px-4 py-2 font-mono select-none"
             style={{ textShadow: '0 0 6px rgba(0,255,156,0.45)' }}>
          {/* Left cluster: indicators + id (static) */}
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-terminal-green/30">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-terminal-green/30" />
              <span className="h-2.5 w-2.5 rounded-sm bg-terminal-green/60" />
              <span className="h-2.5 w-2.5 rounded-sm bg-terminal-green" />
            </div>
            <span className="text-[10px] tracking-widest uppercase opacity-80">R.U.E - PORT</span>
            <span className="text-[10px] opacity-50">v1.0</span>
          </div>

          {/* Center: bracketed menu (static mapping) */}
          <nav className="flex-1 flex items-center justify-center" role="tablist">
            <ul className="flex items-center gap-4 sm:gap-6 text-[10px] sm:text-xs tracking-wide overflow-x-auto no-scrollbar">
              {keys.map((key, index) => (
                <li
                  key={key}
                  className="whitespace-nowrap cursor-pointer transition-all duration-200 opacity-80 hover:opacity-100 hover:underline"
                  onClick={() => onSelectSection?.(key, index)}
                  role="tab"
                >
                  {`< ${key.toUpperCase()} >`}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right cluster: faux meters (static) */}
          <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-terminal-green/30 text-[10px]">
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
        <div className="h-px w-full bg-terminal-green/30" />
        <div className="h-1 w-full bg-[repeating-linear-gradient(90deg,rgba(0,255,156,0.15)_0_8px,transparent_8px_16px)]" />
      </div>
    </div>
  )
}