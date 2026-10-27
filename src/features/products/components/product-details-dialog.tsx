import { useState, type ReactNode } from "react"
import { Archive, CircleCheck, Package, Star } from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
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

import { useProductVariants } from "../hooks"
import {
  formatMoney,
  formatOriginalPriceRange,
  formatPriceRange,
  formatProductDate,
  formatVariantCount,
} from "../lib/format"
import type {
  Product,
  ProductAttribute,
  ProductImage,
  ProductVariant,
} from "../types"

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
  const hasVariants = product.offer.variantCount > 0
  const originalPrice = formatOriginalPriceRange(product.offer)
  const stock =
    product.offer.variantCount === 0
      ? "No variants"
      : product.offer.inStock
        ? "In stock"
        : "Out of stock"
  const rating =
    product.ratingSummary.count === 0
      ? "No ratings"
      : product.ratingSummary.average.toFixed(1)
  const ratingDetail =
    product.ratingSummary.count === 0
      ? "No reviews yet"
      : `${product.ratingSummary.count} ${product.ratingSummary.count === 1 ? "review" : "reviews"}`

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex h-[min(44rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 text-left">
          <p className="text-xs font-medium text-brand-text">
            {product.category.name || "Uncategorized"}
          </p>
          <DialogTitle className="mt-1 text-lg leading-snug font-semibold">
            {product.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Product details for {product.name}
          </DialogDescription>
          <div className="mt-3">
            <ProductStatusBadges product={product} />
          </div>
        </DialogHeader>

        <ScrollArea type="auto" className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 px-5 py-5">
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Fact
                label="Price"
                value={formatPriceRange(product.offer)}
                detail={originalPrice ? `Was ${originalPrice}` : undefined}
              />
              <Fact
                label="Stock"
                value={stock}
                detail={
                  hasVariants
                    ? formatVariantCount(product.offer.variantCount)
                    : "Add a variant to sell"
                }
              />
              <Fact label="Rating" value={rating} detail={ratingDetail} />
              <Fact
                label="Store"
                value={product.store.name || "—"}
                detail={formatProductDate(product.updatedAt)}
              />
            </dl>

            {product.reviewNote ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {product.reviewNote}
              </p>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <ProductGallery images={images} name={product.name} />
              <Section title="Description" className="min-w-0 flex-1">
                <div className="rounded-lg border border-border px-3 py-3">
                  {product.shortDescription ? (
                    <p className="text-sm font-medium">
                      {product.shortDescription}
                    </p>
                  ) : null}
                  <p
                    className={cn(
                      "text-sm leading-relaxed whitespace-pre-line text-foreground",
                      product.shortDescription && "mt-2 text-muted-foreground"
                    )}
                  >
                    {product.description || "No description yet."}
                  </p>
                </div>
              </Section>
            </div>

            {specs.length > 0 ? (
              <Section title="Specifications">
                <FactList
                  items={specs.map((attribute) => ({
                    label: attributeLabel(attribute),
                    value: attributeValue(attribute),
                  }))}
                />
              </Section>
            ) : null}

            <Section
              title="Variants"
              meta={formatVariantCount(product.offer.variantCount)}
            >
              {hasVariants ? (
                <VariantList productId={product.id} />
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                  Add a variant to sell this product.
                </p>
              )}
            </Section>

            {product.tags.length > 0 ? (
              <Section title="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <ProductTagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </Section>
            ) : null}

            <Section title="Record">
              <FactList
                items={[
                  { label: "Slug", value: product.slug },
                  {
                    label: "Category",
                    value: product.category.name || "Uncategorized",
                  },
                  {
                    label: "Created",
                    value: formatProductDate(product.createdAt),
                  },
                  {
                    label: "Updated",
                    value: formatProductDate(product.updatedAt),
                  },
                ]}
              />
            </Section>
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

function VariantList({ productId }: { productId: string }) {
  const variants = useProductVariants(productId, true)
  const page = variants.data

  if (variants.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        <div className="h-14 animate-pulse rounded-lg bg-muted" />
        <div className="h-14 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (variants.isError || !page) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Variants could not be loaded.
      </p>
    )
  }

  const items = page.items.slice().sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1
    }

    return left.sku.localeCompare(right.sku)
  })

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This product has no variants yet.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="hidden grid-cols-[minmax(0,1.5fr)_6.5rem_5.5rem_7.5rem] gap-3 border-b border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:grid">
        <span>Variant</span>
        <span>Price</span>
        <span>Stock</span>
        <span>Status</span>
      </div>
      <ul>
        {items.map((variant) => (
          <li
            key={variant.id}
            className="border-b border-border last:border-b-0"
          >
            <VariantRow variant={variant} />
          </li>
        ))}
      </ul>
      {page.pagination.total > items.length ? (
        <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          Showing {items.length} of {page.pagination.total} variants.
        </p>
      ) : null}
    </div>
  )
}

