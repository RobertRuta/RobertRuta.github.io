'use client'

import { Terminal } from '@/components/terminal/Terminal'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { NormalView } from '@/components/normal/NormalView'
import { GlitchOverlay } from '@/components/effects/GlitchOverlay'
import { TimelineView } from '@/components/timeline/TimelineView'

export default function Page() {
  const [mode, setMode] = React.useState<'timeline' | 'normal' | 'terminal'>('terminal')
  const [prevMode, setPrevMode] = React.useState<'timeline' | 'normal' | 'terminal' | null>(null)
  const [animating, setAnimating] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersCoarse = window.matchMedia('(pointer: coarse)').matches
    const smallViewport = window.matchMedia('(max-width: 640px)').matches
    if (prefersCoarse || smallViewport) {
      setMode('normal')
    }
  }, [])

  const switchMode = (next: 'timeline' | 'normal' | 'terminal') => {
    if (next === mode) return
    setPrevMode(mode)
    setMode(next)
    setAnimating(true)
    // Prevent layout shift while crossfading by locking scroll on <html>
    const htmlEl = document.documentElement
    htmlEl.classList.add('scroll-lock')
    window.clearTimeout((switchMode as any)._t)
    ;(switchMode as any)._t = window.setTimeout(() => {
      setAnimating(false)
      htmlEl.classList.remove('scroll-lock')
    }, 820)
  }

  const isTerminalActive = mode === 'terminal'
  const isTimelineActive = mode === 'timeline'
  const showTerminal = animating ? (prevMode === 'terminal' || isTerminalActive) : isTerminalActive
  const showNormal = animating ? (prevMode === 'normal' || (!isTerminalActive && !isTimelineActive)) : (!isTerminalActive && !isTimelineActive)
  const showTimeline = animating ? (prevMode === 'timeline' || isTimelineActive) : isTimelineActive

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
          <GlitchOverlay active={animating} fullscreen={false} overscanX={1} />
          {showTimeline ? (
            <div
              className={[
                'absolute inset-0 transition-opacity duration-500',
                isTimelineActive ? 'opacity-100' : 'opacity-0',
                animating && prevMode === 'timeline' && !isTimelineActive ? 'z-20' : animating && isTimelineActive ? 'z-10' : 'z-0',
              ].join(' ')}
              style={{ transitionDelay: animating && isTimelineActive ? '120ms' : '0ms' }}
            >
              <TimelineView />
            </div>
          ) : null}
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
                !isTerminalActive && !isTimelineActive ? 'opacity-100' : 'opacity-0',
                animating && prevMode === 'normal' && (isTerminalActive || isTimelineActive) ? 'z-20' : animating && !isTerminalActive && !isTimelineActive ? 'z-10' : 'z-0',
              ].join(' ')}
              style={{ transitionDelay: animating && !isTerminalActive && !isTimelineActive ? '120ms' : '0ms' }}
            >
              <NormalView />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}


