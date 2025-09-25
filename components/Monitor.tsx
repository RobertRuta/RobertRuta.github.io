'use client'

import * as React from 'react'
import { Terminal } from './terminal/Terminal'
import { TerminalNav } from './terminal/TerminalNav'
import { ScrollLock } from './lib/ScrollLock'

import Home from './content/Home'
import Timeline from './content/Timeline'
import Projects from './content/Projects'
import CV from './content/CV'
import Contact from './content/Contact'
import { ExperienceItem } from '@/lib/data-interface'
import { ExperiencePage } from './ui/experience-page'


export type MainViewTag = 'HOME' | 'PROJECTS' | 'CV' | 'CONTACT' | 'TIMELINE';
export type ViewTag = MainViewTag | 'EXPERIENCE';

export type ViewProps = {
  onChangeView: (section: ViewTag) => void;
  onExperienceOpen: (item: ExperienceItem) => void;
  onExperienceClose: () => void;
};


export function Monitor()
{    
    const [currentView, setCurrentView] = React.useState<ViewTag>('HOME')
    const [activeExperience, setActiveExperience] = React.useState<ExperienceItem | null>(null);
    const [transitionState, setTransitionState] = React.useState<boolean>(false);

    let prevView: ViewTag = 'HOME';

    const handleViewChange = (nextView: ViewTag, ) => {
      if (nextView === currentView){
        return;
      }

      prevView = currentView

      setAnimating(true)
      setFadePhase('flicker-out')
      const htmlEl = document.documentElement
      htmlEl.classList.add('scroll-lock')
      
      // Clear existing timeouts (cleaner approach)
      if ((handleViewChange as any)._t) {
        window.clearTimeout((handleViewChange as any)._t)
      }
      if ((handleViewChange as any)._half) {
        window.clearTimeout((handleViewChange as any)._half)
      }
      
      // Store timeout IDs on the function itself
      ;(handleViewChange as any)._half = window.setTimeout(() => {
        setCurrentView(nextView)
        setFadePhase('flicker-in')
      }, 200)
      
      ;(handleViewChange as any)._t = window.setTimeout(() => {
        setAnimating(false)
        htmlEl.classList.remove('scroll-lock')
        setFadePhase(null)
      }, 400)
    }
    
    const handleExperienceOpen = (experienceItem: ExperienceItem) => {
      setActiveExperience(experienceItem);
      handleViewChange("EXPERIENCE")
    }
    
    const handleExperienceClose = () => {
      handleViewChange(prevView || "HOME")
    }

    const viewComponents: Record<MainViewTag, React.ReactNode> = {
      HOME:     <Home     onChangeView={ handleViewChange } onExperienceOpen={ handleExperienceOpen } onExperienceClose={ handleExperienceClose }/>,
      PROJECTS: <Projects onChangeView={ handleViewChange } onExperienceOpen={ handleExperienceOpen } onExperienceClose={ handleExperienceClose }/>,
      CV:       <CV       onChangeView={ handleViewChange } onExperienceOpen={ handleExperienceOpen } onExperienceClose={ handleExperienceClose }/>,
      CONTACT:  <Contact  onChangeView={ handleViewChange } onExperienceOpen={ handleExperienceOpen } onExperienceClose={ handleExperienceClose }/>,
      TIMELINE: <Timeline onChangeView={ handleViewChange } onExperienceOpen={ handleExperienceOpen } onExperienceClose={ handleExperienceClose }/>,
    }

    const [fadePhase, setFadePhase] = React.useState<'flicker-out' | 'flicker-in' | null>(null)

    const [animating, setAnimating] = React.useState(false)

    

    return (
        <main className="max-h-screen h-[88vh] flex justify-center max-w-7xl mx-auto sm:px-4 px-2">
            <div className={['max-w-6xl w-full h-full sm:my-10 crt-frame sm:h-[calc(100vh-5rem)]', fadePhase === 'flicker-out' ? 'flicker-out' : fadePhase === 'flicker-in' ? 'flicker-in' : ''].join(' ')}>
              
              <TerminalNav sections={viewComponents} activeSection={currentView} onSelectSection={(key: MainViewTag) => handleViewChange(key)} />

              <div className='crt-content h-[calc(100%-3rem)] overflow-y-auto [-webkit-overflow-scrolling:touch] terminal-scroll'>
                { currentView === 'EXPERIENCE' ? <ExperiencePage experienceItem={activeExperience!} onExperienceClose={handleExperienceClose} /> : (viewComponents[currentView as MainViewTag] || null) }
              </div>
                
              <div className='crt-screen'></div>
            </div>
            <ScrollLock isLocked={true} />
        </main>
    )
}