'use client'
import * as React from 'react'
import { NormalView } from './normal/NormalView'
import { AboutView } from './normal/AboutView'
import { Terminal } from './terminal/Terminal'
import { TerminalNav } from './terminal/TerminalNav'
import { ScrollLock } from './lib/ScrollLock'

import Home from './content/Home'
import Timeline from './content/Timeline'
import Projects from './content/Projects'
import CV from './content/CV'
import Contact from './content/Contact'


const sections: { [key: string]: React.ReactNode } = {
  HOME: <Home />,
  PROJECTS: <Projects />,
  CV: <CV />,
  CONTACT: <Contact />,
  TIMELINE: <Timeline />,
  TERMINAL: <Terminal />
}


export function Monitor() {
    const [activeSection, setActiveSection] = React.useState<string>(() => {
      const keys = Object.keys(sections)
      return keys[0]
    })
    const [fadePhase, setFadePhase] = React.useState<'flicker-out' | 'flicker-in' | null>(null)
    const [animating, setAnimating] = React.useState(false)

    const switchMode = (nextKey: string) => {
      // Early return
      if (nextKey === activeSection) return
    
      setAnimating(true)
      setFadePhase('flicker-out')
      const htmlEl = document.documentElement
      htmlEl.classList.add('scroll-lock')
      
      // Clear existing timeouts (cleaner approach)
      if ((switchMode as any)._t) {
        window.clearTimeout((switchMode as any)._t)
      }
      if ((switchMode as any)._half) {
        window.clearTimeout((switchMode as any)._half)
      }
      
      // Store timeout IDs on the function itself (unconventional but works)
      ;(switchMode as any)._half = window.setTimeout(() => {
        setActiveSection(nextKey)
        setFadePhase('flicker-in')
      }, 200)
      
      ;(switchMode as any)._t = window.setTimeout(() => {
        setAnimating(false)
        htmlEl.classList.remove('scroll-lock')
        setFadePhase(null)
      }, 400)
    }

    const handleSelectSection = (key: string) => switchMode(key)

    return (
        <main className="max-h-screen h-[88vh] flex justify-center max-w-7xl mx-auto sm:px-4 px-2">
            <div className={['max-w-6xl w-full h-full sm:my-10 crt-frame sm:h-[calc(100vh-5rem)]', fadePhase === 'flicker-out' ? 'flicker-out' : fadePhase === 'flicker-in' ? 'flicker-in' : ''].join(' ')}>
              
              <TerminalNav sections={sections} activeSection={activeSection} onSelectSection={(key) => handleSelectSection(key)} />

              <div className='crt-content h-[calc(100%-3rem)] overflow-y-auto [-webkit-overflow-scrolling:touch] terminal-scroll'>
                {sections[activeSection] || null}
              </div>
                
              <div className='crt-screen'></div>
            </div>
            <ScrollLock isLocked={true} />
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