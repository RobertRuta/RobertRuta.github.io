'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { skills, projects, experience, contacts } from '@/lib/profile'

type CommandHandler = (args: string[]) => React.ReactNode

type CommandSpec = {
  description: string
  usage?: string
  handler: CommandHandler
}

// Data moved to lib/profile
// Minimal virtual filesystem for terminal-like navigation
const fs: Record<string, string[]> = {
  '/': ['home/', 'about.md'],
  '/home': ['about.md', 'contact.txt', 'projects/', 'skills.txt', 'experience/'],
  '/home/projects': ['terminal-portfolio/', 'readme.md'],
  '/home/experience': ['timeline.md'],
}

function resolvePath(path: string, cwd: string): string {
  if (!path || path === '.') return cwd
  let result = path.startsWith('/') ? path : `${cwd}/${path}`
  const parts = result.split('/').filter(Boolean)
  const stack: string[] = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') stack.pop()
    else stack.push(part)
  }
  return '/' + stack.join('/')
}

type SectionProps = {
  onChangeView: (section: string) => void;
};

export function Terminal({ onChangeView }: SectionProps) {
  const [history, setHistory] = React.useState<React.ReactNode[]>([<Intro key="intro" />])
  const [input, setInput] = React.useState('help')
  const [cursor, setCursor] = React.useState<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [heightPx, setHeightPx] = React.useState<number>(420)
  const resizeState = React.useRef<{
    startY: number
    startHeight: number
  } | null>(null)

  const [commandHistory, setCommandHistory] = React.useState<string[]>([])
  const [historyPointer, setHistoryPointer] = React.useState<number | null>(null)
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark')
  const [cwd, setCwd] = React.useState<string>('/home')
  const inputBarHeight = 44
  const separatorOffset = 20

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersCoarse = window.matchMedia('(pointer: coarse)').matches
    if (!prefersCoarse) {
      inputRef.current?.focus()
    }
  }, [])

  React.useEffect(() => {
    cursor?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [history, cursor])

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const commands: Record<string, CommandSpec> = React.useMemo(
    () => ({
      help: {
        description: 'Show available commands',
        handler: () => (
          <div>
            <p className="mb-2">Available commands:</p>
            <ul className="space-y-1">
              {Object.entries(commands)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, spec]) => (
                  <li key={name}>
                    <span className="text-terminal-green">{name}</span>
                    {spec.usage ? <span className="opacity-70"> {spec.usage}</span> : null}
                    <span className="opacity-70"> — {spec.description}</span>
                  </li>
                ))}
            </ul>
          </div>
        ),
      },
      whoami: {
        description: 'Short bio',
        handler: () => (
          <div>
            I’m Robert, a programmer focused on product quality and team enablement. Future engineering team lead.
          </div>
        ),
      },
      about: {
        description: 'About Robert',
        handler: () => (
          <div className="space-y-2">
            <p>
              Hi, I’m <span className="font-bold">Robert Ruta</span>. I’m a programmer aiming to become a future
              software engineering team leader. I enjoy building clean, reliable systems and empowering teams.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </div>
        ),
      },
      skills: {
        description: 'List key skills',
        handler: () => (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        ),
      },
      projects: {
        description: 'Show highlighted projects',
        handler: () => (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.name} className="space-y-1">
                <div className="flex items-center gap-2">
                  <a className="underline decoration-terminal-green/30 underline-offset-4" href={p.link} target="_blank" rel="noreferrer">
                    {p.name}
                  </a>
                  <div className="flex flex-wrap gap-1">
                    {p.stack.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
                <p className="opacity-80 text-sm">{p.description}</p>
              </div>
            ))}
          </div>
        ),
      },
      experience: {
        description: 'Show experience timeline',
        handler: () => (
          <div className="space-y-3">
            {experience.map((e) => (
              <div key={e.role}>
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold">{e.role} — {e.org}</div>
                  <div className="opacity-70 text-xs">{e.period}</div>
                </div>
                <ul className="list-disc list-inside opacity-90 text-sm mt-1">
                  {e.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ),
      },
      contact: {
        description: 'Ways to reach out',
        handler: () => (
          <div className="space-y-1">
            <p>Phone: <span>{contacts.phone}</span></p>
            <p>Email: <a className="underline decoration-terminal-green/30 underline-offset-4" href={`mailto:${contacts.email}`}>{contacts.email}</a></p>
            <p>GitHub: <a className="underline decoration-terminal-green/30 underline-offset-4" href={contacts.github} target="_blank" rel="noreferrer">@RobertRuta</a></p>
            <p>LinkedIn: <a className="underline decoration-terminal-green/30 underline-offset-4" href={contacts.linkedin} target="_blank" rel="noreferrer">/in/robert-ruta</a></p>
            <p>Location: <span>{contacts.location}</span></p>
          </div>
        ),
      },
      ls: {
        description: 'List directory',
        usage: '[path]'
        ,
        handler: (args) => {
          const target = resolvePath(args[0] || '.', cwd)
          const entries = fs[target]
          if (!entries) return <div className="text-red-400">ls: cannot access '{args[0] || '.'}': No such file or directory</div>
          return (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {entries.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
          )
        },
      },
      pwd: {
        description: 'Print working directory',
        handler: () => <div>{cwd}</div>,
      },
      cd: {
        description: 'Change directory',
        usage: '[path]'
        ,
        handler: (args) => {
          const next = resolvePath(args[0] || '/home', cwd)
          if (!fs[next]) return <div className="text-red-400">cd: {args[0] || ''}: No such file or directory</div>
          setCwd(next)
          return <div></div>
        },
      },
      echo: {
        description: 'Write arguments to the output',
        usage: '[...args]'
        ,
        handler: (args) => <div>{args.join(' ')}</div>,
      },
      date: {
        description: 'Show current date/time',
        handler: () => <div>{new Date().toString()}</div>,
      },
      history: {
        description: 'Show recently executed commands',
        handler: () => (
          <div className="opacity-80 text-sm space-y-0.5">
            {commandHistory.slice(-20).map((c, i) => (
              <div key={`${c}-${i}`}>{c}</div>
            ))}
          </div>
        ),
      },
      source: {
        description: 'Link to site source code',
        handler: () => (
          <div>
            <a className="underline decoration-terminal-green/30 underline-offset-4" href="https://github.com/RobertRuta/RobertRuta.github.io" target="_blank" rel="noreferrer">
              github.com/RobertRuta/RobertRuta.github.io
            </a>
          </div>
        ),
      },
      open: {
        description: 'Open a link by alias',
        usage: '[github|linkedin|email|site]'
        ,
        handler: (args) => {
          const alias = (args[0] || '').toLowerCase()
          const mapping: Record<string, string> = {
            github: contacts.github,
            linkedin: contacts.linkedin,
            email: `mailto:${contacts.email}`,
            site: contacts.site,
          }
          const url = mapping[alias]
          if (url) {
            if (typeof window !== 'undefined') {
              try { window.open(url, '_blank', 'noopener,noreferrer') } catch {}
            }
            return (
              <div>
                Opening{' '}
                <a className="underline decoration-terminal-green/30 underline-offset-4" href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              </div>
            )
          }
          return <div className="text-red-400">Unknown alias. Try: github, linkedin, email, site</div>
        },
      },
      resume: {
        description: 'View or download resume',
        handler: () => (
          <div>
            <span>Resume:</span>{' '}
            <a className="underline decoration-terminal-green/30 underline-offset-4" href="https://www.linkedin.com/in/robert-ruta/details/resume/" target="_blank" rel="noreferrer">
              LinkedIn resume
            </a>
          </div>
        ),
      },
      theme: {
        description: 'Switch theme',
        usage: '[dark|light|toggle]',
        handler: (args) => {
          const mode = (args[0] || 'toggle').toLowerCase()
          setTheme((prev) => {
            if (mode === 'dark') return 'dark'
            if (mode === 'light') return 'light'
            return prev === 'dark' ? 'light' : 'dark'
          })
          return <div>Theme set to <span className="font-semibold">{mode === 'toggle' ? 'toggled' : mode}</span>.</div>
        },
      },
      clear: {
        description: 'Clear the terminal',
        handler: () => {
          setHistory([])
          return null
        },
      },
      cls: {
        description: 'Alias for clear',
        handler: () => {
          setHistory([])
          return null
        },
      },
    }),
    [commandHistory, theme, cwd],
  )

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const rawInput = input
    const trimmed = rawInput.trim()
    const prompt = <Prompt key={`prompt-${history.length}`} command={rawInput} />
    if (!trimmed) {
      setHistory((h) => [...h, prompt])
      setCommandHistory((h) => [...h, rawInput])
      setHistoryPointer(null)
      setInput('')
      return
    }
    const [name, ...args] = trimmed.split(/\s+/)
    const cmd = commands[name]
    if (!cmd) {
      setHistory((h) => [...h, prompt, <div key={`err-${h.length}`} className="text-red-400">Command not found: {name}</div>])
    } else {
      const output = cmd.handler(args)
      setHistory((h) => [...h, prompt, output])
    }
    setCommandHistory((h) => [...h, trimmed])
    setHistoryPointer(null)
    setInput('')
  }

  const commandNames = React.useMemo(() => Object.keys(commands), [commands])
  const suggestions = React.useMemo(
    () => (input ? commandNames.filter((n) => n.startsWith(input)) : []),
    [commandNames, input],
  )
  const firstSuggestion = suggestions[0]

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Tab') {
      if (firstSuggestion) {
        e.preventDefault()
        setInput(firstSuggestion)
      }
      return
    }
    if (e.key === 'ArrowUp') {
      if (commandHistory.length === 0) return
      e.preventDefault()
      setHistoryPointer((ptr) => {
        const nextPtr = ptr === null ? commandHistory.length - 1 : Math.max(0, ptr - 1)
        setInput(commandHistory[nextPtr] || '')
        return nextPtr
      })
      return
    }
    if (e.key === 'ArrowDown') {
      if (commandHistory.length === 0) return
      e.preventDefault()
      setHistoryPointer((ptr) => {
        if (ptr === null) return null
        if (ptr >= commandHistory.length - 1) {
          setInput('')
          return null
        }
        const nextPtr = ptr + 1
        setInput(commandHistory[nextPtr] || '')
        return nextPtr
      })
      return
    }
  }

  const onResizeMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const prevBodySelect = document.body.style.userSelect
    const prevDocSelect = document.documentElement.style.userSelect
    document.body.style.userSelect = 'none'
    document.documentElement.style.userSelect = 'none'
    resizeState.current = {
      startY: e.clientY,
      startHeight: heightPx,
    }
    const onMove = (ev: MouseEvent) => {
      ev.preventDefault()
      const deltaY = ev.clientY - (resizeState.current?.startY || 0)
      const nextH = Math.min(800, Math.max(240, (resizeState.current?.startHeight || heightPx) + deltaY))
      setHeightPx(nextH)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.userSelect = prevBodySelect
      document.documentElement.style.userSelect = prevDocSelect
      resizeState.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <Card className="mx-auto w-full" style={{ width: '100%' }}>
      <CardHeader>
        <CardTitle>$ robert@portfolio — {cwd}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: `${heightPx}px` }}>
          <div
            ref={scrollRef}
            className="terminal-scroll space-y-3 overflow-y-auto absolute inset-x-0 top-0"
            style={{ bottom: `${inputBarHeight + separatorOffset}px` }}
          >
            {history.map((node, idx) => (
              <div key={idx}>{node}</div>
            ))}
            {firstSuggestion && firstSuggestion !== input ? (
              <div className="text-xs opacity-60">Suggestion: <span className="text-terminal-green">{firstSuggestion}</span> (Tab to complete)</div>
            ) : null}
            <div ref={setCursor} />
          </div>
          <div className="absolute inset-x-0" style={{ bottom: `${inputBarHeight}px` }}>
            <Separator />
          </div>
          <div className="absolute inset-x-0 bottom-0" style={{ height: `${inputBarHeight}px` }}>
            <form onSubmit={onSubmit} className="flex h-full items-center gap-2 bg-terminal/60 px-0">
              <span className="text-terminal-green">$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 bg-transparent outline-none placeholder:text-terminal-green/40"
                placeholder="type a command (try: about, projects, experience, contact, help)"
                aria-label="Terminal input"
              />
            </form>
          </div>
          <div
            aria-label="Resize terminal"
            className="pointer-events-auto absolute bottom-1 right-1 h-5 w-5 cursor-move hidden sm:block"
            onMouseDown={onResizeMouseDown}
          >
            {/* First bar */}
            <span className="pointer-events-none absolute bottom-3 right-3 h-[2px] w-3 -rotate-45 bg-terminal-green/30" />
            {/* Second bar */}
            <span className="pointer-events-none absolute bottom-2 right-2 h-[2px] w-3 -rotate-45 bg-terminal-green/50" />
            {/* Third bar */}
            <span className="pointer-events-none absolute bottom-1 right-1 h-[2px] w-3 -rotate-45 bg-terminal-green/70" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Prompt({ command }: { command: string }) {
  return (
    <div>
      <span className="text-terminal-green">$</span>{' '}
      <span>{command}</span>
    </div>
  )
}

function Intro() {
  return (
    <div className="space-y-2">
      <div>Welcome to Robert's terminal portfolio.</div>
      <div>Type <span className="font-semibold">help</span> to see available commands.</div>
    </div>
  )
}


