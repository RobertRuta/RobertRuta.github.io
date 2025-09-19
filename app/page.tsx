'use client'

import { Terminal } from '@/components/terminal/Terminal'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { HRView } from '@/components/hr/HRView'

export default function Page() {
  const [mode, setMode] = React.useState<'terminal' | 'hr'>('terminal')
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm opacity-80">Mode</div>
          <div className="inline-flex rounded-md border border-terminal-green/20 overflow-hidden">
            <Button
              variant={mode === 'terminal' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setMode('terminal')}
              className="rounded-none"
            >
              Terminal
            </Button>
            <Button
              variant={mode === 'hr' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setMode('hr')}
              className="rounded-none"
            >
              HR View
            </Button>
          </div>
        </div>
        {mode === 'terminal' ? <Terminal /> : <HRView />}
      </div>
    </main>
  )
}


