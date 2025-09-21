'use client'
import * as React from 'react'
import Image from 'next/image'
import { db } from '@/lib/data-interface'
import { contacts } from '@/lib/profile'


export default function Home() {

    const showcased = React.useMemo(() => db.showcased(), [])
    
    return (
        <div className='w-full grid-rows-3 gap-6'>
            <div>
                <h1 className='text-4xl font-bold'>Home</h1>
                <h1 className='text-4xl font-bold'>-------------------------------------</h1>
            </div>
            
            <div className="w-full relative grid grid-cols-[15%_1fr] gap-6 items-start mt-4">
                {/* Profile Photo Box - 20% width */}
                <div className="relative h-full w-full aspect-square max-w-xs mx-auto overflow-hidden rounded-sm border border-terminal-green/30 bg-terminal-dim/40 shadow-[0_0_20px_rgba(0,255,156,0.15)]">
                    <Image
                    src={'https://github.com/RobertRuta.png?size=400'}
                    alt={'Robert Ruta profile photo'}
                    fill
                    sizes="(max-width: 400px) 8rem, 12rem"
                    className="object-cover"
                    priority
                    />
                </div>

                {/* Details Box - Takes remaining space (1fr = 1 fraction of available space) */}
                <div className="h-full flex flex-col gap-2 p-4 bg-terminal/20 border border-terminal-green/20 rounded-lg">
                    <h2 className="text-lg font-semibold text-terminal-green">Robert Ruta</h2>
                    <p className="text-sm opacity-80">Software Engineer | Physics Enthusiast | Avid Snowboarder | CLimber of Plastic Rocks </p>
                    <div className="text-xs opacity-60 mt-2">
                        <p>
                            Welcome to my website! Here you can find out a little more about me: my resume, my public projects and my contact details. 
                            If you're interested in a timeline of my career relevant experiences, please have a look at the Timeline tab. If you want basically the same information but arranged like it's a traditional CV, 
                            please take a look at the CV tab. The rest should be pretty self-explanatory. Except for the terminal... don't touch my terminal... that's only for me to use. Happy exploring!
                        </p>
                    {/* <p><span className="font-mono">ID:</span> RR-001</p>
                    <p><span className="font-mono">STATUS:</span> Active</p>
                    <p><span className="font-mono">CLEARANCE:</span> Level 3</p> */}
                    </div>
                    <div className="mt-3 text-xs">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <a className="underline decoration-terminal-green/30 underline-offset-4" href={`mailto:${contacts.email}`}>{contacts.email}</a>
                            <span className="opacity-70">{contacts.phone}</span>
                            <a className="underline decoration-terminal-green/30 underline-offset-4" href={contacts.github} target="_blank" rel="noreferrer">GitHub</a>
                            <a className="underline decoration-terminal-green/30 underline-offset-4" href={contacts.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                            <a className="underline decoration-terminal-green/30 underline-offset-4" href={contacts.site} target="_blank" rel="noreferrer">Website</a>
                            <span className="opacity-70">{contacts.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Showcase */}
            <div className='w-full h-full flex flex-col border border-terminal-green/10 mt-6 justify-center items-center'>
                <div className='flex flex-col items-center justify-center w-full'>
                    <h1 className='flex text-4xl font-bold p-3'>Recent Highlights</h1>
                    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-6'>
                        {showcased.map((it) => (
                            <div key={it.id} className='flex flex-col gap-1 p-4 rounded-md border border-terminal-green/20 bg-terminal/10'>
                                <div className='flex items-baseline gap-2'>
                                    <h2 className='text-xl font-semibold'>{it.label}</h2>
                                    {it.institution ? (
                                        <span className='text-xs opacity-70'>— {it.institution}</span>
                                    ) : null}
                                </div>
                                <div className='text-xs opacity-60'>{it.displayDate}{it.type ? ` · ${it.type}` : ''}</div>
                                {it.description ? (
                                    <p className='text-sm opacity-80 mt-1'>{it.description}</p>
                                ) : it.note ? (
                                    <p className='text-sm opacity-80 mt-1'>{it.note}</p>
                                ) : null}
                                {it.link ? (
                                    <a className='text-xs underline decoration-terminal-green/30 underline-offset-4 mt-2 w-fit' href={it.link} target='_blank' rel='noreferrer'>
                                        {it.link}
                                    </a>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}