'use client'
import * as React from 'react'
import { contacts, education, experience, skills, about } from '@/lib/profile'
import { ViewProps, ViewTag } from '../Monitor';


export default function CV({ onChangeView, onExperienceOpen, onExperienceClose }: ViewProps) {
  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-2xl font-semibold'>Curriculum Vitae</h1>
        <div className='mt-1 text-xs flex flex-wrap gap-x-4 gap-y-1'>
          <a className='underline decoration-terminal-green/30 underline-offset-4' href={`mailto:${contacts.email}`}>{contacts.email}</a>
          <span className='opacity-70'>{contacts.phone}</span>
          <a className='underline decoration-terminal-green/30 underline-offset-4' href={contacts.linkedin} target='_blank' rel='noreferrer'>LinkedIn</a>
          <a className='underline decoration-terminal-green/30 underline-offset-4' href={contacts.github} target='_blank' rel='noreferrer'>GitHub</a>
          <a className='underline decoration-terminal-green/30 underline-offset-4' href={contacts.site} target='_blank' rel='noreferrer'>Website</a>
          <span className='opacity-70'>{contacts.location}</span>
        </div>
      </header>

      <section>
        <h2 className='text-lg font-semibold'>Profile</h2>
        <p className='text-sm opacity-80 mt-1'>{about}</p>
      </section>

      <section>
        <h2 className='text-lg font-semibold'>Experience</h2>
        <div className='mt-2 space-y-3'>
          {experience.map((e, idx) => (
            <div key={idx} className='border-l border-terminal-green/30 pl-3'>
              <div className='flex items-baseline gap-2'>
                <div className='font-semibold'>{e.role}</div>
                <span className='opacity-80'>— {e.org}</span>
                <span className='ml-auto text-xs opacity-60'>{e.period}</span>
              </div>
              <ul className='mt-1 list-disc list-inside text-sm opacity-80'>
                {e.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className='text-lg font-semibold'>Education</h2>
        <div className='mt-2 space-y-2'>
          {education.map((ed, idx) => (
            <div key={idx} className='flex items-baseline gap-2'>
              <div className='font-semibold'>{ed.degree}</div>
              <span className='opacity-80'>— {ed.school}</span>
              {ed.notes ? <span className='text-xs opacity-60'> · {ed.notes}</span> : null}
              <span className='ml-auto text-xs opacity-60'>{ed.period}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className='text-lg font-semibold'>Skills</h2>
        <div className='mt-2 flex flex-wrap gap-1'>
          {skills.map((s) => (
            <span key={s} className='text-[11px] px-2 py-1 rounded border border-terminal-green/30 bg-terminal-green/10 text-terminal-green'>{s}</span>
          ))}
        </div>
      </section>
    </div>
  )
}
