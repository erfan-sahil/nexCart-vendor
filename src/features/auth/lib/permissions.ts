import type { UserRole } from "../types"

export function canManageVariants(role: UserRole | undefined) {
  return role === "vendor"
}
