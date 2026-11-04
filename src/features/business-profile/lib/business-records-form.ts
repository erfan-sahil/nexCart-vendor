import { ApiError } from "@/lib/api/errors"

import type { UpdateBusinessRecordsPayload, VendorApplication } from "../types"
import type { BusinessRecordsFormValues } from "./business-records-schema"

const PATH_TO_FIELD: Record<string, keyof BusinessRecordsFormValues> = {
  "tradeLicense.number": "tradeLicenseNumber",
  "tradeLicense.documentUrl": "tradeLicenseDocumentUrl",
  "tax.taxId": "taxId",
  "tax.documentUrl": "taxDocumentUrl",
  "address.line1": "line1",
  "address.line2": "line2",
  "address.city": "city",
  "address.state": "state",
  "address.postalCode": "postalCode",
  "address.country": "country",
}

export function businessRecordsFromApplication(
  application: VendorApplication
): BusinessRecordsFormValues {
  const { business } = application

  return {
    tradeLicenseNumber: business.tradeLicense?.number ?? "",
    tradeLicenseDocumentUrl: business.tradeLicense?.documentUrl ?? "",
    taxId: business.tax?.taxId ?? "",
    taxDocumentUrl: business.tax?.documentUrl ?? "",
    line1: business.address.line1,
    line2: business.address.line2,
    city: business.address.city,
    state: business.address.state,
    postalCode: business.address.postalCode,
    country: business.address.country,
  }
}

export function toBusinessRecordsPayload(
  values: BusinessRecordsFormValues
): UpdateBusinessRecordsPayload {
  return {
    tradeLicense: {
      number: values.tradeLicenseNumber.trim(),
      documentUrl: values.tradeLicenseDocumentUrl.trim(),
    },
    tax: {
      taxId: values.taxId.trim(),
      documentUrl: values.taxDocumentUrl.trim(),
    },
    address: {
      line1: values.line1.trim(),
      line2: values.line2.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
    },
  }
}

export function businessRecordsFieldErrors(error: ApiError) {
  const fields: Partial<Record<keyof BusinessRecordsFormValues, string>> = {}
  let unmapped = false

  for (const field of error.fields ?? []) {
    const name = PATH_TO_FIELD[field.path]

    if (name && !fields[name]) {
      fields[name] = field.message
    } else {
      unmapped = true
    }
  }

  const mapped = Object.keys(fields).length > 0
  const message =
    mapped && !unmapped && error.message === "Validation failed"
      ? null
      : error.message

  return { fields, message }
}
