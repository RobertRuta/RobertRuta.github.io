'use client'
import * as React from 'react'
import { contacts } from '@/lib/profile'
import { ViewProps, ViewTag } from '../Monitor';


export default function Contact({ onChangeView, onExperienceOpen, onExperienceClose }: ViewProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h1 className='text-2xl font-semibold'>Contact</h1>
        <p className='text-xs opacity-70'>Get in touch via email or socials</p>
      </div>

      <div className='p-4 rounded-md border border-terminal-green/20 bg-terminal/10'>
        <div className='text-sm space-y-1'>
          <div>
            <span className='opacity-70'>Email: </span>
            <a className='underline decoration-terminal-green/30 underline-offset-4' href={`mailto:${contacts.email}`}>{contacts.email}</a>
          </div>
          <div>
            <span className='opacity-70'>Phone: </span>
            <span>{contacts.phone}</span>
          </div>
          <div>
            <span className='opacity-70'>Location: </span>
            <span>{contacts.location}</span>
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-3 text-xs'>
        <a className='underline decoration-terminal-green/30 underline-offset-4' href={contacts.linkedin} target='_blank' rel='noreferrer'>LinkedIn</a>
        <a className='underline decoration-terminal-green/30 underline-offset-4' href={contacts.github} target='_blank' rel='noreferrer'>GitHub</a>
        <a className='underline decoration-terminal-green/30 underline-offset-4' href={contacts.site} target='_blank' rel='noreferrer'>Website</a>
      </div>
    </div>
  )
}
