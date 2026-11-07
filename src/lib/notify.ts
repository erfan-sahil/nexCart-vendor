import { toast } from "sonner"

import { ApiError } from "@/lib/api/errors"

export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

export function notifySuccess(message: string) {
  toast.success(message)
}

export function notifyError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  toast.error(errorMessage(error, fallback))
}

export function notifyWarning(message: string) {
  toast.warning(message)
}
