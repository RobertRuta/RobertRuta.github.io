'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/data-interface'
import { ViewProps, ViewTag } from '../Monitor'

const INCLUDED_TYPES = new Set(['work', 'education', 'project', 'notable_work'])


export function Timeline({ onChangeView, onExperienceOpen, onExperienceClose }: ViewProps) {
  const baseItems = React.useMemo(() => {
    return db
      .items()
      .ofTypes(INCLUDED_TYPES)
      .where((it) => !!it.start.sortValue)
      .sortByStart(true)
      .toArray()
  }, [])

  type TagState = 'include' | 'exclude' | 'neutral'
  const allSkills = React.useMemo(() => db.skills(), [])
  const [showFilters, setShowFilters] = React.useState(false)
  const [closing, setClosing] = React.useState(false)
  const [tagState, setTagState] = React.useState<Record<string, TagState>>({})
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [collapseHeight, setCollapseHeight] = React.useState(0)

  const recalcHeight = React.useCallback(() => {
    if (!contentRef.current) return
    setCollapseHeight(contentRef.current.scrollHeight)
  }, [])

  React.useEffect(() => {
    if (showFilters) recalcHeight()
  }, [showFilters, allSkills, tagState, recalcHeight])

  React.useEffect(() => {
    const onResize = () => {
      if (showFilters) recalcHeight()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [showFilters, recalcHeight])

  const cycleTag = (tag: string) => {
    setTagState((prev) => {
      const cur: TagState = prev[tag] || 'neutral'
      const next: TagState = cur === 'neutral' ? 'include' : cur === 'include' ? 'exclude' : 'neutral'
      const copy = { ...prev }
      copy[tag] = next
      // prune neutral to keep state tidy
      if (next === 'neutral') delete copy[tag]
      return copy
    })
  }

  const includes = React.useMemo(() => Object.entries(tagState).filter(([, s]) => s === 'include').map(([t]) => t), [tagState])
  const excludes = React.useMemo(() => Object.entries(tagState).filter(([, s]) => s === 'exclude').map(([t]) => t), [tagState])

  const items = React.useMemo(() => {
    return baseItems.filter((it) => {
      if (excludes.length && it.skills.some((s) => excludes.includes(s))) return false
      if (includes.length && !it.skills.some((s) => includes.includes(s))) return false
      return true
    })
  }, [baseItems, includes, excludes])

  const tagClasses = (state: TagState): string => {
    if (state === 'include') return 'bg-terminal-green/15 text-terminal-green border border-terminal-green/40'
    if (state === 'exclude') return 'bg-red-500/10 text-red-400 border border-red-400/40'
    return 'bg-terminal.dim text-terminal-green/60 border border-terminal-green/15'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Timeline</CardTitle>
            <button
              className="text-xs rounded-md px-2 py-1 border border-terminal-green/30 text-terminal-green hover:bg-terminal-green/10"
              onClick={() => { setShowFilters(!showFilters) }}
            >
              {showFilters ? 'Hide Filters' : 'Filter'}
            </button>
          </div>
          {/* Active filter summary when filters are hidden */}
          {!showFilters && (includes.length || excludes.length) ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {includes.map((tag) => (
                <span key={`inc-${tag}`} className="text-[11px] px-2 py-1 rounded border border-terminal-green/40 bg-terminal-green/15 text-terminal-green">{tag}</span>
              ))}
              {excludes.map((tag) => (
                <span key={`exc-${tag}`} className="text-[11px] px-2 py-1 rounded border border-red-400/40 bg-red-500/10 text-red-400">{tag}</span>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <div
            className="overflow-hidden"
            style={{
              height: showFilters ? collapseHeight : 0,
              transition: 'height 380ms cubic-bezier(.37,.01,.63,.99)',
            }}
          >
            <div ref={contentRef} className="pt-3">
              {showFilters ? (
                <>
                  <div className="filters-grid show flex flex-wrap gap-2">
                    {allSkills.map((tag, idx) => {
                      const state: TagState = tagState[tag] || 'neutral'
                      return (
                        <button
                          key={tag}
                          className={['filter-chip text-[11px] px-2 py-1 rounded border transition-colors', tagClasses(state)].join(' ')}
                          style={{ animationDelay: `${(idx) * 4}ms` }}
                          onClick={() => cycleTag(tag)}
                          title={state === 'include' ? 'Included' : state === 'exclude' ? 'Excluded' : 'Neutral'}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] opacity-70">
                    <div>
                      <span className="inline-block rounded px-1 mr-2 border border-terminal-green/30 bg-terminal-green/10 text-terminal-green">include</span>
                      <span className="inline-block rounded px-1 mr-2 border border-red-400/40 bg-red-500/10 text-red-400">exclude</span>
                      <span className="inline-block rounded px-1 border border-terminal-green/15 bg-terminal.dim text-terminal-green/60">neutral</span>
                    </div>
                    <button
                      className="underline decoration-terminal-green/30 underline-offset-4"
                      onClick={() => setTagState({})}
                    >
                      Clear
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={["filters-grid flex flex-wrap gap-2", 'reverse'].join(' ')}>
                    {allSkills.map((tag, idx) => {
                      const state: TagState = tagState[tag] || 'neutral'
                      return (
                        <button
                          key={`rev-${tag}`}
                          className={['filter-chip text-[11px] px-2 py-1 rounded border transition-colors', tagClasses(state)].join(' ')}
                          style={{ animationDelay: `${(idx % 12) * 10}ms` }}
                          onClick={() => cycleTag(tag)}
                          title={state === 'include' ? 'Included' : state === 'exclude' ? 'Excluded' : 'Neutral'}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
        <CardContent>
          <div className="relative">
            {/* Vertical line spanning the whole timeline */}
            <div className="absolute top-0 bottom-0 w-px bg-terminal-green/30" style={{ left: '6rem' }} />
            <div className="space-y-6">
              {items.map((it) => (
                <div key={it.id} className="grid" style={{ gridTemplateColumns: '6rem 1fr' }}>
                  {/* Date (left column) */}
                  <div className="text-right pr-3 text-xs opacity-70 leading-6 pt-1">
                    {it.displayDate}
                  </div>
                  {/* Content (right column) */}
                  <div className="relative pl-6">
                    {/* Node dot on the line */}
                    <span
                      aria-hidden
                      className="absolute top-2 h-2 w-2 rounded-full bg-terminal-green"
                      style={{ left: 0, transform: 'translateX(-50%)' }}
                    />
                    <div className="flex items-baseline gap-2">
                      <div className="font-semibold">
                        {it.label}
                        {it.institution ? <span className="opacity-80"> — {it.institution}</span> : null}
                      </div>
                      {it.type ? (
                        <span className="text-[10px] uppercase tracking-wide opacity-60">{it.type}</span>
                      ) : null}
                    </div>
                    {it.description ? (
                      <div className="opacity-80 text-sm mt-0.5">{it.description}</div>
                    ) : it.note ? (
                      <div className="opacity-80 text-sm mt-0.5">{it.note}</div>
                    ) : null}
                    {it.skills && it.skills.length ? (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {it.skills.slice(0, 8).map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                        {it.skills.length > 8 ? (
                          <Badge variant="secondary">+{it.skills.length - 8}</Badge>
                        ) : null}
                      </div>
                    ) : null}
                    {it.link ? (
                      <div className="pt-1 text-xs">
                        <a className="underline decoration-terminal-green/30 underline-offset-4" href={it.link} target="_blank" rel="noreferrer">
                          {it.link}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Timeline


