export type VendorOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready_to_ship"
  | "in_transit"
  | "received"
  | "partially_received"
  | "exception"
  | "completed"
  | "cancelled"

export type VendorOrderItem = {
  variantId: string
  productId: string
  productName: string
  sku: string
  quantity: number
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

export type VendorOrderSummary = {
  total: number
  pending: number
  accepted: number
  preparing: number
  readyToShip: number
  inTransit: number
  completed: number
}

export type ListVendorOrdersParams = {
  page?: number
  limit?: number
  status?: VendorOrderStatus
  sort?: string
}

export type ListVendorOrdersResult = {
  items: VendorOrder[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}
