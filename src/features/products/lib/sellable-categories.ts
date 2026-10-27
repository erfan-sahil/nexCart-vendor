import type { CategoryTreeNode } from "../types"

export type SellableCategory = {
  id: string
  label: string
}

export function sellableCategories(
  nodes: CategoryTreeNode[],
  storeCategoryIds: string[]
) {
  const allowed = new Set(storeCategoryIds)
  const categories: SellableCategory[] = []

  const walk = (
    items: CategoryTreeNode[],
    inherited: boolean,
    path: string[]
  ) => {
    for (const item of items) {
      const names = [...path, item.name]
      const included = inherited || allowed.has(item.id)

      if (included && item.isActive) {
        categories.push({ id: item.id, label: names.join(" / ") })
      }

      walk(item.children, included, names)
    }
  }

  walk(nodes, false, [])
  return categories
}
