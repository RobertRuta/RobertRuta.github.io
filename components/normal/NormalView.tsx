'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/data-interface'
import { contacts } from '@/lib/profile'

function formatPeriod(it: ReturnType<typeof db.findById> extends infer T ? (T extends undefined ? never : T) : never): string {
  const start = it.start.isoLabel
  const end = it.end.isoLabel || (it.isOngoing ? 'Present' : '')
  if (!start && !end) return ''
  if (start && end) return `${start} – ${end}`
  return start || end
}

export function NormalView() {
  const aboutItem = db.findById('about_me')
  const about = aboutItem?.note || ''
  const skills = db.skills()
  const projects = db.items().ofTypes(['project']).sortByStart(true).toArray()
  const experience = db.items().ofTypes(['work']).sortByStart(true).toArray()
  const education = db.items().ofTypes(['education']).sortByStart(true).toArray()
  const notable = db.items().ofTypes(['notable_work']).toArray()
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Robert Ruta — Software Engineer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="opacity-90">{about}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
          <div className="pt-2 text-sm">
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
        <CardHeader>
          <CardTitle>Highlighted Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                {p.link ? (
                  <a className="underline decoration-terminal-green/30 underline-offset-4" href={p.link} target="_blank" rel="noreferrer">
                    {p.label}
                  </a>
                ) : (
                  <span>{p.label}</span>
                )}
                <div className="flex flex-wrap gap-1">
                  {p.skills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
              {p.description ? <p className="opacity-80 text-sm">{p.description}</p> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {experience.map((e) => (
            <div key={e.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold">{e.label}{e.institution ? ` — ${e.institution}` : ''}</div>
                <div className="opacity-70 text-xs">{formatPeriod(e as any)}</div>
              </div>
              {e.description ? (
                <p className="opacity-90 text-sm mt-1">{e.description}</p>
              ) : null}
              {e.note ? (
                <div className="opacity-80 text-xs mt-1">{e.note}</div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {education.map((ed) => (
            <div key={ed.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold">{ed.label}{ed.institution ? ` — ${ed.institution}` : ''}</div>
                <div className="opacity-70 text-xs">{formatPeriod(ed as any)}</div>
              </div>
              {ed.note ? <div className="opacity-80 text-xs">{ed.note}</div> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Notable Work</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-1 text-sm opacity-90">
          {notable.map((n) => (
            <div key={n.id}>
              • {n.link ? (
                <a className="underline decoration-terminal-green/30 underline-offset-4" href={n.link} target="_blank" rel="noreferrer">{n.label}</a>
              ) : (
                <span>{n.label}</span>
              )}
              {n.note ? ` | ${n.note}` : ''}
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


