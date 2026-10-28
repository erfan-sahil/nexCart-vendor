import { useEffect, useMemo, useRef, useState } from "react"
import { ImagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { resolveAssetUrl } from "@/lib/api/assets"

import { MAX_STORE_IMAGE_BYTES, STORE_IMAGE_TYPES } from "../constants"

const IMAGE_TYPES: readonly string[] = STORE_IMAGE_TYPES

type StoreMediaFieldProps = {
  id: string
  label: string
  description: string
  currentUrl: string
  file: File | null
  removed: boolean
  error?: string
  disabled?: boolean
  shape: "logo" | "banner"
  onFile: (file: File | null) => void
  onRemove: () => void
}

export function StoreMediaField({
  id,
  label,
  description,
  currentUrl,
  file,
  removed,
  error,
  disabled = false,
  shape,
  onFile,
  onRemove,
}: StoreMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  )
  const message = localError || error
  const src =
    previewUrl || (removed ? "" : currentUrl ? resolveAssetUrl(currentUrl) : "")

  useEffect(() => {
    if (!previewUrl) {
      return undefined
    }

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const chooseFile = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const onSelected = (list: FileList | null) => {
    const next = list?.[0] ?? null

    if (inputRef.current) {
      inputRef.current.value = ""
    }

    if (!next) {
      return
    }

    if (!IMAGE_TYPES.includes(next.type)) {
      setLocalError("Upload a JPEG, PNG, WebP, or GIF image.")
      return
    }

    if (next.size > MAX_STORE_IMAGE_BYTES) {
      setLocalError("Image must be 5 MB or smaller.")
      return
    }

    setLocalError(null)
    onFile(next)
  }

  return (
    <Field data-invalid={message ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => onSelected(event.target.files)}
      />
      <div
        className={
          shape === "logo" ? "flex items-end gap-3" : "flex flex-col gap-3"
        }
      >
        <div
          className={
            shape === "logo"
              ? "size-28 overflow-hidden rounded-xl border border-border bg-muted"
              : "h-36 overflow-hidden rounded-xl border border-border bg-muted sm:h-44"
          }
        >
          {src ? (
            <img src={src} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
              No {label.toLowerCase()} yet
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={chooseFile}
          >
            <ImagePlus />
            {src ? "Replace" : "Upload"}
          </Button>
          {src ? (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                setLocalError(null)

                if (file) {
                  onFile(null)
                  return
                }

                onRemove()
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      <FieldDescription>{description}</FieldDescription>
      <FieldError>{message}</FieldError>
    </Field>
  )
}
