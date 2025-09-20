'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/normalised'

const INCLUDED_TYPES = new Set(['work', 'education', 'project', 'notable_work'])

export function TimelineView() {
  const items = React.useMemo(() => {
    return db
      .items()
      .ofTypes(INCLUDED_TYPES)
      .where((it) => !!it.start.sortValue)
      .sortByStart(true)
      .toArray()
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
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

export default TimelineView


