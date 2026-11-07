import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"

type PanelActionLinkProps = {
  to: string
  children: ReactNode
}

export function PanelActionLink({ to, children }: PanelActionLinkProps) {
  return (
    <Button
      variant="outline"
      size="xs"
      className="shrink-0 border-border/80 text-foreground shadow-none"
      asChild
    >
      <Link to={to}>
        {children}
        <ChevronRight aria-hidden="true" />
      </Link>
    </Button>
  )
}
