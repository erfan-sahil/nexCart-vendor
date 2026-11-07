import { useRef, useState } from "react"
import { FileText, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess } from "@/lib/notify"
import { resolveAssetUrl } from "@/lib/api/assets"

import { uploadBusinessDocument } from "../services"

const FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]

function isImageUrl(value: string) {
  return /\.(jpe?g|png|webp|gif)(\?.*)?$/i.test(value)
}

function fileName(value: string) {
  try {
    const name = new URL(value).pathname.split("/").pop()
    return name || "Uploaded file"
  } catch {
    return "Uploaded file"
  }
}

type BusinessDocumentFieldProps = {
  id: string
  label: string
  value: string
  disabled?: boolean
  error?: string
  onChange: (value: string) => void
}

export function BusinessDocumentField({
  id,
  label,
  value,
  disabled = false,
  error,
  onChange,
}: BusinessDocumentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const message = localError || error
  const href = value ? resolveAssetUrl(value) : ""

  const onFile = async (list: FileList | null) => {
    const file = list?.[0]
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    if (!file || uploading || disabled) {
      return
    }

    if (!FILE_TYPES.includes(file.type)) {
      setLocalError("Upload a PDF, JPEG, PNG, WebP, or GIF file.")
      return
    }

    setUploading(true)
    setLocalError(null)

    try {
      onChange(await uploadBusinessDocument(file))
      notifySuccess("Document uploaded")
    } catch (uploadError) {
      const message =
        uploadError instanceof ApiError
          ? uploadError.message
          : "Could not upload that file. Try again."

      setLocalError(message)
      notifyError(uploadError, message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Field data-invalid={message ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={FILE_TYPES.join(",")}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => {
          void onFile(event.target.files)
        }}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
          {isImageUrl(value) ? (
            <img
              src={href}
              alt=""
              className="size-12 rounded-md object-cover"
            />
          ) : (
            <span className="inline-flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <FileText className="size-4" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fileName(value)}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View
              </a>
              {!disabled ? (
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? "Uploading…" : "Replace"}
                </button>
              ) : null}
            </div>
          </div>
          {!disabled ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              disabled={uploading}
              onClick={() => {
                setLocalError(null)
                onChange("")
              }}
            >
              <X />
              <span className="sr-only">Remove file</span>
            </Button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FileText className="size-4" aria-hidden="true" />
          {uploading ? "Uploading…" : "Upload PDF or image"}
        </button>
      )}

      {!message ? (
        <FieldDescription>Optional. PDF or image, up to 5 MB.</FieldDescription>
      ) : null}
      <FieldError>{message}</FieldError>
    </Field>
  )
}
