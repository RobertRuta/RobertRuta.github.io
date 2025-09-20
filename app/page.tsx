'use client'

import { Terminal } from '@/components/terminal/Terminal'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { NormalView } from '@/components/normal/NormalView'
import { TimelineView } from '@/components/timeline/TimelineView'

export default function Page() {
  const [mode, setMode] = React.useState<'timeline' | 'normal' | 'terminal'>('terminal')
  const [prevMode, setPrevMode] = React.useState<'timeline' | 'normal' | 'terminal' | null>(null)
  const [animating, setAnimating] = React.useState(false)
  const [displayMode, setDisplayMode] = React.useState<'timeline' | 'normal' | 'terminal'>('terminal')
  const [fadePhase, setFadePhase] = React.useState<'out' | 'in' | 'flicker-out' | 'flicker-in' | null>(null)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersCoarse = window.matchMedia('(pointer: coarse)').matches
    const smallViewport = window.matchMedia('(max-width: 640px)').matches
    if (prefersCoarse || smallViewport) {
      setMode('normal')
      setDisplayMode('normal')
    }
  }, [])

  const switchMode = (next: 'timeline' | 'normal' | 'terminal') => {
    if (next === mode) return
    setPrevMode(mode)
    setMode(next)
    setAnimating(true)
    setFadePhase('flicker-out')
    // Prevent layout shift while crossfading by locking scroll on <html>
    const htmlEl = document.documentElement
    htmlEl.classList.add('scroll-lock')
    window.clearTimeout((switchMode as any)._t)
    window.clearTimeout((switchMode as any)._half)
    ;(switchMode as any)._half = window.setTimeout(() => {
      setDisplayMode(next)
      setFadePhase('flicker-in')
    }, 400)
    ;(switchMode as any)._t = window.setTimeout(() => {
      setAnimating(false)
      htmlEl.classList.remove('scroll-lock')
      setFadePhase(null)
    }, 820)
  }

  const isTerminalActive = mode === 'terminal'
  const isTimelineActive = mode === 'timeline'

  return (
    <main className="min-h-dvh flex justify-center items-start px-4 pt-10 pb-6">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex items-center justify-center">
          <div className="inline-flex rounded-md border border-terminal-green/20 overflow-hidden">
            <Button
              variant={mode === 'timeline' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => switchMode('timeline')}
              className="rounded-none"
            >
              Timeline
            </Button>
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
        <div className="relative min-h-[1020px]">
          <div
            className={['absolute inset-0', fadePhase === 'flicker-out' ? 'flicker-out' : fadePhase === 'flicker-in' ? 'flicker-in' : ''].join(' ')}
          >
            {displayMode === 'timeline' ? (
              <TimelineView />
            ) : displayMode === 'terminal' ? (
              <Terminal />
            ) : (
              <NormalView />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}


