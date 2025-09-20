'use client'

import { Terminal } from '@/components/terminal/Terminal'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { NormalView } from '@/components/normal/NormalView'

export default function Page() {
  const [mode, setMode] = React.useState<'terminal' | 'normal'>('terminal')
  const [prevMode, setPrevMode] = React.useState<'terminal' | 'normal' | null>(null)
  const [animating, setAnimating] = React.useState(false)

  const switchMode = (next: 'terminal' | 'normal') => {
    if (next === mode) return
    setPrevMode(mode)
    setMode(next)
    setAnimating(true)
    // Prevent layout shift while crossfading by locking body scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => {
      setAnimating(false)
      document.body.style.overflow = originalOverflow
    }, 500)
  }

  const isTerminalActive = mode === 'terminal'
  const showTerminal = animating ? (prevMode === 'terminal' || isTerminalActive) : isTerminalActive
  const showNormal = animating ? (prevMode === 'normal' || !isTerminalActive) : !isTerminalActive

  return (
    <main className="min-h-dvh flex justify-center items-start px-4 pt-10 pb-6">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex items-center justify-center">
          <div className="inline-flex rounded-md border border-terminal-green/20 overflow-hidden">
            <Button
              variant={mode === 'normal' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => switchMode('normal')}
              className="rounded-none"
            >
              Normal
            </Button>
            <Button
              variant={mode === 'terminal' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => switchMode('terminal')}
              className="rounded-none"
            >
              Terminal
            </Button>
          </div>
        </div>
        <div className="relative min-h-[420px]">
          {showTerminal ? (
            <div
              className={[
                'absolute inset-0 transition-opacity duration-500',
                isTerminalActive ? 'opacity-100' : 'opacity-0',
                animating && prevMode === 'terminal' && !isTerminalActive ? 'z-20' : animating && isTerminalActive ? 'z-10' : 'z-0',
              ].join(' ')}
              style={{ transitionDelay: animating && isTerminalActive ? '120ms' : '0ms' }}
            >
              <Terminal />
            </div>
          ) : null}
          {showNormal ? (
            <div
              className={[
                'absolute inset-0 transition-opacity duration-500',
                !isTerminalActive ? 'opacity-100' : 'opacity-0',
                animating && prevMode === 'normal' && isTerminalActive ? 'z-20' : animating && !isTerminalActive ? 'z-10' : 'z-0',
              ].join(' ')}
              style={{ transitionDelay: animating && !isTerminalActive ? '120ms' : '0ms' }}
            >
              <NormalView />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}


