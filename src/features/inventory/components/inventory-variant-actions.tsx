import { Ellipsis, Eye, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { InventoryVariant } from "../types"

type InventoryVariantActionsProps = {
  variant: InventoryVariant
  onDetails: (variant: InventoryVariant) => void
  onUpdate: (variant: InventoryVariant) => void
}

export function InventoryVariantActions({
  variant,
  onDetails,
  onUpdate,
}: InventoryVariantActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label={`Actions for ${variant.sku}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => onDetails(variant)}
        >
          <Eye />
          Details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => onUpdate(variant)}
        >
          <Pencil />
          Update
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
