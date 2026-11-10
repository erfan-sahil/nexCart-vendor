import {
  BadgePercent,
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Undo2,
  Wallet,
  type AppIcon,
} from "@/lib/icons"

type NavPageShape = {
  kind: "page"
  label: string
  path: string
  description: string
  icon: AppIcon
}

type NavGroupShape = {
  kind: "group"
  label: string
  icon: AppIcon
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
        description:
          "Public storefront name, images, contact, categories, and policies.",
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
      {
        kind: "page",
        label: "Discounts",
        path: "/store/discounts",
        description: "Price reductions applied to store listings.",
        icon: BadgePercent,
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
        label: "Orders",
        path: "/orders",
        description: "Manage vendor orders and fulfillment steps.",
        icon: ShoppingBag,
      },
      {
        kind: "page",
        label: "Returns",
        path: "/orders/returns",
        description: "Rejected products and return acknowledgments.",
        icon: Undo2,
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
    kind: "page",
    label: "Analytics",
    path: "/analytics",
    description: "Sales, product, and fulfillment performance.",
    icon: BarChart3,
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
        description:
          "Verified legal identity, business registration, and tax records.",
        icon: Building2,
      },
      {
        kind: "page",
        label: "Payout Details",
        path: "/settings/payout-details",
        description: "Bank account used for store withdrawals.",
        icon: CreditCard,
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