function VariantRow({ variant }: { variant: ProductVariant }) {
  const discounted = variant.currentPrice !== variant.price
  const discount = discountLabel(variant)
  const options = variant.attributes
    .map(
      (attribute) =>
        `${attributeLabel(attribute)}: ${attributeValue(attribute)}`
    )
    .filter((label) => !label.endsWith(": —"))

  return (
    <div className="grid gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1.5fr)_6.5rem_5.5rem_7.5rem] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <VariantImage image={variant.image} name={variant.sku} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {options.length > 0 ? options.join(" · ") : "Standard"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {variant.sku}
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">
          {formatMoney(variant.currentPrice)}
        </p>
        {discounted ? (
          <p className="text-xs text-muted-foreground line-through">
            {formatMoney(variant.price)}
          </p>
        ) : null}
        {discount ? (
          <p className="text-xs text-muted-foreground">{discount}</p>
        ) : null}
      </div>
      <p className="text-sm">
        {variant.stock === 0 ? "Out of stock" : variant.stock}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {variant.isDefault ? (
          <StatusBadge icon={Star} tone="brand">
            Default
          </StatusBadge>
        ) : null}
        <StatusBadge
          icon={variant.status === "active" ? CircleCheck : Archive}
          tone={variant.status === "active" ? "success" : "neutral"}
        >
          {variant.status === "active" ? "Active" : "Archived"}
        </StatusBadge>
      </div>
    </div>
  )
}

function VariantImage({
  image,
  name,
}: {
  image: ProductImage | null
  name: string
}) {
  const [failed, setFailed] = useState(false)

  if (!image || failed) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Package className="size-4" />
      </span>
    )
  }

  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
      <img
        src={resolveAssetUrl(image.url)}
        alt={image.alt || name}
        className="size-full object-cover"
        onError={() => setFailed(true)}
      />
    </span>
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
      <div className="flex size-36 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground sm:size-44">
        <Package className="size-6" />
      </div>
    )
  }

  return (
    <div className="flex w-36 shrink-0 flex-col gap-2 sm:w-44">
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
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
        <div className="flex gap-1.5 overflow-x-auto">
          {visible.map((image) => (
            <button
              key={image.id}
              type="button"
              aria-label={image.alt || "Show image"}
              aria-pressed={image.id === active.id}
              className={cn(
                "size-12 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border bg-muted",
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

function Section({
  title,
  meta,
  className,
  children,
}: {
  title: string
  meta?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Fact({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border px-3 py-2.5">
      <dt className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
      {detail ? (
        <dd className="truncate text-xs text-muted-foreground">{detail}</dd>
      ) : null}
    </div>
  )
}

function FactList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-sm wrap-break-word">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function discountLabel(variant: ProductVariant) {
  if (variant.discountType === null || variant.discountValue === null) {
    return null
  }

  if (variant.discountType === "percent") {
    return `${variant.discountValue}% off`
  }

  return `${formatMoney(variant.discountValue)} off`
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
