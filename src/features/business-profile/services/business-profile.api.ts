import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { UpdateBusinessRecordsPayload, VendorApplication } from "../types"

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

export async function getMyVendorApplication() {
  try {
    const { data } = await api.get<ApiSuccess<VendorApplication>>(
      "/vendor-applications/me"
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateMyBusinessRecords(
  payload: UpdateBusinessRecordsPayload
) {
  try {
    const { data } = await api.patch<ApiSuccess<VendorApplication>>(
      "/vendor-applications/me/business-records",
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function uploadBusinessDocument(file: File) {
  const body = new FormData()
  body.append("file", file, file.name)

  try {
    const { data } = await api.post<ApiSuccess<{ url: string }>>(
      "/vendor-applications/me/files",
      body,
      asMultipart()
    )
    return data.data.url
  } catch (error) {
    throw toApiError(error)
  }
}
