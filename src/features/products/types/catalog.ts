export type StoreCategory = {
  id: string
  name: string
  slug: string
}

export type VendorStore = {
  categories: StoreCategory[]
}

export type CategoryTreeNode = {
  id: string
  name: string
  isActive: boolean
  children: CategoryTreeNode[]
}

export type AttributeType =
  "text" | "number" | "boolean" | "select" | "multiselect"

export type CategoryAttributeOption = {
  id: string
  label: string
  value: string
  isActive: boolean
}

export type CategoryAttribute = {
  id: string
  isRequired: boolean
  sortOrder: number
  options: CategoryAttributeOption[]
  attribute: {
    id: string
    name: string
    type: AttributeType
    role: "spec" | "variant"
    unit: string
    isActive: boolean
  }
}
