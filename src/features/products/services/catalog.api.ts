import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { CategoryAttribute, CategoryTreeNode, VendorStore } from "../types"

export async function getMyStore() {
  try {
    const { data } = await api.get<ApiSuccess<VendorStore>>("/stores/me")
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getCategoryTree() {
  try {
    const { data } = await api.get<ApiSuccess<CategoryTreeNode[]>>(
      "/categories/tree",
      { params: { isActive: "true" } }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getCategoryAttributes(categoryId: string) {
  try {
    const { data } = await api.get<ApiSuccess<CategoryAttribute[]>>(
      `/categories/${categoryId}/attributes`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
