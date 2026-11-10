import { useMemo, useRef, useState } from "react"
import { useWatch, type Control } from "react-hook-form"
import {
  ImageOff,
  ImagePlus,
  LoaderCircle,
  MoreHorizontal,
  Star,
  Trash2,
} from "@/lib/icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { resolveAssetUrl } from "@/lib/api/assets"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess, notifyWarning } from "@/lib/notify"

import { MAX_PRODUCT_IMAGES } from "../constants"
import {
  useAddProductImages,
  useRemoveProductImage,
  useSetProductThumbnail,
} from "../hooks"
import {
  PRODUCT_IMAGE_ACCEPT,
  orderedImages,
  pickImageFiles,
} from "../lib/product-images"
import type { ProductFormValues } from "../lib/product-form-schema"
import type { Product, ProductImage } from "../types"

type ProductImageManagerProps = {
  product: Product
  control: Control<ProductFormValues>
  disabled?: boolean
  onPendingChange?: (pending: boolean) => void
  onRemoved?: (imageId: string) => void
}

export function ProductImageManager({
  product,
  control,
  disabled = false,
  onPendingChange,
  onRemoved,
}: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const offers = useWatch({ control, name: "offers" })
  const usage = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const offer of offers) {
      if (offer.image) {
        counts[offer.image] = (counts[offer.image] ?? 0) + 1
      }
    }

    return counts
  }, [offers])
  const addImages = useAddProductImages(product.id)
  const removeImage = useRemoveProductImage(product.id)
  const setThumbnail = useSetProductThumbnail(product.id)
  const [error, setError] = useState<string | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<ProductImage | null>(
    null
  )
  const images = orderedImages(product)
  const thumbnailId = product.thumbnail?.id ?? images[0]?.id
  const busy =
    disabled ||
    addImages.isPending ||
    removeImage.isPending ||
    setThumbnail.isPending
  const canAdd = images.length < MAX_PRODUCT_IMAGES

  const track = async <T,>(work: () => Promise<T>) => {
    setError(null)
    onPendingChange?.(true)

    try {
      return await work()
    } finally {
      onPendingChange?.(false)
    }
  }

  const fail = (caught: unknown, fallback: string) => {
    const message = caught instanceof ApiError ? caught.message : fallback
    setError(message)
    notifyError(caught, message)
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
      setError(problem)
      return
    }

    try {
      await track(() => addImages.mutateAsync(accepted))
      notifySuccess(
        accepted.length === 1
          ? "Image added"
          : `${accepted.length} images added`
      )

      if (problem) {
        setError(problem)
        notifyWarning(problem)
      }
    } catch (caught) {
      fail(caught, "Could not upload these images. Please try again.")
    }
  }

  const makeThumbnail = async (image: ProductImage) => {
    try {
      await track(() => setThumbnail.mutateAsync(image.id))
      notifySuccess("Thumbnail updated")
    } catch (caught) {
      fail(caught, "Could not update the thumbnail. Please try again.")
    }
  }

  const confirmRemoval = async () => {
    if (!pendingRemoval) {
      return
    }

    const imageId = pendingRemoval.id

    try {
      await track(() => removeImage.mutateAsync(imageId))
      onRemoved?.(imageId)
      setPendingRemoval(null)
      notifySuccess("Image removed")
    } catch (caught) {
      setPendingRemoval(null)
      fail(caught, "Could not remove this image. Please try again.")
    }
  }

  return (
    <FieldSet className="gap-2 sm:col-span-2" data-invalid={Boolean(error)}>
      <FieldLegend variant="label" className="mb-0">
        Images
      </FieldLegend>
      <input
        ref={inputRef}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        disabled={busy || !canAdd}
        onChange={(event) => void onFiles(event.target.files)}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {images.map((image, index) => (
          <ManagedImage
            key={image.id}
            image={image}
            position={index + 1}
            isThumbnail={image.id === thumbnailId}
            usedBy={usage[image.id] ?? 0}
            canRemove={images.length > 1}
            disabled={busy}
            onMakeThumbnail={() => void makeThumbnail(image)}
            onRemove={() => setPendingRemoval(image)}
          />
        ))}
        {canAdd ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground transition-colors outline-none hover:border-primary/50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addImages.isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="size-4" aria-hidden />
            )}
            {addImages.isPending ? "Uploading…" : "Add image"}
          </button>
        ) : null}
      </div>
      <FieldDescription>
        JPEG, PNG, WebP, or GIF. Up to {MAX_PRODUCT_IMAGES} images, 5 MB each.
        Changes to images are saved right away.
      </FieldDescription>
      {error ? <FieldError>{error}</FieldError> : null}

      <RemoveImageDialog
        image={pendingRemoval}
        usedBy={pendingRemoval ? (usage[pendingRemoval.id] ?? 0) : 0}
        pending={removeImage.isPending}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => void confirmRemoval()}
      />
    </FieldSet>
  )
}

function ManagedImage({
  image,
  position,
  isThumbnail,
  usedBy,
  canRemove,
  disabled,
  onMakeThumbnail,
  onRemove,
}: {
  image: ProductImage
  position: number
  isThumbnail: boolean
  usedBy: number
  canRemove: boolean
  disabled: boolean
  onMakeThumbnail: () => void
  onRemove: () => void
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/40">
      <ImagePreview url={image.url} />

      <div className="absolute inset-x-1.5 top-1.5 flex items-start justify-between gap-1">
        {isThumbnail ? (
          <Badge className="shadow-sm">
            <Star data-icon="inline-start" weight="bold" />
            Thumbnail
          </Badge>
        ) : (
          <span />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              className="cursor-pointer bg-background/90 shadow-sm backdrop-blur"
              aria-label={`Actions for image ${position}`}
              disabled={disabled}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              disabled={isThumbnail}
              onSelect={onMakeThumbnail}
            >
              <Star />
              Set as thumbnail
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              disabled={!canRemove}
              onSelect={onRemove}
            >
              <Trash2 />
              Remove image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {usedBy > 0 ? (
        <Badge
          variant="secondary"
          className="absolute bottom-1.5 left-1.5 shadow-sm"
        >
          {usedBy === 1 ? "1 variant" : `${usedBy} variants`}
        </Badge>
      ) : null}
    </div>
  )
}

function RemoveImageDialog({
  image,
  usedBy,
  pending,
  onCancel,
  onConfirm,
}: {
  image: ProductImage | null
  usedBy: number
  pending: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={image !== null}
      onOpenChange={(open) => {
        if (!open && !pending) {
          onCancel()
        }
      }}
    >
      <DialogContent shell className="sm:max-w-md" showCloseButton={!pending}>
        <DialogHeader variant="destructive" className="py-5">
          <DialogTitle>Remove this image?</DialogTitle>
          <DialogDescription className="text-foreground/70">
            It is deleted from the product right away and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody scroll={false} className="flex items-center gap-4">
          {image ? (
            <span className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40">
              <ImagePreview url={image.url} />
            </span>
          ) : null}
          <p className="text-sm text-muted-foreground">
            {usedBy > 0
              ? `${usedBy === 1 ? "1 variant uses" : `${usedBy} variants use`} this image. ${usedBy === 1 ? "It" : "They"} will show no image until you pick another one.`
              : "No variant uses this image."}
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={pending}
            onClick={onCancel}
          >
            Keep image
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
            {pending ? "Removing…" : "Remove image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImagePreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="flex size-full items-center justify-center text-muted-foreground">
        <ImageOff className="size-5" aria-hidden />
      </span>
    )
  }

  return (
    <img
      src={resolveAssetUrl(url)}
      alt=""
      className="size-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}
