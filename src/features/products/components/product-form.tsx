import { useMemo, useState, type FormEvent } from "react"
import type { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { canManageVariants } from "@/features/auth/lib/permissions"
import { useAuthStore } from "@/features/auth/store"
import { ApiError } from "@/lib/api/errors"

import { PRODUCT_STATUS_LABEL, PRODUCT_STATUSES } from "../constants"
import {
  useCategoryAttributes,
  useCategoryTree,
  useCreateProductWithOffer,
  useUpdateProduct,
  useVendorStore,
} from "../hooks"
import {
  buildOfferPayloads,
  emptyOffer,
  type OfferDraft,
  type OfferFieldErrors,
  type OfferMode,
} from "../lib/create-offer"
import {
  EMPTY_PRODUCT_FORM,
  buildAttributeInputs,
  createProductFormSchema,
  draftsFromAttributes,
  formFromProduct,
  toCreatePayload,
  toUpdatePayload,
  variantAssignments,
  type AttributeDraft,
  type CreateProductFormValues,
  type ProductAttributeInput,
} from "../lib/create-product"
import type { Product } from "../types"
import { sellableCategories } from "../lib/sellable-categories"
import { createVariant } from "../services"

import { ProductAttributeFields } from "./product-attribute-fields"
import { ProductImageField } from "./product-image-field"
import { ProductOfferFields } from "./product-offer-fields"

const selectContentClass =
  "pointer-events-auto z-[70] w-(--radix-select-trigger-width)"

type ProductField =
  | "name"
  | "slug"
  | "shortDescription"
  | "description"
  | "categoryId"
  | "tags"
  | "status"
  | "images"

type FieldErrors = Partial<Record<ProductField, string>>

const PRODUCT_FIELDS = new Set<ProductField>([
  "name",
  "slug",
  "shortDescription",
  "description",
  "categoryId",
  "tags",
  "status",
  "images",
])

function isProductField(value: string): value is ProductField {
  return PRODUCT_FIELDS.has(value as ProductField)
}

function toFieldErrors(error: ZodError): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path[0]

    if (typeof key === "string" && isProductField(key) && !errors[key]) {
      errors[key] = issue.message
    }
  }

  return errors
}

function zodFormMessage(error: ZodError) {
  const messages = [
    ...new Set(
      error.issues
        .map((issue) => issue.message)
        .filter((message) => message.length > 0)
    ),
  ]

  return messages.join("\n") || "Check the highlighted fields and try again."
}

function errorsFromApi(error: ApiError, attributes: ProductAttributeInput[]) {
  const fields: FieldErrors = {}
  const attributeErrors: Record<string, string> = {}
  let hasUnmapped = false

  for (const field of error.fields ?? []) {
    const [root, index] = field.path.split(".")

    if (root === "attributes") {
      const attribute = attributes[Number(index)]

      if (attribute && !attributeErrors[attribute.attributeId]) {
        attributeErrors[attribute.attributeId] = field.message
      } else {
        hasUnmapped = true
      }
      continue
    }

    if (root && isProductField(root) && !fields[root]) {
      fields[root] = field.message
    } else {
      hasUnmapped = true
    }
  }

  const message =
    Object.keys(fields).length + Object.keys(attributeErrors).length > 0 &&
    !hasUnmapped &&
    error.message === "Validation failed"
      ? null
      : error.message

  return { fields, attributeErrors, message }
}

type ProductFormProps = {
  product?: Product | null
  onCancel: () => void
  onSaved: () => void
}

