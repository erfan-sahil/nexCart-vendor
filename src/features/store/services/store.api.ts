import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { UpdateStoreRequest, VendorStore } from "../types"

function asMultipart() {
  return {
    headers: { "Content-Type": "multipart/form-data" },
    transformRequest: (payload: unknown, headers: unknown) => {
      if (
        headers &&
        typeof headers === "object" &&
        "delete" in headers &&
        typeof headers.delete === "function"
      ) {
        headers.delete("Content-Type")
      }

      return payload
    },
  }
}

export async function getMyStore() {
  try {
    const { data } = await api.get<ApiSuccess<VendorStore>>("/stores/me")
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateMyStore({
  payload,
  logo,
  banner,
}: UpdateStoreRequest) {
  try {
    if (!logo && !banner) {
      const { data } = await api.patch<ApiSuccess<VendorStore>>(
        "/stores/me",
        payload
      )
      return data.data
    }

    const body = new FormData()
    body.append("payload", JSON.stringify(payload))

    if (logo) {
      body.append("logo", logo, logo.name)
    }

    if (banner) {
      body.append("banner", banner, banner.name)
    }

    const { data } = await api.patch<ApiSuccess<VendorStore>>(
      "/stores/me",
      body,
      asMultipart()
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
