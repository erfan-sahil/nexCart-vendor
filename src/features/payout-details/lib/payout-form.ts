import { ApiError } from "@/lib/api/errors"
import type {
  StorePayout,
  UpdateStorePayout,
  VendorStore,
} from "@/features/store/types"

import type { PayoutDetailsFormValues } from "./payout-form-schema"

const PATH_TO_FIELD: Record<string, keyof PayoutDetailsFormValues> = {
  "payout.method": "payoutMethod",
  "payout.accountHolderName": "accountHolderName",
  "payout.bankName": "bankName",
  "payout.branchName": "branchName",
  "payout.routingNumber": "routingNumber",
  "payout.provider": "provider",
  "payout.accountNumber": "accountNumber",
}

export function payoutToFormValues(
  payout: StorePayout | null
): PayoutDetailsFormValues {
  return {
    payoutMethod: payout?.method ?? "",
    accountHolderName: payout?.accountHolderName ?? "",
    bankName: payout?.method === "bank" ? payout.bankName : "",
    branchName: payout?.method === "bank" ? payout.branchName : "",
    routingNumber: payout?.method === "bank" ? payout.routingNumber : "",
    provider: payout?.method === "mobile" ? payout.provider : "",
    accountNumber: payout?.accountNumber ?? "",
  }
}

export function payoutFromStore(store: VendorStore): PayoutDetailsFormValues {
  return payoutToFormValues(store.payout)
}

export function toPayoutUpdatePayload(
  values: PayoutDetailsFormValues
): { payout: UpdateStorePayout } | null {
  if (!values.payoutMethod) {
    return null
  }

  if (values.payoutMethod === "bank") {
    const routingNumber = values.routingNumber.trim()

    return {
      payout: {
        method: "bank",
        accountHolderName: values.accountHolderName.trim(),
        bankName: values.bankName.trim(),
        accountNumber: values.accountNumber.trim(),
        branchName: values.branchName.trim(),
        ...(routingNumber ? { routingNumber } : {}),
      },
    }
  }

  return {
    payout: {
      method: "mobile",
      accountHolderName: values.accountHolderName.trim(),
      provider: values.provider.trim(),
      accountNumber: values.accountNumber.trim(),
    },
  }
}

export function payoutFieldErrors(error: ApiError) {
  const fields: Partial<Record<keyof PayoutDetailsFormValues, string>> = {}
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
