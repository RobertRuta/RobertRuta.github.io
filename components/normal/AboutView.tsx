'use client'

import * as React from 'react'
import { about, skills } from '@/lib/profile'
import { Badge } from '@/components/ui/badge'

export function AboutView() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-terminal-green">About Me</h2>
      </header>
      <p className="leading-relaxed opacity-90">{about}</p>
      <div>
        <h3 className="mb-2 text-sm uppercase tracking-wide opacity-70">Key Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 16).map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </div>
    </section>
  )
}


