import { Link } from "react-router"

import { formatMoney } from "@/lib/format"

import type { VendorDashboardOverview } from "../types"

type WalletCardProps = {
  wallet: VendorDashboardOverview["wallet"]
}

export function WalletCard({ wallet }: WalletCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Wallet</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Settlement and withdrawable balance.
          </p>
        </div>
        <Link
          to="/finance/earnings"
          className="shrink-0 text-xs font-medium text-brand-text hover:underline"
        >
          Finance
        </Link>
      </div>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Available</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">
            {formatMoney(wallet.availableBalance)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Pending settlement</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">
            {formatMoney(wallet.pendingSettlement)}
          </dd>
        </div>
      </dl>
    </article>
  )
}
