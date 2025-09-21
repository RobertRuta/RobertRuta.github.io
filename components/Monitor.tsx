'use client'
import * as React from 'react'
import { NormalView } from './normal/NormalView'
import { AboutView } from './normal/AboutView'
import { Terminal } from './terminal/Terminal'
import { TerminalNav } from './terminal/TerminalNav'


export function Monitor() {
    const [displayMode, setDisplayMode] = React.useState<'terminal' | 'about'>('terminal')
    const [fadePhase, setFadePhase] = React.useState<'flicker-out' | 'flicker-in' | null>(null)
    const [animating, setAnimating] = React.useState(false)

    const switchMode = (next: 'terminal' | 'about') => {
      if ((next === 'terminal' && displayMode === 'terminal') || (next === 'about' && displayMode === 'about')) return
      setAnimating(true)
      setFadePhase('flicker-out')
      const htmlEl = document.documentElement
      htmlEl.classList.add('scroll-lock')
      window.clearTimeout((switchMode as any)._t)
      window.clearTimeout((switchMode as any)._half)
      ;(switchMode as any)._half = window.setTimeout(() => {
        setDisplayMode(next)
        setFadePhase('flicker-in')
      }, 200)
      ;(switchMode as any)._t = window.setTimeout(() => {
        setAnimating(false)
        htmlEl.classList.remove('scroll-lock')
        setFadePhase(null)
      }, 400)
    }

    const handleSelectSection = (section: 'ABOUT' | 'SKILLS' | 'PROJECTS' | 'EXPERIENCE' | 'TERMINAL') => {
      if (section === 'ABOUT') { switchMode('about'); return }
      if (section === 'TERMINAL') { switchMode('terminal'); return }
    }

    return (
        <main className="max-h-screen h-screen flex justify-center max-w-7xl mx-auto">
            <div className='max-w-6xl w-full my-10 crt-frame h-[calc(100vh-5rem)]'>
              <TerminalNav activeSection={displayMode === 'about' ? 'ABOUT' : 'TERMINAL'} onSelectSection={handleSelectSection} />
              <div className={['crt-content h-[calc(100%-3rem)] overflow-y-auto [-webkit-overflow-scrolling:touch] terminal-scroll', fadePhase === 'flicker-out' ? 'flicker-out' : fadePhase === 'flicker-in' ? 'flicker-in' : ''].join(' ')}>
                {displayMode === 'about' ? <AboutView /> : <Terminal />}
              </div>
                
              <div className='crt-screen'></div>
            </div>
        </main>
    )
}

// {/* <div className="w-full h-screen space-y-4">
// <div className="flex items-center justify-center">

// {/* View Mode Switcher */}
// <div className="inline-flex rounded-md border border-terminal-green/20 overflow-hidden">
//     <Button
//     variant={mode === 'timeline' ? 'default' : 'secondary'}
//     size="sm"
//     onClick={() => switchMode('timeline')}
//     className="rounded-none"
//     >
//     Timeline
//     </Button>
//     <Button
//     variant={mode === 'normal' ? 'default' : 'secondary'}
//     size="sm"
//     onClick={() => switchMode('normal')}
//     className="rounded-none"
//     >
//     Normal
//     </Button>
//     <Button
//     variant={mode === 'terminal' ? 'default' : 'secondary'}
//     size="sm"
//     onClick={() => switchMode('terminal')}
//     className="rounded-none"
//     >
//     Terminal
//     </Button>
// </div>
// </div>

// {/* Main Content */}
// <div className="relative bg-terminal-dim/10 border border-terminal-green/30 rounded-lg">
// <div
//     className={['absolute inset-0 p-6', fadePhase === 'flicker-out' ? 'flicker-out' : fadePhase === 'flicker-in' ? 'flicker-in' : ''].join(' ')}
// >
//     {displayMode === 'timeline' ? (
//     <TimelineView />
//     ) : displayMode === 'terminal' ? (
//     <Terminal />
//     ) : (
//     <NormalView />
//     )}
// </div>
// </div>
// </div> */}