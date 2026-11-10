import { useRef, useState } from "react"
import { ImagePlus, X } from "@/lib/icons"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess, notifyWarning } from "@/lib/notify"

import { MAX_PRODUCT_IMAGES } from "../constants"
import { PRODUCT_IMAGE_ACCEPT, pickImageFiles } from "../lib/product-images"
import { uploadProductImage } from "../services"

type ProductImageFieldProps = {
  images: string[]
  error?: string
  disabled?: boolean
  required?: boolean
  onChange: (images: string[]) => void
  onPendingChange?: (pending: boolean) => void
}

export function ProductImageField({
  images,
  error,
  disabled = false,
  required = false,
  onChange,
  onPendingChange,
}: ProductImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const message = localError || error
  const busy = disabled || uploading
  const canAdd = images.length < MAX_PRODUCT_IMAGES

  const chooseFile = () => {
    if (!busy && canAdd) {
      inputRef.current?.click()
    }
  }

  const onFiles = async (list: FileList | null) => {
    const files = list ? [...list] : []

    if (inputRef.current) {
      inputRef.current.value = ""
    }

    if (files.length === 0 || busy) {
      return
    }

    const { accepted, problem } = pickImageFiles(files, images.length)

    if (accepted.length === 0) {
      setLocalError(problem)
      return
    }

    setUploading(true)
    onPendingChange?.(true)
    setLocalError(null)

    const uploaded: string[] = []

    try {
      for (const file of accepted) {
        uploaded.push(await uploadProductImage(file))
      }

      onChange([...images, ...uploaded])

      if (uploaded.length === 1) {
        notifySuccess("Image uploaded")
      } else if (uploaded.length > 1) {
        notifySuccess(`${uploaded.length} images uploaded`)
      }

      if (problem) {
        notifyWarning(problem)
      }

      setLocalError(problem)
    } catch (uploadError) {
      if (uploaded.length > 0) {
        onChange([...images, ...uploaded])
        notifySuccess(
          uploaded.length === 1
            ? "Image uploaded"
            : `${uploaded.length} images uploaded`
        )
      }

      const message =
        uploadError instanceof ApiError
          ? uploadError.message
          : "Could not upload this image. Please try again."

      setLocalError(message)
      notifyError(uploadError, message)
    } finally {
      setUploading(false)
      onPendingChange?.(false)
    }
  }

  return (
    <Field data-invalid={Boolean(message) || undefined}>
      <FieldLabel htmlFor="product-images">
        Images{required ? " *" : ""}
      </FieldLabel>
      <input
        ref={inputRef}
        id="product-images"
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        multiple
        className="sr-only"
        required={required}
        aria-required={required}
        disabled={busy || !canAdd}
        onChange={(event) => void onFiles(event.target.files)}
      />
      <div className="flex w-auto flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={image}
            className="relative size-36 overflow-hidden rounded-xl border border-border bg-background"
          >
            <img src={image} alt="" className="size-full object-cover" />
            {index === 0 ? (
              <span className="absolute bottom-1 left-1 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                Thumbnail
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="absolute top-1 right-1 cursor-pointer bg-background"
              aria-label={`Remove image ${index + 1}`}
              disabled={busy}
              onClick={() => {
                setLocalError(null)
                onChange(images.filter((item) => item !== image))
              }}
            >
              <X />
            </Button>
          </div>
        ))}
        {canAdd ? (
          <button
            type="button"
            disabled={busy}
            onClick={chooseFile}
            className="flex size-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background text-xs text-muted-foreground transition-colors hover:border-primary/50 disabled:cursor-not-allowed"
          >
            <ImagePlus className="size-4" />
            {uploading ? "Uploading…" : "Add image"}
          </button>
        ) : null}
      </div>
      <FieldDescription>
        JPEG, PNG, WebP, or GIF. Up to {MAX_PRODUCT_IMAGES} images, 5 MB each.
        The first image is the thumbnail.
      </FieldDescription>
      <FieldError>{message}</FieldError>
    </Field>
  )
}
