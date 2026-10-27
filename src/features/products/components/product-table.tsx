import { useState, type ReactNode } from "react"
import { Package } from "lucide-react"

import { resolveAssetUrl } from "@/lib/api/assets"

import { PRODUCT_APPROVAL_LABEL, PRODUCT_STATUS_LABEL } from "../constants"
import {
  formatPriceRange,
  formatProductDate,
  formatVariantCount,
} from "../lib/format"
import type { Product, ProductApprovalStatus, ProductStatus } from "../types"

const STATUS_CLASS: Record<ProductStatus, string> = {
  active: "bg-brand-soft text-brand-text",
  archived: "bg-muted text-muted-foreground",
}

const APPROVAL_CLASS: Record<ProductApprovalStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  submitted: "bg-secondary text-secondary-foreground",
  approved: "bg-brand-soft text-brand-text",
  rejected: "bg-destructive/10 text-destructive",
}

type ProductTableProps = {
  products: Product[]
  isRefreshing: boolean
}

export function ProductTable({ products, isRefreshing }: ProductTableProps) {
  return (
    <div
      className={
        isRefreshing ? "opacity-70 transition-opacity" : "transition-opacity"
      }
    >
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Store products</caption>
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">
                  <ProductIdentity product={product} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {product.category.name || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatPriceRange(product.offer)}
                </td>
                <td className="px-4 py-3">
                  <StockCell product={product} />
                </td>
                <td className="px-4 py-3">
                  <StatusCell product={product} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatProductDate(product.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {products.map((product) => (
          <li key={product.id} className="flex gap-3 px-4 py-4">
            <ProductThumb product={product} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {product.category.name || "Uncategorized"}
              </p>
              <p className="mt-2 text-sm">{formatPriceRange(product.offer)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusCell product={product} />
                <span className="text-xs text-muted-foreground">
                  {product.offer.variantCount === 0
                    ? "No variants"
                    : product.offer.inStock
                      ? "In stock"
                      : "Out of stock"}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProductIdentity({ product }: { product: Product }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductThumb product={product} />
      <div className="min-w-0">
        <p className="truncate font-medium">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {product.shortDescription || product.slug}
          {product.isFeatured ? " · Featured" : ""}
        </p>
      </div>
    </div>
  )
}

function ProductThumb({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false)
  const url = product.thumbnail?.url

  if (!url || failed) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Package className="size-4" />
      </span>
    )
  }

  return (
    <img
      src={resolveAssetUrl(url)}
      alt=""
      className="size-10 shrink-0 rounded-lg object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function StockCell({ product }: { product: Product }) {
  if (product.offer.variantCount === 0) {
    return <span className="text-muted-foreground">No variants</span>
  }

  return (
    <div>
      <p>{product.offer.inStock ? "In stock" : "Out of stock"}</p>
      <p className="text-xs text-muted-foreground">
        {formatVariantCount(product.offer.variantCount)}
      </p>
    </div>
  )
}

function StatusCell({ product }: { product: Product }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge className={STATUS_CLASS[product.status]}>
        {PRODUCT_STATUS_LABEL[product.status]}
      </Badge>
      <Badge
        className={APPROVAL_CLASS[product.approvalStatus]}
        title={product.reviewNote || undefined}
      >
        {PRODUCT_APPROVAL_LABEL[product.approvalStatus]}
      </Badge>
      <Badge
        className={
          product.isPublished
            ? "bg-brand-soft text-brand-text"
            : "bg-muted text-muted-foreground"
        }
      >
        {product.isPublished ? "Published" : "Unpublished"}
      </Badge>
    </div>
  )
}

function Badge({
  className,
  title,
  children,
}: {
  className: string
  title?: string
  children: ReactNode
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  )
}
