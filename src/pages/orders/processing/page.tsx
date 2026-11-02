import { VendorOrdersView } from "@/features/orders"

export function ProcessingPage() {
  return (
    <VendorOrdersView
      title="Processing"
      description="Orders you are preparing before they ship to the NexCart warehouse."
      processingOnly
    />
  )
}
