import * as React from 'react'

interface GlitchOverlayProps {
  active: boolean
  /** If true, covers the entire viewport; otherwise, fills the parent container */
  fullscreen?: boolean
  /** Extra horizontal coverage outside parent bounds (px) for streaks/chroma */
  overscanX?: number
}

export function GlitchOverlay({ active, fullscreen = false, overscanX = 0 }: GlitchOverlayProps) {
  if (!active) return null

  const wrapperPosition = fullscreen ? 'fixed inset-0' : 'absolute inset-0'
  const overscanStyle = overscanX > 0 ? { left: -overscanX, right: -overscanX } as React.CSSProperties : undefined

  return (
    <div className={`pointer-events-none ${wrapperPosition} z-[999]`}>
      {/* <div className="glitch-overlay absolute left-[-10%] top-[-1%] bottom-0 right-[-10%]" />
      <div className="glitch-overlay2 absolute left-[-10%] top-[-1%] bottom-0 right-[-10%]" /> */}
      <div className="glitch-overlay streaks absolute inset-y-0" style={overscanStyle} />
      <div className="glitch-overlay noise absolute inset-0" />
      <div className="glitch-overlay scanline absolute inset-0" />
      <div className="glitch-overlay chroma-green absolute inset-y-0" style={overscanStyle} />
      <div className="glitch-overlay chroma-blue absolute inset-y-0" style={overscanStyle} />
    </div>
  )
}


