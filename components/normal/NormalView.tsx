'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/data-interface'
import { contacts } from '@/lib/profile'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

function formatPeriod(it: ReturnType<typeof db.findById> extends infer T ? (T extends undefined ? never : T) : never): string {
  const start = it.start.isoLabel
  const end = it.end.isoLabel || (it.isOngoing ? 'Present' : '')
  if (!start && !end) return ''
  if (start && end) return `${start} – ${end}`
  return start || end
}

function ExpandableTags({ tags, collapsedCount = 3, noPad = false, className }: { tags: string[]; collapsedCount?: number; noPad?: boolean; className?: string }) {
  const [expanded, setExpanded] = React.useState(false)
  if (!tags || tags.length === 0) return null
  const hiddenTotal = Math.max(0, tags.length - collapsedCount)
  const visible = expanded ? tags : tags.slice(0, collapsedCount)
  const classes: string[] = ['flex', 'flex-wrap', 'gap-2', 'items-center']
  if (!noPad) classes.push('pt-1')
  if (className) classes.push(className)
  return (
    <div className={classes.join(' ')}>
      {visible.map((s) => (
        <Badge key={s} variant="secondary">{s}</Badge>
      ))}
      {!expanded && hiddenTotal > 0 ? (
        <button
          type="button"
          className="text-xs underline decoration-terminal-green/30 underline-offset-4"
          onClick={() => setExpanded(true)}
        >
          Show all (+{hiddenTotal})
        </button>
      ) : null}
      {expanded && hiddenTotal > 0 ? (
        <button
          type="button"
          className="text-xs underline decoration-terminal-green/30 underline-offset-4"
          onClick={() => setExpanded(false)}
        >
          Show less
        </button>
      ) : null}
    </div>
  )
}

export function NormalView() {
  const aboutItem = db.findById('about_me')
  const about = aboutItem?.note || ''
  const skills = db.skills()
  const projects = db.items().ofTypes(['project', 'notable_work']).sortByStart(true).toArray()
  const experience = db.items().ofTypes(['work']).sortByStart(true).toArray()
  const education = db.items().ofTypes(['education']).sortByStart(true).toArray()
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Robert Ruta — Software Engineer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="opacity-90">{about}</p>
          <div className="pt-3 text-sm">
            <span>{contacts.phone}</span>
            {' · '}
            <a className="underline decoration-terminal-green/30 underline-offset-4" href={`mailto:${contacts.email}`}>{contacts.email}</a>
            {' · '}
            <a className="underline decoration-terminal-green/30 underline-offset-4" href={contacts.github} target="_blank" rel="noreferrer">GitHub</a>
            {' · '}
            <a className="underline decoration-terminal-green/30 underline-offset-4" href={contacts.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            {' · '}
            <span>{contacts.location}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ExpandableTags tags={skills} collapsedCount={12} />
        </CardContent>
      </Card>

      <div className='flex flex-col sm:flex-row gap-3 w-full'>
        
        {/* Projects */}
        <Card className='sm:w-[50%] w-full min-w-0'>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <Accordion
            type="single"
            collapsible
            className="w-full space-y-0"
            defaultValue="example-proj"
            >
              {projects.map((p) => (
                  <AccordionItem className='' value={p.id}>
                  <AccordionTrigger className='w-full flex justify-center hover:bg-terminal-green/10 rounded py-1'>{p.label}</AccordionTrigger>
                  <AccordionContent className=''>
                    <div className='flex flex-wrap bg-terminal-dim/30 border border-terminal-green/30 p-3 gap-2'>
                      {p.skills.map((tag) => (
                        <Badge key={tag} className='text-[11px] px-2 py-1 rounded bg-border-red'>{tag}</Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
          </CardContent>
        </Card>
      
      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {experience.map((e) => (
            <div key={e.id}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                <div className="font-semibold">{e.label}{e.institution ? ` — ${e.institution}` : ''}</div>
                <div className="opacity-70 text-xs">{formatPeriod(e as any)}</div>
              </div>
              {e.description ? (
                <p className="opacity-90 text-sm mt-2">{e.description}</p>
              ) : null}
              {e.note ? (
                <div className="opacity-80 text-xs mt-2">{e.note}</div>
              ) : null}
              {e.skills.length ? (
                <ExpandableTags tags={e.skills} noPad className="justify-start sm:justify-end" />
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.map((ed) => (
            <div key={ed.id}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                <div className="font-semibold">{ed.label}{ed.institution ? ` — ${ed.institution}` : ''}</div>
                <div className="opacity-70 text-xs">{formatPeriod(ed as any)}</div>
              </div>
              {ed.note ? <div className="opacity-80 text-xs">{ed.note}</div> : null}
              {ed.skills.length ? (
                <ExpandableTags tags={ed.skills} noPad className="justify-start sm:justify-end" />
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      

      <div className="flex gap-2 justify-center">
        <Button asChild>
          <a href={contacts.linkedin} target="_blank" rel="noreferrer">View Resume</a>
        </Button>
        <Button variant="secondary" asChild>
          <a href={contacts.github} target="_blank" rel="noreferrer">GitHub Profile</a>
        </Button>
      </div>
    </div>
  )
}


