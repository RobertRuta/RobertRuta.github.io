'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'


type Section = 'ABOUT' | 'SKILLS' | 'PROJECTS' | 'EXPERIENCE' | 'TERMINAL'

export function TerminalNav({
  activeSection: activeSectionProp,
  onSelectSection,
}: {
  activeSection?: Section
  onSelectSection?: (section: Section) => void
}) {
  const [activeSection, setActiveSection] = useState<Section>(activeSectionProp || 'TERMINAL')
  const [highlightedOption, setHighlightedOption] = useState(4) // Start with TERMINAL active
  const navItems: Section[] = ['ABOUT', 'SKILLS', 'PROJECTS', 'EXPERIENCE', 'TERMINAL']
  const inputRef = useRef<HTMLInputElement>(null)

  const handleTerminalInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = e.currentTarget.value.trim()
      if (command) {
        processCommand(command)
      }
      e.currentTarget.value = ''
    }
  }  

  const handleKeyNavigation = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        setHighlightedOption(prev => (prev > 0 ? prev - 1 : navItems.length - 1))
        break
      case 'ArrowRight':
        e.preventDefault()
        setHighlightedOption(prev => (prev < navItems.length - 1 ? prev + 1 : 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        const newSection = navItems[highlightedOption]
        setActiveSection(newSection)
        setHighlightedOption(navItems.indexOf(newSection))
        // Focus terminal input if switching to TERMINAL
        if (newSection === 'TERMINAL' && inputRef.current) {
          setTimeout(() => inputRef.current?.focus(), 100)
        }
        onSelectSection?.(newSection)
        break
      case 'Escape':
        e.preventDefault()
        // Could implement back to terminal or close modal, etc.
        break
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    handleKeyNavigation(e.nativeEvent as KeyboardEvent)
  }


  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()
    
    switch (lowerCommand) {
      case 'about':
      case 'a':
        setActiveSection('ABOUT')
        setHighlightedOption(0)
        onSelectSection?.('ABOUT')
        break
      case 'skills':
      case 's':
        setActiveSection('SKILLS')
        setHighlightedOption(1)
        onSelectSection?.('SKILLS')
        break
      case 'projects':
      case 'p':
        setActiveSection('PROJECTS')
        setHighlightedOption(2)
        onSelectSection?.('PROJECTS')
        break
      case 'experience':
      case 'e':
        setActiveSection('EXPERIENCE')
        setHighlightedOption(3)
        onSelectSection?.('EXPERIENCE')
        break
      case 'clear':
      case 'cls':
        // Clear terminal output (if implemented)
        break
      case 'help':
        alert('Available commands: about, skills, projects, experience, help, clear')
        break
      case 'exit':
        setActiveSection('TERMINAL')
        onSelectSection?.('TERMINAL')
        break
      default:
        console.log(`Command not found: ${command}`)
        // You could add terminal output here
    }
  }

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation)
    return () => window.removeEventListener('keydown', handleKeyNavigation)
  }, [highlightedOption])

  // Update active section when highlighted option changes
  useEffect(() => {
    setActiveSection(navItems[highlightedOption])
  }, [highlightedOption])

  // Sync from external prop
  useEffect(() => {
    if (!activeSectionProp) return
    setActiveSection(activeSectionProp)
    const idx = navItems.indexOf(activeSectionProp)
    if (idx >= 0) setHighlightedOption(idx)
  }, [activeSectionProp])

  return (
    <div className="space-y-3">
      {/* Navigation Bar */}
      <div className="rounded-md border border-terminal-green/40 bg-terminal/60 text-terminal-green">
        <div className="flex items-stretch justify-between px-4 py-2 font-mono select-none" 
             style={{ textShadow: '0 0 6px rgba(0,255,156,0.45)' }}
             tabIndex={0}
             onKeyDown={handleKeyDown}>
          {/* Left cluster: indicators + id */}
          <div className="flex items-center gap-3 pr-4 border-r border-terminal-green/30">
            <div className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-sm transition-colors ${
                activeSection === 'ABOUT' ? 'bg-red-400' : 'bg-terminal-green/30'
              }`} />
              <span className={`h-2.5 w-2.5 rounded-sm transition-colors ${
                activeSection === 'SKILLS' ? 'bg-yellow-400' : 'bg-terminal-green/60'
              }`} />
              <span className={`h-2.5 w-2.5 rounded-sm transition-colors ${
                activeSection === 'TERMINAL' ? 'bg-green-400' : 'bg-terminal-green'
              }`} />
            </div>
            <span className="text-[10px] tracking-widest uppercase opacity-80">pip-port</span>
            <span className="text-[10px] opacity-50">v1.0</span>
          </div>

          {/* Center: bracketed menu */}
          <nav className="flex-1 flex items-center justify-center" role="tablist">
            <ul className="flex items-center gap-6 text-xs tracking-wide">
              {navItems.map((item, index) => (
                <li
                  key={item}
                  className={`cursor-pointer transition-all duration-200 hover:underline ${
                    index === highlightedOption 
                      ? 'font-semibold text-terminal-green/100 animate-pulse' 
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  onClick={() => {
                    setHighlightedOption(index)
                    setActiveSection(item)
                    onSelectSection?.(item)
                  }}
                  role="tab"
                  aria-selected={item === activeSection}
                >
                  {`< ${item} >`}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right cluster: faux meters */}
          <div className="flex items-center gap-4 pl-4 border-l border-terminal-green/30 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="opacity-70">SIG</span>
              <div className="flex items-end gap-0.5">
                <span className={`block transition-all h-1.5 w-1 ${
                  activeSection === 'ABOUT' ? 'bg-red-400' : 'bg-terminal-green/40'
                }`} />
                <span className={`block transition-all h-2 w-1 ${
                  activeSection === 'SKILLS' ? 'bg-yellow-400' : 'bg-terminal-green/60'
                }`} />
                <span className={`block transition-all h-2.5 w-1 ${
                  activeSection === 'PROJECTS' ? 'bg-blue-400' : 'bg-terminal-green/80'
                }`} />
                <span className={`block transition-all h-3 w-1 ${
                  activeSection === 'EXPERIENCE' ? 'bg-purple-400' : 'bg-terminal-green'
                }`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-70">HP</span>
              <div className="h-1.5 w-20 bg-terminal-green/10">
                <div 
                  className={`h-1.5 bg-terminal-green transition-all duration-300 ${
                    activeSection ? 'w-3/4' : 'w-1/4'
                  }`}
                />
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