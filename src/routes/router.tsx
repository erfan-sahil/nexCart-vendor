import { createElement, type ComponentType } from "react"
import { createBrowserRouter, Navigate, type RouteObject } from "react-router"

import { VendorShell } from "@/components/layout/vendor-shell"
import {
  groupBase,
  isNavGroup,
  NAV,
  pathSegment,
  type NavPage,
  type PageHandle,
  type VendorPath,
} from "@/lib/navigation"
import { InventoryPage } from "@/pages/catalog/inventory/page"
import { ProductsPage } from "@/pages/catalog/products/page"
import { OrdersPage } from "@/pages/commerce/orders/page"
import { ReturnsPage } from "@/pages/commerce/returns/page"
import { DashboardPage } from "@/pages/dashboard/page"
import { EarningsPage } from "@/pages/finance/earnings/page"
import { PayoutsPage } from "@/pages/finance/payouts/page"
import { NotFoundPage } from "@/pages/not-found/page"
import { ProfilePage } from "@/pages/store/profile/page"
import { SettingsPage } from "@/pages/store/settings/page"
import { SupportPage } from "@/pages/support/page"

const pages: Record<VendorPath, ComponentType> = {
  "/": DashboardPage,
  "/catalog/products": ProductsPage,
  "/catalog/inventory": InventoryPage,
  "/commerce/orders": OrdersPage,
  "/commerce/returns": ReturnsPage,
  "/finance/earnings": EarningsPage,
  "/finance/payouts": PayoutsPage,
  "/store/profile": ProfilePage,
  "/store/settings": SettingsPage,
  "/support": SupportPage,
}

function handleFor(page: NavPage): PageHandle {
  return {
    title: page.label,
    description: page.description,
  }
}

function pageRoute(page: NavPage, index = false): RouteObject {
  return {
    ...(index ? { index: true } : { path: pathSegment(page.path) }),
    element: createElement(pages[page.path]),
    handle: handleFor(page),
  }
}

const childRoutes: RouteObject[] = NAV.map((entry) => {
  if (!isNavGroup(entry)) {
    return pageRoute(entry, entry.path === "/")
  }

  const [first] = entry.children

  return {
    path: groupBase(entry),
    children: [
      {
        index: true,
        element: <Navigate to={pathSegment(first.path)} replace />,
      },
      ...entry.children.map((page) => pageRoute(page)),
    ],
  }
})

export const router = createBrowserRouter([
  {
    path: "/",
    element: <VendorShell />,
    children: [
      ...childRoutes,
      {
        path: "*",
        element: <NotFoundPage />,
        handle: {
          title: "Not found",
          description: "This page is not in the vendor dashboard.",
        } satisfies PageHandle,
      },
    ],
  },
])
