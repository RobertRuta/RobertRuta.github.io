'use client'
import * as React from 'react'
import { db } from '@/lib/data-interface'
import { ViewProps, ViewTag } from '../Monitor';
import { ExperienceTrigger } from '../ui/experience-page';

const PROJECT_TYPES = new Set(['project', 'notable_work'])


export default function Projects({ onChangeView, onExperienceOpen, onExperienceClose }: ViewProps) {
  const items = React.useMemo(() => {
    return db
      .items()
      .ofTypes(PROJECT_TYPES)
      .sortByStart(true)
      .toArray()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className='text-2xl font-semibold'>Projects</h1>
        <p className='text-xs opacity-70'>Catalogue of side projects and notable work</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {items.map((it) => (
          <div key={it.id} className='p-4 rounded-md border border-terminal-green/20 bg-terminal/10'>
            <div className='flex items-baseline gap-2'>
              <ExperienceTrigger experienceItem={it} onOpen={onExperienceOpen}/>
              {/* <div className='font-semibold'>{it.label}</div> */}
              {it.institution ? <span className='text-xs opacity-70'>— {it.institution}</span> : null}
            </div>
            <div className='text-xs opacity-60'>{it.displayDate}{it.type ? ` · ${it.type}` : ''}</div>
            {it.description ? (
              <div className='text-sm opacity-80 mt-1'>{it.description}</div>
            ) : it.note ? (
              <div className='text-sm opacity-80 mt-1'>{it.note}</div>
            ) : null}
            {it.link ? (
              <div className='pt-1 text-xs'>
                <a className='underline decoration-terminal-green/30 underline-offset-4' href={it.link} target='_blank' rel='noreferrer'>
                  {it.link}
                </a>
              </div>
            ) : null}
            {it.skills && it.skills.length ? (
              <div className='flex flex-wrap gap-1 pt-2'>
                {it.skills.slice(0, 10).map((s) => (
                  <span key={s} className='text-[10px] px-2 py-0.5 rounded border border-terminal-green/30 bg-terminal-green/10 text-terminal-green'>
                    {s}
                  </span>
                ))}
                {it.skills.length > 10 ? (
                  <span className='text-[10px] px-2 py-0.5 rounded border border-terminal-green/30 bg-terminal-green/10 text-terminal-green'>
                    +{it.skills.length - 10}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

