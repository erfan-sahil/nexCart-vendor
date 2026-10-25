import { createElement, type ComponentType } from "react"
import { createBrowserRouter, Navigate, type RouteObject } from "react-router"

import {
  groupBase,
  isNavGroup,
  NAV,
  pathSegment,
  type NavPage,
  type PageHandle,
  type VendorPath,
} from "@/app/navigation"
import { VendorShell } from "@/components/layout"
import { DashboardPage } from "@/pages/dashboard/page"
import { EarningsPage } from "@/pages/finance/earnings/page"
import { TransactionsPage } from "@/pages/finance/transactions/page"
import { WithdrawalsPage } from "@/pages/finance/withdrawals/page"
import { AnalyticsPage } from "@/pages/growth/analytics/page"
import { SubscriptionPlansPage } from "@/pages/growth/subscription-plans/page"
import { CouponsPage } from "@/pages/marketing/coupons/page"
import { DiscountsPage } from "@/pages/marketing/discounts/page"
import { FlashDealsPage } from "@/pages/marketing/flash-deals/page"
import { SponsoredAdsPage } from "@/pages/marketing/sponsored-ads/page"
import { NotFoundPage } from "@/pages/not-found/page"
import { AllOrdersPage } from "@/pages/orders/all/page"
import { ProcessingPage } from "@/pages/orders/processing/page"
import { ReturnsPage } from "@/pages/orders/returns/page"
import { ShippedPage } from "@/pages/orders/shipped/page"
import { BusinessProfilePage } from "@/pages/settings/business-profile/page"
import { PayoutDetailsPage } from "@/pages/settings/payout-details/page"
import { SecurityPage } from "@/pages/settings/security/page"
import { ShippingReturnsPage } from "@/pages/settings/shipping-returns/page"
import { InventoryPage } from "@/pages/store/inventory/page"
import { ProductsPage } from "@/pages/store/products/page"
import { StoreProfilePage } from "@/pages/store/profile/page"
import { ReviewsPage } from "@/pages/store/reviews/page"

const pages: Record<VendorPath, ComponentType> = {
  "/": DashboardPage,
  "/store/profile": StoreProfilePage,
  "/store/products": ProductsPage,
  "/store/inventory": InventoryPage,
  "/store/reviews": ReviewsPage,
  "/orders/all": AllOrdersPage,
  "/orders/processing": ProcessingPage,
  "/orders/shipped": ShippedPage,
  "/orders/returns": ReturnsPage,
  "/marketing/discounts": DiscountsPage,
  "/marketing/coupons": CouponsPage,
  "/marketing/flash-deals": FlashDealsPage,
  "/marketing/sponsored-ads": SponsoredAdsPage,
  "/finance/earnings": EarningsPage,
  "/finance/transactions": TransactionsPage,
  "/finance/withdrawals": WithdrawalsPage,
  "/growth/analytics": AnalyticsPage,
  "/growth/subscription-plans": SubscriptionPlansPage,
  "/settings/business-profile": BusinessProfilePage,
  "/settings/shipping-returns": ShippingReturnsPage,
  "/settings/payout-details": PayoutDetailsPage,
  "/settings/security": SecurityPage,
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
