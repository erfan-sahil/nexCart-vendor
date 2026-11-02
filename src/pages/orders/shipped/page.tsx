import { VendorOrdersView } from "@/features/orders"

export function ShippedPage() {
  return (
    <VendorOrdersView
      title="Inbound shipments"
      description="Orders you have sent toward the NexCart warehouse."
      shippedOnly
    />
  )
}
