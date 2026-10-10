import {
  BadgeCheck,
  BadgePercent,
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  MousePointerClick,
  Package,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Store,
  Ticket,
  Truck,
  Undo2,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react"

type NavPageShape = {
  kind: "page"
  label: string
  path: string
  description: string
  icon: LucideIcon
}

type NavGroupShape = {
  kind: "group"
  label: string
  icon: LucideIcon
  children: readonly NavPageShape[]
}

type NavShape = NavPageShape | NavGroupShape

function defineNav<const T extends readonly NavShape[]>(nav: T) {
  return nav
}

export const NAV = defineNav([
  {
    kind: "page",
    label: "Dashboard",
    path: "/",
    description: "Sales, open orders, and stock that needs attention today.",
    icon: LayoutDashboard,
  },
  {
    kind: "group",
    label: "Store",
    icon: Store,
    children: [
      {
        kind: "page",
        label: "Store Profile",
        path: "/store/profile",
        description: "Public store name, logo, and contact details.",
        icon: Store,
      },
      {
        kind: "page",
        label: "Products",
        path: "/store/products",
        description: "Listings published from this store.",
        icon: Package,
      },
      {
        kind: "page",
        label: "Inventory",
        path: "/store/inventory",
        description: "Stock levels and items running low.",
        icon: Boxes,
      },
      {
        kind: "page",
        label: "Reviews",
        path: "/store/reviews",
        description: "Buyer reviews left on products from this store.",
        icon: Star,
      },
    ],
  },
  {
    kind: "group",
    label: "Orders",
    icon: ShoppingBag,
    children: [
      {
        kind: "page",
        label: "All Orders",
        path: "/orders/all",
        description: "Every order placed with this store.",
        icon: ShoppingBag,
      },
      {
        kind: "page",
        label: "Processing",
        path: "/orders/processing",
        description: "Orders that still need to be packed and shipped.",
        icon: Package,
      },
      {
        kind: "page",
        label: "Shipped",
        path: "/orders/shipped",
        description: "Orders that have left the store.",
        icon: Truck,
      },
      {
        kind: "page",
        label: "Returns",
        path: "/orders/returns",
        description: "Return requests waiting on this store.",
        icon: Undo2,
      },
    ],
  },
  {
    kind: "group",
    label: "Marketing",
    icon: Megaphone,
    children: [
      {
        kind: "page",
        label: "Discounts",
        path: "/marketing/discounts",
        description: "Price reductions applied to store listings.",
        icon: BadgePercent,
      },
      {
        kind: "page",
        label: "Coupons",
        path: "/marketing/coupons",
        description: "Discount codes, usage limits, and active windows.",
        icon: Ticket,
      },
      {
        kind: "page",
        label: "Flash Deals",
        path: "/marketing/flash-deals",
        description: "Time-boxed deals with a start and an end.",
        icon: Zap,
      },
      {
        kind: "page",
        label: "Sponsored Ads",
        path: "/marketing/sponsored-ads",
        description: "Paid placements running for this store.",
        icon: MousePointerClick,
      },
    ],
  },
  {
    kind: "group",
    label: "Finance",
    icon: Wallet,
    children: [
      {
        kind: "page",
        label: "Earnings",
        path: "/finance/earnings",
        description: "What this store has earned and what is still held.",
        icon: CircleDollarSign,
      },
      {
        kind: "page",
        label: "Transactions",
        path: "/finance/transactions",
        description: "Charges, fees, and balance movements.",
        icon: Receipt,
      },
      {
        kind: "page",
        label: "Withdrawals",
        path: "/finance/withdrawals",
        description: "Payout requests and completed transfers.",
        icon: Banknote,
      },
    ],
  },
  {
    kind: "group",
    label: "Growth",
    icon: BarChart3,
    children: [
      {
        kind: "page",
        label: "Analytics",
        path: "/growth/analytics",
        description: "Traffic, conversion, and sales performance.",
        icon: BarChart3,
      },
      {
        kind: "page",
        label: "Subscription Plans",
        path: "/growth/subscription-plans",
        description: "Plans this store can buy to unlock more tools.",
        icon: BadgeCheck,
      },
    ],
  },
  {
    kind: "group",
    label: "Settings",
    icon: Settings,
    children: [
      {
        kind: "page",
        label: "Business Profile",
        path: "/settings/business-profile",
        description: "Legal business name, tax details, and contacts.",
        icon: Building2,
      },
      {
        kind: "page",
        label: "Shipping & Returns",
        path: "/settings/shipping-returns",
        description: "Fulfillment rules and the store return policy.",
        icon: Truck,
      },
      {
        kind: "page",
        label: "Payout Details",
        path: "/settings/payout-details",
        description: "Bank account used for store withdrawals.",
        icon: CreditCard,
      },
      {
        kind: "page",
        label: "Security",
        path: "/settings/security",
        description: "Password, sessions, and account protection.",
        icon: Shield,
      },
    ],
  },
])

export type NavEntry = (typeof NAV)[number]
export type NavGroup = Extract<NavEntry, { kind: "group" }>
export type NavPage = Extract<
  NavEntry | NavGroup["children"][number],
  { kind: "page" }
>

type ExtractPaths<T> = T extends readonly (infer Item)[]
  ? Item extends { path: infer Path extends string }
    ? Path
    : Item extends { children: infer Children }
      ? ExtractPaths<Children>
      : never
  : never

export type VendorPath = ExtractPaths<typeof NAV>

export type PageHandle = {
  title: string
  description: string
}

export function isNavGroup(
  entry: NavEntry
): entry is Extract<NavEntry, { kind: "group" }> {
  return entry.kind === "group"
}

export function pathSegment(path: string) {
  return path.split("/").filter(Boolean).at(-1) ?? ""
}

export function groupBase(group: NavGroup) {
  const [base] = group.children[0].path.split("/").filter(Boolean)
  return base ?? ""
}
