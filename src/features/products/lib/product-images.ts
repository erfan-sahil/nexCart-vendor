import { resolveAssetUrl } from "@/lib/api/assets"

import {
  MAX_PRODUCT_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_TYPES,
} from "../constants"
import type { Product } from "../types"

const IMAGE_TYPES: readonly string[] = PRODUCT_IMAGE_TYPES

export const PRODUCT_IMAGE_ACCEPT = IMAGE_TYPES.join(",")

/** An image a variant can point at. `ref` is what the variant draft stores. */
export type VariantImageChoice = {
  ref: string
  url: string
  label: string
}

/**
 * Keeps the files that fit the remaining slots and pass type/size checks.
 * `problem` describes the first file that was skipped, if any.
 */
export function pickImageFiles(files: File[], current: number) {
  const remaining = MAX_PRODUCT_IMAGES - current
  const limitMessage = `A product can have at most ${MAX_PRODUCT_IMAGES} images.`

  if (remaining < 1) {
    return { accepted: [] as File[], problem: limitMessage }
  }

  const accepted: File[] = []
  let problem: string | null = null

  for (const file of files) {
    if (accepted.length >= remaining) {
      problem = limitMessage
      break
    }

    if (!IMAGE_TYPES.includes(file.type)) {
      problem = "Upload a JPEG, PNG, WebP, or GIF image."
      continue
    }

    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      problem = "Image must be 5 MB or smaller."
      continue
    }

    accepted.push(file)
  }

  return { accepted, problem }
}

export function choicesFromUploads(urls: string[]): VariantImageChoice[] {
  return urls.map((url, index) => ({
    ref: url,
    url,
    label: `Image ${index + 1}`,
  }))
}

export function orderedImages(product: Product) {
  return product.images
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
}

export function choicesFromProduct(product: Product): VariantImageChoice[] {
  return orderedImages(product).map((image, index) => ({
    ref: image.id,
    url: resolveAssetUrl(image.url),
    label: image.alt || `Image ${index + 1}`,
  }))
}

/**
 * Maps the upload URLs sent on create to the image ids the API assigned.
 * The API stores uploads in the order they were sent.
 */
export function imageIdsByUpload(uploads: string[], created: Product) {
  const ordered = orderedImages(created)

  return new Map(
    uploads.flatMap((url, index) => {
      const id = ordered[index]?.id
      return id ? [[url, id] as const] : []
    })
  )
}
