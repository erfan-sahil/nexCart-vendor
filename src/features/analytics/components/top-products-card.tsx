import { Link } from "react-router"

import { formatMoney } from "@/lib/format"

import { analyticsPanelClass } from "../lib/analytics-surface"
import type { VendorAnalytics } from "../types"

type TopProductsCardProps = {
  topProducts: VendorAnalytics["topProducts"]
}

export function TopProductsCard({ topProducts }: TopProductsCardProps) {
  return (
    <article className={`overflow-hidden ${analyticsPanelClass}`}>
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h2 className="text-sm font-semibold">Top products</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          By gross sales in this period.
        </p>
      </div>
      {topProducts.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-5">
          No product sales in this period.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium sm:px-5">Product</th>
                <th className="px-4 py-3 font-medium">Units</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium sm:px-5">Share</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr
                  key={product.productId}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 sm:px-5">
                    <Link
                      to={`/store/products/${product.productId}/edit`}
                      className="font-medium hover:text-brand-text hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {product.unitsSold}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoney(product.grossSales)}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex min-w-[8rem] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${Math.min(product.sharePercent, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                        {product.sharePercent.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  )
}
