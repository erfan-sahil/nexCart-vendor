import { useState } from "react"
import { Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { resolveAssetUrl } from "@/lib/api/assets"
import { cn } from "@/lib/utils"

import {
  formatOriginalPriceRange,
  formatPriceRange,
  formatProductDate,
  formatVariantCount,
} from "../lib/format"
import type { Product, ProductAttribute, ProductImage } from "../types"

import { ProductStatusBadges, ProductTagBadge } from "./product-status-badges"

type ProductDetailsDialogProps = {
  product: Product | null
  onClose: () => void
}

export function ProductDetailsDialog({
  product,
  onClose,
}: ProductDetailsDialogProps) {
  if (!product) {
    return null
  }

  return <ProductDetails key={product.id} product={product} onClose={onClose} />
}

function ProductDetails({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const images = product.images
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
  const specs = product.attributes.filter(
    (attribute) => attribute.role === "spec"
  )
  const stock =
    product.offer.variantCount === 0
      ? "No variants"
      : product.offer.inStock
        ? "In stock"
        : "Out of stock"
  const stockDetail =
    product.offer.variantCount === 0
      ? "Add a variant to sell this product"
      : formatVariantCount(product.offer.variantCount)
  const rating =
    product.ratingSummary.count === 0
      ? "No ratings"
      : product.ratingSummary.average.toFixed(1)
  const ratingDetail =
    product.ratingSummary.count === 0
      ? "No reviews yet"
      : `${product.ratingSummary.count} ${product.ratingSummary.count === 1 ? "review" : "reviews"}`
  const originalPrice = formatOriginalPriceRange(product.offer)

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-5 py-5 pr-12 text-left">
          <div className="flex items-start gap-4">
            <ProductGallery images={images} name={product.name} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-brand-text">
                {product.category.name || "Uncategorized"}
              </p>
              <DialogTitle className="mt-1 text-base leading-snug font-semibold">
                {product.name}
              </DialogTitle>
              {product.shortDescription ? (
                <DialogDescription className="mt-1 line-clamp-2 text-foreground/70">
                  {product.shortDescription}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  {product.slug}
                </DialogDescription>
              )}
              <div className="mt-3">
                <ProductStatusBadges product={product} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <dl className="grid grid-cols-3 border-b border-border">
          <Stat
            label="Price"
            value={formatPriceRange(product.offer)}
            detail={originalPrice ? `Was ${originalPrice}` : undefined}
          />
          <Stat label="Stock" value={stock} detail={stockDetail} />
          <Stat label="Rating" value={rating} detail={ratingDetail} />
        </dl>

        <ScrollArea
          type="auto"
          className="min-h-0 flex-1 overflow-hidden"
          viewportClassName="h-auto max-h-[min(22rem,calc(100dvh-20rem))]"
        >
          <div className="flex flex-col gap-5 px-5 py-5">
            {product.reviewNote ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {product.reviewNote}
              </p>
            ) : null}

            <section className="flex flex-col gap-1.5">
              <SectionTitle>Description</SectionTitle>
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                {product.description || "No description yet."}
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <SectionTitle>Details</SectionTitle>
              <dl className="overflow-hidden rounded-lg border border-border">
                <SpecRow label="Slug" value={product.slug} />
                <SpecRow
                  label="Created"
                  value={formatProductDate(product.createdAt)}
                />
                <SpecRow
                  label="Updated"
                  value={formatProductDate(product.updatedAt)}
                />
                {specs.map((attribute) => (
                  <SpecRow
                    key={attribute.attributeId}
                    label={attributeLabel(attribute)}
                    value={attributeValue(attribute)}
                  />
                ))}
              </dl>
            </section>

            {product.tags.length > 0 ? (
              <section className="flex flex-col gap-1.5">
                <SectionTitle>Tags</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <ProductTagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </ScrollArea>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-border bg-card px-5 py-3">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[]
  name: string
}) {
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const visible = images.filter((image) => !failed[image.id])
  const [activeId, setActiveId] = useState(visible[0]?.id)
  const active = visible.find((image) => image.id === activeId) ?? visible[0]

  if (!active) {
    return (
      <span className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm ring-4 ring-background sm:size-28">
        <Package className="size-5" />
      </span>
    )
  }

  return (
    <div className="flex w-24 shrink-0 flex-col gap-1.5 sm:w-28">
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl bg-background shadow-sm ring-4 ring-background sm:size-28">
        <img
          src={resolveAssetUrl(active.url)}
          alt={active.alt || name}
          className="max-h-full max-w-full object-contain"
          onError={() =>
            setFailed((current) => ({ ...current, [active.id]: true }))
          }
        />
      </div>
      {visible.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto">
          {visible.map((image) => (
            <button
              key={image.id}
              type="button"
              aria-label={image.alt || "Show image"}
              aria-pressed={image.id === active.id}
              className={cn(
                "size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border bg-muted",
                image.id === active.id && "border-brand ring-1 ring-brand"
              )}
              onClick={() => setActiveId(image.id)}
            >
              <img
                src={resolveAssetUrl(image.url)}
                alt=""
                className="size-full object-cover"
                onError={() =>
                  setFailed((current) => ({ ...current, [image.id]: true }))
                }
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="min-w-0 px-4 py-3 not-first:border-l not-first:border-border">
      <dt className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="truncate text-sm font-medium">{value}</dd>
      {detail ? (
        <dd className="truncate text-xs text-muted-foreground">{detail}</dd>
      ) : null}
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm wrap-break-word">{value}</dd>
    </div>
  )
}

function attributeLabel(attribute: ProductAttribute) {
  return attribute.unit && attribute.type !== "number"
    ? `${attribute.name} (${attribute.unit})`
    : attribute.name
}

function attributeValue(attribute: ProductAttribute) {
  if (attribute.type === "text") {
    return attribute.text || "—"
  }

  if (attribute.type === "number") {
    if (attribute.number === null) {
      return "—"
    }

    return attribute.unit
      ? `${attribute.number} ${attribute.unit}`
      : String(attribute.number)
  }

  if (attribute.type === "boolean") {
    if (attribute.boolean === null) {
      return "—"
    }

    return attribute.boolean ? "Yes" : "No"
  }

  const labels = attribute.options
    .map((option) => option.label)
    .filter((label) => label.length > 0)

  return labels.length > 0 ? labels.join(", ") : "—"
}
