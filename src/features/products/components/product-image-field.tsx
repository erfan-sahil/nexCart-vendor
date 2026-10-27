import { useEffect, useId, useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import {
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_TYPES,
} from "../constants"

const IMAGE_TYPES: readonly string[] = PRODUCT_IMAGE_TYPES

export type ProductImageDraft = {
  id: string
  file: File
  preview: string
}

type ProductImageFieldProps = {
  images: ProductImageDraft[]
  error?: string
  disabled?: boolean
  onChange: (images: ProductImageDraft[]) => void
}

export function ProductImageField({
  images,
  error,
  disabled = false,
  onChange,
}: ProductImageFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef(images)
  const [localError, setLocalError] = useState<string | null>(null)
  const message = localError || error

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) {
        URL.revokeObjectURL(image.preview)
      }
    }
  }, [])

  const addFiles = (list: FileList | null) => {
    if (inputRef.current) {
      inputRef.current.value = ""
    }

    if (!list || disabled) {
      return
    }

    const remaining = MAX_PRODUCT_IMAGES - images.length
    const next = [...images]
    let problem: string | null = null

    for (const file of list) {
      if (next.length >= MAX_PRODUCT_IMAGES) {
        problem = `A product can have at most ${MAX_PRODUCT_IMAGES} images.`
        break
      }

      if (!IMAGE_TYPES.includes(file.type)) {
        problem = "Upload JPEG, PNG, WebP, or GIF images."
        continue
      }

      if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
        problem = "Each image must be 5 MB or smaller."
        continue
      }

      next.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      })
    }

    if (remaining < 1) {
      problem = `A product can have at most ${MAX_PRODUCT_IMAGES} images.`
    }

    setLocalError(problem)
    if (next.length !== images.length) {
      onChange(next)
    }
  }

  const removeImage = (id: string) => {
    const image = images.find((item) => item.id === id)

    if (image) {
      URL.revokeObjectURL(image.preview)
    }

    setLocalError(null)
    onChange(images.filter((item) => item.id !== id))
  }

  return (
    <Field data-invalid={Boolean(message) || undefined}>
      <FieldLabel htmlFor={inputId}>Images</FieldLabel>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        multiple
        className="sr-only"
        disabled={disabled || images.length >= MAX_PRODUCT_IMAGES}
        onChange={(event) => addFiles(event.target.files)}
      />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative overflow-hidden rounded-xl border border-border bg-background"
          >
            <img
              src={image.preview}
              alt=""
              className="aspect-square w-full object-cover"
            />
            {index === 0 ? (
              <span className="absolute bottom-1 left-1 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                Thumbnail
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="absolute top-1 right-1 bg-background"
              aria-label={`Remove image ${index + 1}`}
              disabled={disabled}
              onClick={() => removeImage(image.id)}
            >
              <X />
            </Button>
          </div>
        ))}
        {images.length < MAX_PRODUCT_IMAGES ? (
          <button
            type="button"
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background text-xs text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            Add
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
