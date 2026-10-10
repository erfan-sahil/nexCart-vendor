export type Stat = {
  label: string
  value: string
  change: string
  hint: string
}

export type SalesPoint = {
  label: string
  amount: string
  share: number
}

export type OrderRow = {
  id: string
  buyer: string
  total: string
  status: "Paid" | "Packing" | "Return requested"
}

export type StockRow = {
  product: string
  sku: string
  left: string
}

export const STATS: Stat[] = [
  {
    label: "Store sales",
    value: "$6,840",
    change: "+8.2%",
    hint: "Last 7 days",
  },
  {
    label: "Open orders",
    value: "24",
    change: "7 new",
    hint: "Need fulfillment",
  },
  {
    label: "Low stock",
    value: "5",
    change: "2 urgent",
    hint: "Under 8 units",
  },
  {
    label: "Next payout",
    value: "$1,120",
    change: "Friday",
    hint: "Available balance",
  },
]

export const SALES: SalesPoint[] = [
  { label: "Mon", amount: "$720", share: 48 },
  { label: "Tue", amount: "$860", share: 58 },
  { label: "Wed", amount: "$640", share: 42 },
  { label: "Thu", amount: "$980", share: 66 },
  { label: "Fri", amount: "$1.2k", share: 82 },
  { label: "Sat", amount: "$1.5k", share: 100 },
  { label: "Sun", amount: "$940", share: 63 },
]

export const ORDERS: OrderRow[] = [
  {
    id: "NC-20841",
    buyer: "Maya Chen",
    total: "$86.00",
    status: "Paid",
  },
  {
    id: "NC-20836",
    buyer: "Jonah Hale",
    total: "$42.50",
    status: "Packing",
  },
  {
    id: "NC-20822",
    buyer: "Priya Nair",
    total: "$128.00",
    status: "Return requested",
  },
  {
    id: "NC-20818",
    buyer: "Leo Martins",
    total: "$64.20",
    status: "Paid",
  },
]

export const STOCK: StockRow[] = [
  { product: "Linen throw, sage", sku: "LN-204", left: "3 left" },
  { product: "Ceramic pourer", sku: "CR-118", left: "5 left" },
  { product: "Oak tray, small", sku: "OK-041", left: "2 left" },
]
