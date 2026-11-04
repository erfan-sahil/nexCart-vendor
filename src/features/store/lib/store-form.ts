import { ApiError } from "@/lib/api/errors"

import type { StoreProfileFormValues } from "./store-form-schema"
import type { UpdateStorePayload, VendorStore } from "../types"

const PATH_TO_FIELD: Record<string, keyof StoreProfileFormValues> = {
  name: "name",
  slug: "slug",
  description: "description",
  "contact.email": "email",
  "contact.phone": "phone",
  "address.line1": "line1",
  "address.line2": "line2",
  "address.city": "city",
  "address.state": "state",
  "address.postalCode": "postalCode",
  "address.country": "country",
  categoryIds: "categoryIds",
  returnPolicy: "returnPolicy",
  shippingPolicy: "shippingPolicy",
  isActive: "isActive",
}

export function toFormValues(store: VendorStore): StoreProfileFormValues {
  return {
    name: store.name,
    slug: store.slug,
    description: store.description,
    email: store.contact.email,
    phone: store.contact.phone,
    line1: store.address.line1,
    line2: store.address.line2,
    city: store.address.city,
    state: store.address.state,
    postalCode: store.address.postalCode,
    country: store.address.country,
    categoryIds: store.categories.map((category) => category.id),
    returnPolicy: store.returnPolicy,
    shippingPolicy: store.shippingPolicy,
    isActive: store.isActive,
  }
}

export function toUpdatePayload(
  values: StoreProfileFormValues,
  options: {
    clearLogo: boolean
    clearBanner: boolean
  }
): UpdateStorePayload {
  const payload: UpdateStorePayload = {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    contact: {
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
    },
    address: {
      line1: values.line1.trim(),
      line2: values.line2.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
    },
    categoryIds: values.categoryIds,
    returnPolicy: values.returnPolicy.trim(),
    shippingPolicy: values.shippingPolicy.trim(),
    isActive: values.isActive,
  }

  if (options.clearLogo) {
    payload.logo = ""
  }

  if (options.clearBanner) {
    payload.banner = ""
  }

  return payload
}

export function storeFieldErrors(error: ApiError) {
  const fields: Partial<Record<keyof StoreProfileFormValues, string>> = {}
  const media: { logo?: string; banner?: string } = {}
  let unmapped = false

  for (const field of error.fields ?? []) {
    if (field.path === "logo" || field.path.startsWith("logo.")) {
      media.logo ??= field.message
      continue
    }

    if (field.path === "banner" || field.path.startsWith("banner.")) {
      media.banner ??= field.message
      continue
    }

    const name = field.path.startsWith("categoryIds")
      ? "categoryIds"
      : PATH_TO_FIELD[field.path]

    if (name && !fields[name]) {
      fields[name] = field.message
    } else {
      unmapped = true
    }
  }

  const mapped = Object.keys(fields).length + Object.keys(media).length > 0
  const message =
    mapped && !unmapped && error.message === "Validation failed"
      ? null
      : error.message

  return { fields, media, message }
}
