import { useState } from "react"
import { useNavigate } from "react-router"
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

import { PRODUCT_APPROVAL_LABEL, PRODUCT_STATUS_LABEL } from "../constants"
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
import type { InventoryProduct, InventoryVariant } from "../types"

import { InventoryPagination } from "./inventory-states"
import { StockLevelBadge } from "./stock-level-badge"

const DETAIL_PAGE_SIZE = 20

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
      <DialogContent className="flex h-[min(40rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 text-left">
          <DialogTitle>Product stock</DialogTitle>
          <DialogDescription>
            {product
              ? `${product.name}. Low stock starts at ${formatUnits(lowStockAt)}.`
              : "Variant stock for this product."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea type="auto" className="min-h-0 flex-1">
          <div className="flex flex-col gap-5 px-5 py-5">
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
                <ProductHeading product={product} />
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

function ProductHeading({ product }: { product: InventoryProduct }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <ProductThumb product={product} />
        <div className="min-w-0">
          <p className="truncate text-base font-medium">{product.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {product.defaultSku || product.slug}
            {" · "}
            {product.category.name || "Uncategorized"}
          </p>
          <div className="mt-2">
            <StockLevelBadge level={product.stockLevel} />
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="On hand" value={formatUnits(product.totalStock)} />
        <Metric label="Sellable" value={formatUnits(product.sellableStock)} />
        <Metric
          label="Price"
          value={formatPriceRange(product.minPrice, product.maxPrice)}
        />
        <Metric
          label="Updated"
          value={formatInventoryDate(product.updatedAt)}
          detail={`${PRODUCT_STATUS_LABEL[product.status]} · ${PRODUCT_APPROVAL_LABEL[product.approvalStatus]}`}
        />
      </dl>
    </div>
  )
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
      {detail ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      ) : null}
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
    <ul
      className={`flex flex-col gap-2 ${isRefreshing ? "opacity-70" : ""}`}
      aria-busy={isRefreshing}
    >
      {variants.map((variant) => (
        <li
          key={variant.id}
          className="grid gap-2 rounded-lg border border-border px-3 py-3 sm:grid-cols-[minmax(0,1.4fr)_auto_auto] sm:items-center"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{variant.sku}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatOptionLabel(variant.options)}
              {variant.isDefault ? " · Default" : ""}
            </p>
          </div>
          <p className="text-sm whitespace-nowrap">
            {formatMoney(variant.currentPrice)}
            {hasDiscount(variant.price, variant.currentPrice) ? (
              <span className="ml-2 text-xs text-muted-foreground line-through">
                {formatMoney(variant.price)}
              </span>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm">{formatCount(variant.stock)}</span>
            <StockLevelBadge level={variant.stockLevel} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function ProductThumb({ product }: { product: InventoryProduct }) {
  const [failed, setFailed] = useState(false)
  const url = product.thumbnail?.url

  if (!url || failed) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Package className="size-4" />
      </span>
    )
  }

  return (
    <img
      src={resolveAssetUrl(url)}
      alt=""
      className="size-12 shrink-0 rounded-lg object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
      <div className="h-14 animate-pulse rounded-lg bg-muted" />
      <div className="h-14 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}
