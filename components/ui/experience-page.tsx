'use client'
import * as React from 'react'
import { ExperienceItem } from '@/lib/data-interface'

import { Badge } from './badge'
import clsx from 'clsx'


interface ExperiencePageProps {
  experienceItem: ExperienceItem
  onExperienceClose: () => void
}

interface ExperienceTriggerProps {
  experienceItem: ExperienceItem;
  onOpen: (item: ExperienceItem) => void;
  className?: string;
}

export function ExperienceTrigger({
  experienceItem,
  onOpen,
  className,
}: ExperienceTriggerProps) {
  return (
    <div
      className={clsx(
        "cursor-pointer hover:text-terminal-green/60",
        className
      )}
      onClick={() => onOpen(experienceItem)}
    >
      {experienceItem.label}
    </div>
  );
}


export function ExperiencePage({ experienceItem, onExperienceClose}: ExperiencePageProps) {
  return (
    <div>

      {/* Back Button */}
      <div className='flex text-xl border-b border-terminal-green/20 mx-4 pb-2 justify-between'>
        <h1>Experience -- {experienceItem.type}</h1>
        <h1 className='hover:text-terminal-green/60 cursor-pointer' onClick={onExperienceClose}>
          {"<<"} Back
        </h1>
      </div>

      {/* Content */}
      <div className='flex flex-col border-l border-terminal-green/20 mx-4 px-8 pt-8 h-full'>
        {/* Header */}
        <div>
          <div className='flex flex-row justify-between items-center'>
            <h1 className="text-2xl font-bold">{experienceItem.label}</h1>
            <h3 className="text-xl">{experienceItem.institution}</h3>
          </div>
          <p>{experienceItem.start.isoLabel} -- {experienceItem.end ? experienceItem.end.isoLabel : "Current"}</p>
        </div>

        {/* Description */}
        <p className='mt-8 ml-8'>{experienceItem.description}</p>
        
        {/* Links */}
        { experienceItem.link ? (
          <div className='mt-8'>
            <h1 className='border-b border-terminal-green/80 text-terminal-green/80'>Links</h1>
            <div className='flex flex-wrap gap-2 pt-2'>
              {experienceItem.link}
            </div>
          </div>
        ) : null }

        {/* Skills */}
        <div className='mt-8'>
          <h1 className='border-b border-terminal-green/80 text-terminal-green/80'>Skills</h1>
          <div className='flex flex-wrap gap-2 pt-2'>
            {experienceItem.skills.map((s) => (
              <Badge>{s}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}