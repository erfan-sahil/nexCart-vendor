import { useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import {
  Archive,
  BadgeCheck,
  Boxes,
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  EyeOff,
  Layers,
  Package,
  PackageX,
  Send,
  ShoppingBag,
  Star,
  Tag,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"

import {
  StatusBadge,
  type StatusBadgeTone,
} from "@/components/shared/status-badge"
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
  PRODUCT_APPROVAL_LABEL,
  PRODUCT_STATUS_LABEL,
  STOCK_LEVEL_LABEL,
} from "../constants"
import { useInventoryProduct } from "../hooks"
import {
  formatCount,
  formatInventoryDate,
  formatMoney,
  formatOptionLabel,
  formatPriceRange,
  formatUnits,
  hasDiscount,
} from "../lib/format"
import type {
  CatalogStatus,
  InventoryProduct,
  InventoryVariant,
  ProductApprovalStatus,
  StockLevel,
} from "../types"

import { InventoryPagination } from "./inventory-states"
import { StockLevelBadge } from "./stock-level-badge"

const DETAIL_PAGE_SIZE = 20

const STATUS_BADGE: Record<
  CatalogStatus,
  { icon: LucideIcon; tone: StatusBadgeTone }
> = {
  active: { icon: CircleCheck, tone: "success" },
  archived: { icon: Archive, tone: "neutral" },
}

const APPROVAL_BADGE: Record<
  ProductApprovalStatus,
  { icon: LucideIcon; tone: StatusBadgeTone }
> = {
  pending: { icon: Clock, tone: "warning" },
  submitted: { icon: Send, tone: "warning" },
  approved: { icon: BadgeCheck, tone: "success" },
  rejected: { icon: CircleX, tone: "danger" },
}

const STOCK_TONE: Record<StockLevel, string> = {
  in_stock: "text-emerald-700 dark:text-emerald-300",
  low_stock: "text-amber-800 dark:text-amber-200",
  out_of_stock: "text-destructive",
}

const METRIC_TONE = {
  brand: "bg-brand-soft text-brand-text",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
} as const

type InventoryProductDialogProps = {
  productId: string | null
  lowStockAt: number
  onClose: () => void
}

export function InventoryProductDialog({
  productId,
  lowStockAt,
  onClose,
}: InventoryProductDialogProps) {
  if (!productId) {
    return null
  }

  return (
    <InventoryProductDetail
      key={`${productId}:${lowStockAt}`}
      productId={productId}
      lowStockAt={lowStockAt}
      onClose={onClose}
    />
  )
}

function InventoryProductDetail({
  productId,
  lowStockAt,
  onClose,
}: {
  productId: string
  lowStockAt: number
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const detail = useInventoryProduct(productId, {
    page,
    limit: DETAIL_PAGE_SIZE,
    lowStockAt,
    sort: "sku",
  })
  const product = detail.data?.product

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex h-[min(46rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 text-left">
          {product ? (
            <ProductHeader product={product} />
          ) : (
            <>
              <DialogTitle>Product stock</DialogTitle>
              <DialogDescription>
                Variant stock for this product.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        <ScrollArea type="auto" className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 px-5 py-5">
            {detail.isPending && !product ? <DetailSkeleton /> : null}

            {detail.isError && !product ? (
              <div role="alert" className="py-10 text-center">
                <p className="text-sm font-medium">
                  Could not load this product
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    void detail.refetch()
                  }}
                >
                  Try again
                </Button>
              </div>
            ) : null}

            {product ? (
              <>
                <ProductMetrics product={product} />
                <StockMix product={product} />
                <Section
                  title="Variants"
                  meta={`${formatCount(detail.data?.pagination.total ?? product.variantCount)} total`}
                >
                  <VariantRows
                    variants={detail.data?.variants ?? []}
                    isRefreshing={detail.isFetching && !detail.isPending}
                  />
                  {detail.data ? (
                    <InventoryPagination
                      page={detail.data.pagination.page}
                      totalPages={detail.data.pagination.totalPages}
                      total={detail.data.pagination.total}
                      limit={detail.data.pagination.limit}
                      disabled={detail.isFetching}
                      onPage={setPage}
                    />
                  ) : null}
                </Section>
                <Section title="Record">
                  <FactList
                    items={[
                      {
                        label: "Default SKU",
                        value: product.defaultSku || "—",
                      },
                      {
                        label: "Category",
                        value: product.category.name || "Uncategorized",
                      },
                      { label: "Store", value: product.store.name || "—" },
                      { label: "Slug", value: product.slug },
                      {
                        label: "Catalog",
                        value: PRODUCT_STATUS_LABEL[product.status],
                      },
                      {
                        label: "Approval",
                        value: PRODUCT_APPROVAL_LABEL[product.approvalStatus],
                      },
                      {
                        label: "Visibility",
                        value: product.isPublished
                          ? "Published"
                          : "Unpublished",
                      },
                      {
                        label: "Updated",
                        value: formatInventoryDate(product.updatedAt),
                      },
                    ]}
                  />
                </Section>
              </>
            ) : null}
          </div>
        </ScrollArea>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-border bg-card px-5 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            onClick={() => navigate(`/store/products/${productId}/edit`)}
          >
            Edit product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProductHeader({ product }: { product: InventoryProduct }) {
  const status = STATUS_BADGE[product.status]
  const approval = APPROVAL_BADGE[product.approvalStatus]

  return (
    <div className="flex items-start gap-3">
      <ProductThumb product={product} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-brand-text">
          {product.category.name || "Uncategorized"}
        </p>
        <DialogTitle className="mt-1 text-lg leading-snug font-semibold">
          {product.name}
        </DialogTitle>
        <DialogDescription className="mt-1 truncate">
          {product.defaultSku || product.slug}
          {" · "}
          Low stock at {formatUnits(product.lowStockAt)}
        </DialogDescription>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <StockLevelBadge level={product.stockLevel} />
          <StatusBadge icon={status.icon} tone={status.tone}>
            {PRODUCT_STATUS_LABEL[product.status]}
          </StatusBadge>
          <StatusBadge icon={approval.icon} tone={approval.tone}>
            {PRODUCT_APPROVAL_LABEL[product.approvalStatus]}
          </StatusBadge>
          <StatusBadge
            icon={product.isPublished ? Eye : EyeOff}
            tone={product.isPublished ? "brand" : "neutral"}
          >
            {product.isPublished ? "Published" : "Unpublished"}
          </StatusBadge>
        </div>
      </div>
    </div>
  )
}

function ProductMetrics({ product }: { product: InventoryProduct }) {
  const sellableTone = product.sellableStock > 0 ? "success" : "danger"

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Metric
        icon={Boxes}
        tone="brand"
        label="On hand"
        value={formatUnits(product.totalStock)}
        detail="All variant stock"
      />
      <Metric
        icon={ShoppingBag}
        tone={sellableTone}
        label="Sellable"
        value={formatUnits(product.sellableStock)}
        detail={
          product.sellableStock > 0 ? "Ready to sell" : "Nothing available"
        }
      />
      <Metric
        icon={Tag}
        tone="info"
        label="Price"
        value={formatPriceRange(product.minPrice, product.maxPrice)}
        detail={
          product.minPrice !== null &&
          product.maxPrice !== null &&
          product.minPrice !== product.maxPrice
            ? "Across variants"
            : "Current price"
        }
      />
      <Metric
        icon={Layers}
        tone="brand"
        label="Variants"
        value={formatCount(product.variantCount)}
        detail={`${formatCount(product.activeVariantCount)} active`}
      />
    </dl>
  )
}

function StockMix({ product }: { product: InventoryProduct }) {
  const ready = Math.max(
    product.variantCount -
      product.lowStockVariantCount -
      product.outOfStockVariantCount,
    0
  )

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Variant stock
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <MixStat
          icon={CircleCheck}
          tone="success"
          label={STOCK_LEVEL_LABEL.in_stock}
          value={formatCount(ready)}
        />
        <MixStat
          icon={TriangleAlert}
          tone="warning"
          label={STOCK_LEVEL_LABEL.low_stock}
          value={formatCount(product.lowStockVariantCount)}
        />
        <MixStat
          icon={PackageX}
          tone="danger"
          label={STOCK_LEVEL_LABEL.out_of_stock}
          value={formatCount(product.outOfStockVariantCount)}
        />
      </div>
    </section>
  )
}

function Metric({
  icon: Icon,
  tone,
  label,
  value,
  detail,
}: {
  icon: LucideIcon
  tone: keyof typeof METRIC_TONE
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border px-3 py-3">
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-md",
            METRIC_TONE[tone]
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        {label}
      </dt>
      <dd className="mt-2 truncate text-sm font-semibold tabular-nums">
        {value}
      </dd>
      <dd className="mt-0.5 truncate text-xs text-muted-foreground">
        {detail}
      </dd>
    </div>
  )
}

function MixStat({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: LucideIcon
  tone: keyof typeof METRIC_TONE
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border px-3 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-md",
            METRIC_TONE[tone]
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        {label}
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function VariantRows({
  variants,
  isRefreshing,
}: {
  variants: InventoryVariant[]
  isRefreshing: boolean
}) {
  if (variants.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        This product has no variants yet.
      </p>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        isRefreshing && "opacity-70"
      )}
      aria-busy={isRefreshing}
    >
      <div className="hidden grid-cols-[minmax(0,1.5fr)_7rem_5.5rem_auto] gap-3 border-b border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:grid">
        <span>Variant</span>
        <span>Price</span>
        <span>Stock</span>
        <span>Level</span>
      </div>
      <ul>
        {variants.map((variant) => (
          <li
            key={variant.id}
            className="border-b border-border px-3 py-3 last:border-b-0"
          >
            <VariantRow variant={variant} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function VariantRow({ variant }: { variant: InventoryVariant }) {
  const discounted = hasDiscount(variant.price, variant.currentPrice)
  const status = STATUS_BADGE[variant.status]

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_7rem_5.5rem_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium">
            {formatOptionLabel(variant.options)}
          </p>
          {variant.isDefault ? (
            <StatusBadge icon={Star} tone="brand">
              Default
            </StatusBadge>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {variant.sku}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium tabular-nums">
          {formatMoney(variant.currentPrice)}
        </p>
        {discounted ? (
          <p className="text-xs text-muted-foreground tabular-nums line-through">
            {formatMoney(variant.price)}
          </p>
        ) : null}
      </div>
      <p
        className={cn(
          "text-sm font-medium tabular-nums",
          STOCK_TONE[variant.stockLevel]
        )}
      >
        {formatCount(variant.stock)}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <StockLevelBadge level={variant.stockLevel} />
        {variant.status === "archived" ? (
          <StatusBadge icon={status.icon} tone={status.tone}>
            {PRODUCT_STATUS_LABEL[variant.status]}
          </StatusBadge>
        ) : null}
      </div>
    </div>
  )
}

function ProductThumb({ product }: { product: InventoryProduct }) {
  const [failed, setFailed] = useState(false)
  const url = product.thumbnail?.url

  if (!url || failed) {
    return (
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Package className="size-5" />
      </span>
    )
  }

  return (
    <img
      src={resolveAssetUrl(url)}
      alt=""
      className="size-14 shrink-0 rounded-xl object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function Section({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
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

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="h-16 animate-pulse rounded-xl bg-muted" />
      <div className="h-28 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}
