import type { ReactNode } from "react"

import { usePageMeta } from "@/hooks"
import { cn } from "@/lib/utils"

type VendorPageIntroProps = {
  title?: ReactNode
  description?: string
  className?: string
  trailing?: ReactNode
}

export function VendorPageIntro({
  title,
  description,
  className,
  trailing,
}: VendorPageIntroProps) {
  const meta = usePageMeta()
  const resolvedTitle = title ?? meta.title
  const resolvedDescription = description ?? meta.description

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {resolvedTitle}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {resolvedDescription}
        </p>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}
