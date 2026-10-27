import { useState } from "react"
import { LoaderCircle, Package, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/errors"
import { resolveAssetUrl } from "@/lib/api/assets"

import { useDeleteProduct } from "../hooks"
import { formatVariantCount } from "../lib/format"
import type { Product } from "../types"

type ProductDeleteDialogProps = {
  product: Product | null
  onClose: () => void
}

export function ProductDeleteDialog({
  product,
  onClose,
}: ProductDeleteDialogProps) {
  if (!product) {
    return null
  }

  return (
    <ProductDeleteConfirm
      key={product.id}
      product={product}
      onClose={onClose}
    />
  )
}

function ProductDeleteConfirm({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const remove = useDeleteProduct()
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)

    try {
      await remove.mutateAsync(product.id)
      onClose()
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not delete this product. Please try again."
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !remove.isPending) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={!remove.isPending}
      >
        <DialogHeader className="border-b border-destructive/15 bg-destructive/10 px-6 py-6 text-left">
          <div className="flex items-start gap-4 pr-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-4 ring-background">
              <Trash2 className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold">
                Delete this product?
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                This permanently removes the listing, its variants, and its
                images. It cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <ProductThumb product={product} />
            <div className="min-w-0">
              <p className="truncate font-medium">{product.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {product.category.name || "No category"}
                {" · "}
                {product.offer.variantCount === 0
                  ? "No variants"
                  : formatVariantCount(product.offer.variantCount)}
              </p>
            </div>
          </div>

          {product.isPublished ? (
            <p className="text-sm text-muted-foreground">
              Shoppers can see this product. Deleting it takes it off the
              storefront.
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-none border-border bg-card px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={remove.isPending}
            onClick={onClose}
          >
            Keep product
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer bg-[#dc2626] text-white hover:bg-[#b91c1c] dark:bg-[#dc2626] dark:text-white dark:hover:bg-[#ef4444]"
            disabled={remove.isPending}
            onClick={() => {
              void confirm()
            }}
          >
            {remove.isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Trash2 />
            )}
            {remove.isPending ? "Deleting…" : "Delete product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProductThumb({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false)
  const url = product.thumbnail?.url

  if (!url || failed) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
        <Package className="size-4" />
      </span>
    )
  }

  return (
    <img
      src={resolveAssetUrl(url)}
      alt=""
      className="size-11 shrink-0 rounded-lg object-cover ring-1 ring-border"
      onError={() => setFailed(true)}
    />
  )
}