export function ProductForm({
  product = null,
  onCancel,
  onSaved,
}: ProductFormProps) {
  const editing = product !== null
  const role = useAuthStore((state) => state.user?.role)
  const canSell = canManageVariants(role)
  const createProduct = useCreateProductWithOffer()
  const updateProduct = useUpdateProduct()
  const store = useVendorStore(true)
  const tree = useCategoryTree(true)
  const [form, setForm] = useState<CreateProductFormValues>(() =>
    product ? formFromProduct(product) : EMPTY_PRODUCT_FORM
  )
  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, AttributeDraft>>(() =>
    product ? draftsFromAttributes(product.attributes) : {}
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [attributeErrors, setAttributeErrors] = useState<
    Record<string, string>
  >({})
  const [formError, setFormError] = useState<string | null>(null)
  const [offerMode, setOfferMode] = useState<OfferMode>("single")
  const [offers, setOffers] = useState<OfferDraft[]>(() => [emptyOffer()])
  const [offerErrors, setOfferErrors] = useState<
    Record<string, OfferFieldErrors>
  >({})
  const [savedWithoutApproval, setSavedWithoutApproval] = useState(false)
  const attributes = useCategoryAttributes(form.categoryId)
  const variantAxes = useMemo(
    () => variantAssignments(attributes.data ?? []),
    [attributes.data]
  )
  const saving = createProduct.isPending || updateProduct.isPending
  const busy = saving || uploadingImage
  const categories = useMemo(
    () =>
      sellableCategories(
        tree.data ?? [],
        (store.data?.categories ?? []).map((category) => category.id)
      ),
    [store.data?.categories, tree.data]
  )
  const specsReady = !form.categoryId || attributes.isSuccess
  const categoryMessage = store.isError
    ? "Store categories could not be loaded."
    : tree.isError
      ? "Categories could not be loaded."
      : store.isSuccess && store.data.categories.length === 0
        ? "Choose store categories before adding products."
        : store.isSuccess &&
            tree.isSuccess &&
            categories.length === 0 &&
            !store.isLoading
          ? "No active categories are available for this store."
          : null

  const setField =
    <K extends keyof CreateProductFormValues>(key: K) =>
    (value: CreateProductFormValues[K]) => {
      setForm((current) => ({ ...current, [key]: value }))

      if (key === "categoryId") {
        setDrafts({})
        setAttributeErrors({})
        setOfferErrors({})
        setOfferMode("single")
      }

      if (isProductField(key)) {
        setErrors((current) => {
          if (!current[key]) {
            return current
          }

          const next = { ...current }
          delete next[key]
          return next
        })
      }
    }

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()

    if (uploadingImage || savedWithoutApproval) {
      return
    }

    setFormError(null)

    const parsed = createProductFormSchema.safeParse(form)
    const nextErrors = parsed.success ? {} : toFieldErrors(parsed.error)
    const imageError =
      editing || images.length > 0 ? undefined : "Choose at least one image."

    if (imageError) {
      nextErrors.images = imageError
    }

    if (!attributes.isSuccess && form.categoryId) {
      setErrors(nextErrors)
      setFormError(
        attributes.isError
          ? "Category details could not be loaded."
          : "Category details are still loading."
      )
      return
    }

    const built = buildAttributeInputs(attributes.data ?? [], drafts)
    const sellingOnEdit =
      offerMode === "variants" ||
      offers.some(
        (offer) => offer.sku.trim() !== "" || offer.price.trim() !== ""
      )
    const offer =
      !parsed.success || !canSell || (editing && !sellingOnEdit)
        ? null
        : buildOfferPayloads(offerMode, offers, attributes.data ?? [])

    if (
      !parsed.success ||
      imageError ||
      Object.keys(built.errors).length > 0 ||
      (offer && offer.message)
    ) {
      setErrors(nextErrors)
      setAttributeErrors(built.errors)
      setOfferErrors(offer?.errors ?? {})
      setFormError(
        !parsed.success
          ? zodFormMessage(parsed.error)
          : imageError ||
              offer?.message ||
              "Check the highlighted fields and try again."
      )
      return
    }

    if (!editing && !canSell) {
      setFormError(
        "Price and stock are saved as variants. This account does not have permission to create variants."
      )
      return
    }

    setErrors({})
    setAttributeErrors({})
    setOfferErrors({})

    try {
      if (editing && product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          payload: toUpdatePayload(parsed.data, built.inputs),
        })

        if (offer) {
          for (const variant of offer.payloads) {
            await createVariant(product.id, variant)
          }
        }

        onSaved()
        return
      }

      if (!offer) {
        return
      }

      const result = await createProduct.mutateAsync({
        product: toCreatePayload(parsed.data, built.inputs, images),
        variants: offer.payloads,
        submitForApproval: parsed.data.status === "active",
      })
      if (result.approvalWarning) {
        setSavedWithoutApproval(true)
        setFormError(result.approvalWarning)
        return
      }

      onSaved()
    } catch (error) {
      if (error instanceof ApiError) {
        const next = errorsFromApi(error, built.inputs)
        setErrors(next.fields)
        setAttributeErrors(next.attributeErrors)
        setFormError(next.message)
        return
      }

      setFormError(
        editing
          ? "Could not update this product. Please try again."
          : "Could not create this product. Please try again."
      )
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-4"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm whitespace-pre-line text-destructive"
        >
          {formError}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="grid gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6">
          <div
            className={
              editing
                ? "contents"
                : "grid items-start gap-6 sm:col-span-2 md:grid-cols-[22rem_minmax(0,1fr)]"
            }
          >
            {editing ? null : (
              <ProductImageField
                images={images}
                error={errors.images}
                disabled={saving}
                onPendingChange={setUploadingImage}
                onChange={(next) => {
                  setImages(next)
                  setErrors((current) => {
                    if (!current.images) {
                      return current
                    }

                    const cleared = { ...current }
                    delete cleared.images
                    return cleared
                  })
                }}
              />
            )}

            <div className={editing ? "contents" : "grid gap-4 sm:grid-cols-2"}>
              <Field data-invalid={Boolean(errors.name) || undefined}>
                <FieldLabel htmlFor="product-name">Name</FieldLabel>
                <Input
                  id="product-name"
                  className="h-9"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  disabled={busy}
                  autoFocus
                  onChange={(event) => setField("name")(event.target.value)}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.slug) || undefined}>
                <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
                <Input
                  id="product-slug"
                  className="h-9"
                  value={form.slug}
                  placeholder="linen-shirt"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.slug)}
                  disabled={busy}
                  onChange={(event) => setField("slug")(event.target.value)}
                />
                <FieldDescription>
                  Leave blank to generate one from the name.
                </FieldDescription>
                <FieldError>{errors.slug}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.categoryId) || undefined}>
                <FieldLabel htmlFor="product-category">Category</FieldLabel>
                <Select
                  value={form.categoryId || undefined}
                  disabled={
                    busy ||
                    store.isLoading ||
                    tree.isLoading ||
                    categories.length === 0
                  }
                  onValueChange={(value) => setField("categoryId")(value)}
                >
                  <SelectTrigger
                    id="product-category"
                    className="h-9! w-full cursor-pointer"
                    aria-invalid={Boolean(errors.categoryId)}
                  >
                    <SelectValue
                      placeholder={
                        store.isLoading || tree.isLoading
                          ? "Loading categories…"
                          : "Choose a category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    collisionPadding={16}
                    className={selectContentClass}
                  >
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="cursor-pointer"
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {categoryMessage ??
                    "Only categories this store sells can be used."}
                </FieldDescription>
                <FieldError>{errors.categoryId}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.status) || undefined}>
                <FieldLabel htmlFor="product-status">Status</FieldLabel>
                <Select
                  value={form.status}
                  disabled={busy}
                  onValueChange={(value) => {
                    if (
                      (PRODUCT_STATUSES as readonly string[]).includes(value)
                    ) {
                      setField("status")(
                        value as CreateProductFormValues["status"]
                      )
                    }
                  }}
                >
                  <SelectTrigger
                    id="product-status"
                    className="h-9! w-full cursor-pointer"
                    aria-invalid={Boolean(errors.status)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    collisionPadding={16}
                    className={selectContentClass}
                  >
                    {PRODUCT_STATUSES.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="cursor-pointer"
                      >
                        {PRODUCT_STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Archived products stay out of the storefront.
                </FieldDescription>
                <FieldError>{errors.status}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.tags) || undefined}>
                <FieldLabel htmlFor="product-tags">Tags</FieldLabel>
                <Input
                  id="product-tags"
                  className="h-9"
                  value={form.tags}
                  placeholder="linen, summer, shirt"
                  aria-invalid={Boolean(errors.tags)}
                  disabled={busy}
                  onChange={(event) => setField("tags")(event.target.value)}
                />
                <FieldDescription>Separate tags with commas.</FieldDescription>
                <FieldError>{errors.tags}</FieldError>
              </Field>
            </div>
          </div>

          {form.categoryId && attributes.isLoading ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Loading category details…
            </p>
          ) : null}
          {form.categoryId && attributes.isError ? (
            <p className="text-sm text-destructive sm:col-span-2" role="alert">
              Category details could not be loaded.
            </p>
          ) : null}
          {attributes.data ? (
            <ProductAttributeFields
              assignments={attributes.data}
              drafts={drafts}
              errors={attributeErrors}
              disabled={busy}
              onChange={(attributeId, draft) => {
                setDrafts((current) => ({
                  ...current,
                  [attributeId]: draft,
                }))
                setAttributeErrors((current) => {
                  if (!current[attributeId]) {
                    return current
                  }

                  const next = { ...current }
                  delete next[attributeId]
                  return next
                })
              }}
            />
          ) : null}

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(errors.shortDescription) || undefined}
          >
            <FieldLabel htmlFor="product-short-description">
              Short description
            </FieldLabel>
            <Textarea
              id="product-short-description"
              value={form.shortDescription}
              aria-invalid={Boolean(errors.shortDescription)}
              disabled={busy}
              onChange={(event) =>
                setField("shortDescription")(event.target.value)
              }
            />
            <FieldError>{errors.shortDescription}</FieldError>
          </Field>

          <Field
            className="sm:col-span-2"
            data-invalid={Boolean(errors.description) || undefined}
          >
            <FieldLabel htmlFor="product-description">Description</FieldLabel>
            <Textarea
              id="product-description"
              value={form.description}
              aria-invalid={Boolean(errors.description)}
              disabled={busy}
              onChange={(event) => setField("description")(event.target.value)}
            />
            <FieldError>{errors.description}</FieldError>
          </Field>

          {!canSell ? null : (
            <div className="sm:col-span-2">
              <ProductOfferFields
                mode={offerMode}
                offers={offers}
                assignments={attributes.data ?? []}
                errors={offerErrors}
                disabled={busy || savedWithoutApproval}
                canUseVariants={variantAxes.length > 0}
                onModeChange={(mode) => {
                  setOfferMode(mode)
                  setOfferErrors({})
                  setOffers((current) =>
                    current.length > 0 ? current : [emptyOffer()]
                  )
                }}
                onChange={(next) => {
                  setOffers(next)
                  setOfferErrors({})
                }}
              />
            </div>
          )}

          {!editing && !canSell ? (
            <p className="text-sm text-destructive sm:col-span-2">
              Price and stock are saved as variants. This account does not have
              permission to create variants.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onCancel}
          >
            {savedWithoutApproval ? "Back to products" : "Cancel"}
          </Button>
          <Button
            type="submit"
            disabled={
              busy ||
              savedWithoutApproval ||
              !specsReady ||
              (!editing && !canSell)
            }
          >
            {uploadingImage
              ? "Uploading…"
              : saving
                ? editing
                  ? "Saving…"
                  : "Creating…"
                : editing
                  ? "Save changes"
                  : form.status === "active"
                    ? "Create and submit"
                    : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  )
}
