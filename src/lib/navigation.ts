import {
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Undo2,
  Wallet,
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
    label: "Catalog",
    icon: Package,
    children: [
      {
        kind: "page",
        label: "Products",
        path: "/catalog/products",
        description: "Listings published from this store.",
        icon: Package,
      },
      {
        kind: "page",
        label: "Inventory",
        path: "/catalog/inventory",
        description: "Stock levels and items running low.",
        icon: Boxes,
      },
    ],
  },
  {
    kind: "group",
    label: "Commerce",
    icon: ShoppingBag,
    children: [
      {
        kind: "page",
        label: "Orders",
        path: "/commerce/orders",
        description: "Orders placed with this store.",
        icon: ShoppingBag,
      },
      {
        kind: "page",
        label: "Returns",
        path: "/commerce/returns",
        description: "Return requests waiting on this store.",
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
        label: "Payouts",
        path: "/finance/payouts",
        description: "Payout requests and completed transfers.",
        icon: Wallet,
      },
    ],
  },
  {
    kind: "group",
    label: "Store",
    icon: Store,
    children: [
      {
        kind: "page",
        label: "Profile",
        path: "/store/profile",
        description: "Public store name, logo, and contact details.",
        icon: Store,
      },
      {
        kind: "page",
        label: "Settings",
        path: "/store/settings",
        description: "Fulfillment and notification preferences.",
        icon: Settings,
      },
    ],
  },
  {
    kind: "page",
    label: "Support",
    path: "/support",
    description: "Messages between this store and the platform.",
    icon: LifeBuoy,
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
