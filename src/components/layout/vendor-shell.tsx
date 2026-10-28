import { useEffect, useState } from "react"
import { Outlet } from "react-router"

import { VendorHeader } from "./vendor-header"
import { VendorSidebar } from "./vendor-sidebar"

export function VendorShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileOpen])

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <VendorSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <VendorHeader
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onOpenMobile={() => setMobileOpen(true)}
          onToggleCollapsed={() => setCollapsed((current) => !current)}
        />
        <main className="flex-1 px-4 py-5 sm:px-5 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
