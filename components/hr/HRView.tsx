'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { skills, projects, experience, contacts, education, about, notableWork } from '@/lib/profile'

export function HRView() {
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
            <div key={p.name} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {education.map((ed) => (
            <div key={`${ed.school}-${ed.period}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="font-semibold">{ed.degree} — {ed.school}</div>
                <div className="opacity-70 text-xs">{ed.period}</div>
              </div>
              {ed.notes ? <div className="opacity-80 text-xs">{ed.notes}</div> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Notable Work</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-1 text-sm opacity-90">
          {notableWork.map((item) => (
            <div key={item}>• {item}</div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
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


