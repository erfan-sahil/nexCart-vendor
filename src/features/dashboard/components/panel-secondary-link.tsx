import { ArrowUpRight } from "@/lib/icons"
import type { ReactNode } from "react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PanelSecondaryLinkProps = {
  to: string
  children: ReactNode
  className?: string
}

export function PanelSecondaryLink({
  to,
  children,
  className,
}: PanelSecondaryLinkProps) {
  return (
    <Button
      variant="ghost"
      size="xs"
      className={cn(
        "shrink-0 gap-1 text-brand-text hover:bg-brand-soft/50 hover:text-brand-text",
        className
      )}
      asChild
    >
      <Link to={to}>
        {children}
        <ArrowUpRight className="size-3.5 opacity-80" aria-hidden="true" />
      </Link>
    </Button>
  )
}
