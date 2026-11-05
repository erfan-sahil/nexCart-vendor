import type { OrderStatusTab } from "../constants"

export type VendorOrderStatus =
  | "pending"
  | "accepted"
  | "cancelled"
  | "preparing"
  | "sending_to_warehouse"
  | "received_at_warehouse"
  | "inspecting"
  | "accepted_at_warehouse"
  | "partially_accepted"
  | "rejected_at_warehouse"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed"
  | "customer_rejected"

export type InboundBatchStatus =
  "dispatched" | "received" | "inspecting" | "inspected"

export type RejectReturnStatus =
  "pending_return" | "in_transit_to_vendor" | "received_by_vendor"

export type VendorOrderSort =
  "createdAt" | "-createdAt" | "updatedAt" | "-updatedAt"

export type VendorOrderItem = {
  variantId: string
  productId: string
  productName: string
  sku: string
  quantity: number
  expectedQty: number
  targetQty: number
  acceptedQtyCumulative: number
  unitPrice: number
  lineTotal: number
}

export type VendorOrder = {
  id: string
  parentOrderId: string
  orderNumber: string
  vendorOrderNumber: string
  storeId: string
  storeName: string
  status: VendorOrderStatus
  items: VendorOrderItem[]
  itemsSubtotal: number
  createdAt: string
  updatedAt: string
}

export type InboundBatchLine = {
  variantId: string
  sku: string
  productName: string
  sentQty: number
  acceptedQty: number
  rejectedQty: number
  rejectionReason: string | null
  rejectionNote: string | null
}

export type VendorInboundBatch = {
  id: string
  sequence: number
  status: InboundBatchStatus
  lines: InboundBatchLine[]
  dispatchedAt: string
  receivedAt: string | null
  inspectedAt: string | null
}

export type RejectReturnLine = {
  variantId: string
  sku: string
  quantity: number
  rejectionReason: string
  rejectionNote: string | null
}

export type VendorRejectReturn = {
  id: string
  inboundBatchId: string
  status: RejectReturnStatus
  lines: RejectReturnLine[]
  sentToVendorAt: string | null
  receivedByVendorAt: string | null
}

export type VendorInboundFulfillment = {
  id: string
  orderId: string
  orderNumber: string
  storeId: string
  storeName: string
  status: string
  itemsSubtotal: number
  hasDiscrepancy: boolean
  inboundCarrier: string
  inboundTracking: string
  dispatchedAt: string | null
  receivedAt: string | null
  inspectedAt: string | null
  createdAt: string
  updatedAt: string
}

export type VendorOrderDetail = VendorOrder & {
  inbound: VendorInboundFulfillment | null
  inboundBatches: VendorInboundBatch[]
  rejectReturns: VendorRejectReturn[]
}

export type VendorOrderSummary = {
  total: number
  pending: number
  accepted: number
  preparing: number
  sendingToWarehouse: number
  receivedAtWarehouse: number
  inspecting: number
  acceptedAtWarehouse: number
  partiallyAccepted: number
  rejectedAtWarehouse: number
  packed: number
  shipped: number
  outForDelivery: number
  delivered: number
}

export type ListVendorOrdersParams = {
  page?: number
  limit?: number
  status?: VendorOrderStatus
  sort?: VendorOrderSort
}

export type ListVendorOrdersResult = {
  items: VendorOrder[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type OrderListQuery = {
  page: number
  limit: number
  search?: string
  tab: OrderStatusTab
  sort: VendorOrderSort
}

export type OrderListPatch = Partial<OrderListQuery>
