'use client'
import * as React from 'react'
import { ExperienceItem } from '@/lib/data-interface'
import { Button } from '@/components/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/shadcn/dialog'

interface ExperiencePopupProps {
  experienceItem: ExperienceItem
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExperiencePopup({
  experienceItem,
  trigger,
  open,
  onOpenChange,
}: ExperiencePopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">View Experience</Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-zinc-900">
        <DialogHeader>
          {/* Title row with institution aligned right */}
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-bold">
              {experienceItem.label}
            </DialogTitle>
            <span className="text-sm text-muted-foreground">
              {experienceItem.institution}
            </span>
          </div>

          {/* Date range under title */}
          <p className="text-sm text-muted-foreground mt-1">
            {experienceItem.start.isoLabel} – {experienceItem.end.isoLabel ?? 'Present'}
          </p>

          {/* Description / summary */}
          <DialogDescription className="mt-3">
            {experienceItem.description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}