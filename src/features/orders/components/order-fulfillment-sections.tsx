import {
  INBOUND_BATCH_STATUS_LABEL,
  REJECT_RETURN_STATUS_LABEL,
} from "../constants"
import { formatOrderDateTime } from "../lib/format"
import type { VendorInboundBatch, VendorRejectReturn } from "../types"

function humanizeReason(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function OrderInboundBatches({
  batches,
}: {
  batches: VendorInboundBatch[]
}) {
  if (batches.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        No inbound shipments yet. Sending to the warehouse creates batch #1.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {batches.map((batch) => (
        <article
          key={batch.id}
          className="overflow-hidden rounded-lg border border-border"
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <p className="text-sm font-medium">Batch #{batch.sequence}</p>
            <p className="text-xs text-muted-foreground">
              {INBOUND_BATCH_STATUS_LABEL[batch.status]}
            </p>
          </header>
          <dl className="grid gap-px border-b border-border bg-border text-xs sm:grid-cols-3">
            <BatchFact
              label="Dispatched"
              value={
                batch.dispatchedAt
                  ? formatOrderDateTime(batch.dispatchedAt)
                  : "—"
              }
            />
            <BatchFact
              label="Received"
              value={
                batch.receivedAt ? formatOrderDateTime(batch.receivedAt) : "—"
              }
            />
            <BatchFact
              label="Inspected"
              value={
                batch.inspectedAt ? formatOrderDateTime(batch.inspectedAt) : "—"
              }
            />
          </dl>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Sent</th>
                  <th className="px-3 py-2 font-medium">Accepted</th>
                  <th className="px-3 py-2 font-medium">Rejected</th>
                </tr>
              </thead>
              <tbody>
                {batch.lines.map((line) => (
                  <tr
                    key={`${batch.id}-${line.variantId}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium">{line.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {line.sku}
                        {line.rejectedQty > 0 && line.rejectionReason
                          ? ` · ${humanizeReason(line.rejectionReason)}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-3 py-2">{line.sentQty}</td>
                    <td className="px-3 py-2">{line.acceptedQty}</td>
                    <td className="px-3 py-2">{line.rejectedQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </div>
  )
}

export function OrderRejectReturns({
  returns,
}: {
  returns: VendorRejectReturn[]
}) {
  if (returns.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {returns.map((ret) => (
        <article
          key={ret.id}
          className="overflow-hidden rounded-lg border border-border"
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <p className="text-sm font-medium">Rejected return</p>
            <p className="text-xs text-muted-foreground">
              {REJECT_RETURN_STATUS_LABEL[ret.status]}
            </p>
          </header>
          <ul className="divide-y divide-border">
            {ret.lines.map((line) => (
              <li
                key={`${ret.id}-${line.variantId}`}
                className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{line.sku}</p>
                  <p className="text-xs text-muted-foreground">
                    {humanizeReason(line.rejectionReason)}
                    {line.rejectionNote ? ` — ${line.rejectionNote}` : ""}
                  </p>
                </div>
                <span className="text-muted-foreground">
                  Qty {line.quantity}
                </span>
              </li>
            ))}
          </ul>
          <footer className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            {ret.sentToVendorAt
              ? `Sent to you ${formatOrderDateTime(ret.sentToVendorAt)}`
              : "Not yet sent to you"}
            {ret.receivedByVendorAt
              ? ` · Acknowledged ${formatOrderDateTime(ret.receivedByVendorAt)}`
              : ""}
          </footer>
        </article>
      ))}
    </div>
  )
}

function BatchFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  )
}
