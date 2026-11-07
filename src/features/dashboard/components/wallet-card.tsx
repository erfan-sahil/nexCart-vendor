import { Landmark } from "lucide-react"

import { formatMoney } from "@/lib/format"

import { PanelSecondaryLink } from "./panel-secondary-link"
import { dashboardPanelClass } from "../lib/dashboard-surface"
import type { VendorDashboardOverview } from "../types"

type WalletCardProps = {
  wallet: VendorDashboardOverview["wallet"]
}

export function WalletCard({ wallet }: WalletCardProps) {
  return (
    <article className={`p-4 sm:p-6 ${dashboardPanelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
            <Landmark className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Wallet</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Settlement and withdrawable balance.
            </p>
          </div>
        </div>
        <PanelSecondaryLink to="/finance/earnings">Finance</PanelSecondaryLink>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/50 p-3">
          <dt className="text-xs font-medium text-muted-foreground">
            Available
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">
            {formatMoney(wallet.availableBalance)}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <dt className="text-xs font-medium text-muted-foreground">
            Pending settlement
          </dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">
            {formatMoney(wallet.pendingSettlement)}
          </dd>
        </div>
      </dl>
    </article>
  )
}
