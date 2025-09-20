import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Robert Ruta — Terminal',
  description: 'Personal site of Robert Ruta: programmer aspiring to be a software engineering team leader.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${mono.variable} font-mono bg-terminal text-terminal-green touch-manipulation`}>{children}</body>
    </html>
  )
}


