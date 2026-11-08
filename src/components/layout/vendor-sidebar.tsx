import { useState } from "react"
import { ChevronRight, ChevronUp, LogOut, X } from "lucide-react"
import { NavLink, useLocation } from "react-router"

import { isNavGroup, NAV, type NavPage } from "@/app/navigation"
import { BrandLogo } from "@/components/shared"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogout } from "@/features/auth/hooks"
import { useAuthStore } from "@/features/auth/store"
import { cn } from "@/lib/utils"

type VendorSidebarProps = {
  collapsed: boolean
  mobileOpen: boolean
  onNavigate: () => void
  onClose: () => void
}

const itemClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none"

const activeClass =
  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"

function PageLink({
  page,
  collapsed,
  nested,
  onNavigate,
}: {
  page: NavPage
  collapsed: boolean
  nested?: boolean
  onNavigate: () => void
}) {
  const Icon = page.icon

  return (
    <NavLink
      to={page.path}
      end={page.path !== "/store/products"}
      title={page.label}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          itemClass,
          nested && "pl-9",
          isActive && activeClass,
          collapsed && !nested && "lg:justify-center lg:px-2"
        )
      }
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className={cn("truncate", collapsed && !nested && "lg:sr-only")}>
        {page.label}
      </span>
    </NavLink>
  )
}

export function VendorSidebar({
  collapsed,
  mobileOpen,
  onNavigate,
  onClose,
}: VendorSidebarProps) {
  const { pathname } = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "Vendor"
  const initial = name.charAt(0).toUpperCase() || "V"
  const [manual, setManual] = useState<{
    path: string
    open: Record<string, boolean>
  } | null>(null)
  const openGroups = manual?.path === pathname ? manual.open : {}

  return (
    <aside
      id="vendor-sidebar"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:translate-x-0",
        collapsed ? "lg:w-[4.75rem]" : "lg:w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-3 border-b border-sidebar-border px-4",
          collapsed && "lg:justify-center lg:px-2"
        )}
      >
        <div className={cn("shrink-0", collapsed && "lg:hidden")}>
          <BrandLogo tone="auto" className="h-7" />
        </div>
        <div className={cn("hidden shrink-0", collapsed && "lg:block")}>
          <BrandLogo tone="auto" variant="mark" className="h-7" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto grid size-8 place-items-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Vendor"
      >
        {NAV.map((entry) => {
          if (!isNavGroup(entry)) {
            return (
              <PageLink
                key={entry.path}
                page={entry}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            )
          }

          const activeChild = entry.children.find(
            (page) =>
              page.path === pathname ||
              (page.path === "/store/products" &&
                pathname.startsWith("/store/products/"))
          )
          const groupActive = Boolean(activeChild)
          const open = openGroups[entry.label] ?? groupActive
          const Icon = entry.icon
          const iconTarget = activeChild?.path ?? entry.children[0].path

          return (
            <div key={entry.label} className="space-y-1">
              <div className={cn("space-y-1", collapsed && "lg:hidden")}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() =>
                    setManual({
                      path: pathname,
                      open: { ...openGroups, [entry.label]: !open },
                    })
                  }
                  className={cn(itemClass, "cursor-pointer")}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 text-sidebar-foreground/50 transition-transform",
                      open && "rotate-90"
                    )}
                    aria-hidden="true"
                  />
                </button>
                {open
                  ? entry.children.map((page) => (
                      <PageLink
                        key={page.path}
                        page={page}
                        collapsed={false}
                        nested
                        onNavigate={onNavigate}
                      />
                    ))
                  : null}
              </div>

              {collapsed ? (
                <NavLink
                  to={iconTarget}
                  end
                  title={entry.label}
                  onClick={onNavigate}
                  className={cn(
                    itemClass,
                    "hidden lg:flex lg:justify-center lg:px-2",
                    groupActive && activeClass
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{entry.label}</span>
                </NavLink>
              ) : null}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none",
                collapsed && "lg:justify-center lg:px-0"
              )}
              aria-label="Open account menu"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
                {initial}
              </span>
              <span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
                <span className="block truncate text-sm font-medium">
                  {name}
                </span>
                <span className="block truncate text-xs text-sidebar-foreground/60">
                  {user?.email ?? "Vendor"}
                </span>
              </span>
              <ChevronUp
                className={cn(
                  "size-4 shrink-0 text-sidebar-foreground/50",
                  collapsed && "lg:hidden"
                )}
                aria-hidden="true"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={collapsed ? "right" : "top"}
            align={collapsed ? "end" : "start"}
            sideOffset={8}
            className="w-56"
          >
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
              </p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                {user?.email ?? "Vendor"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              disabled={logout.isPending}
              onSelect={() => logout.mutate()}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
