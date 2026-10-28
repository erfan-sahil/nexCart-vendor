import type { StoreCategory } from "../types"

type CategoryNode = {
  id: string
  name: string
  isActive: boolean
  children: CategoryNode[]
}

export type StoreCategoryOption = {
  id: string
  label: string
}

export function storeCategoryOptions(
  nodes: CategoryNode[],
  selected: StoreCategory[]
) {
  const options: StoreCategoryOption[] = []

  const walk = (items: CategoryNode[], path: string[]) => {
    for (const item of items) {
      const names = [...path, item.name]

      if (item.isActive) {
        options.push({ id: item.id, label: names.join(" / ") })
      }

      walk(item.children, names)
    }
  }

  walk(nodes, [])

  const listed = new Set(options.map((option) => option.id))

  for (const category of selected) {
    if (!listed.has(category.id)) {
      options.push({ id: category.id, label: category.name })
    }
  }

  return options
}
