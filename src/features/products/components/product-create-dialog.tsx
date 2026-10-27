import { useMemo, useState, type FormEvent } from "react"
import { Package } from "lucide-react"
import type { ZodError } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"

import { PRODUCT_STATUS_LABEL, PRODUCT_STATUSES } from "../constants"
import {
  useCategoryAttributes,
  useCategoryTree,
  useCreateProduct,
  useUpdateProduct,
  useVendorStore,
} from "../hooks"
import {
  EMPTY_PRODUCT_FORM,
  buildAttributeInputs,
  createProductFormSchema,
  draftsFromAttributes,
  formFromProduct,
  toCreatePayload,
  toUpdatePayload,
  type AttributeDraft,
  type CreateProductFormValues,
  type ProductAttributeInput,
} from "../lib/create-product"
import type { Product } from "../types"
import { sellableCategories } from "../lib/sellable-categories"

import { ProductAttributeFields } from "./product-attribute-fields"
import { ProductImageField } from "./product-image-field"

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

type ProductCreateDialogProps = {
  open: boolean
  product?: Product | null
  onClose: () => void
  onCreated: () => void
}

export function ProductCreateDialog({
  open,
  product = null,
  onClose,
  onCreated,
}: ProductCreateDialogProps) {
  if (!open) {
    return null
  }

  return (
    <ProductCreateForm
      product={product}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}

function ProductCreateForm({
  product,
  onClose,
  onCreated,
}: {
  product: Product | null
  onClose: () => void
  onCreated: () => void
}) {
  const editing = product !== null
  const createProduct = useCreateProduct()
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
  const attributes = useCategoryAttributes(form.categoryId)
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

    if (uploadingImage) {
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

    if (!parsed.success || imageError || Object.keys(built.errors).length > 0) {
      setErrors(nextErrors)
      setAttributeErrors(built.errors)
      setFormError(
        parsed.success
          ? imageError || "Check the highlighted fields and try again."
          : zodFormMessage(parsed.error)
      )
      return
    }

    setErrors({})
    setAttributeErrors({})

    try {
      if (editing && product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          payload: toUpdatePayload(parsed.data, built.inputs),
        })
      } else {
        await createProduct.mutateAsync(
          toCreatePayload(parsed.data, built.inputs, images)
        )
      }
      onCreated()
      onClose()
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
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !busy) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-brand/20 bg-brand-soft px-6 py-6 text-left">
          <div className="flex items-center gap-4 pr-8">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm ring-4 ring-background">
              <Package className="size-6" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-lg font-semibold">
                {editing ? "Edit product" : "New product"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                {editing
                  ? "Update this listing. Existing images stay attached."
                  : "Add a listing for this store. It stays pending until you submit it for approval."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          noValidate
          onSubmit={(event) => void submit(event)}
        >
          {formError ? (
            <p
              role="alert"
              className="px-6 pt-4 text-sm whitespace-pre-line text-destructive"
            >
              {formError}
            </p>
          ) : null}
          <ScrollArea
            type="auto"
            className="min-h-0 flex-1 overflow-hidden"
            viewportClassName="h-auto max-h-[min(32rem,calc(100dvh-16rem))]"
          >
            <FieldGroup className="gap-4 px-6 py-5">
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

              {form.categoryId && attributes.isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading category details…
                </p>
              ) : null}
              {form.categoryId && attributes.isError ? (
                <p className="text-sm text-destructive" role="alert">
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

              <Field data-invalid={Boolean(errors.description) || undefined}>
                <FieldLabel htmlFor="product-description">
                  Description
                </FieldLabel>
                <Textarea
                  id="product-description"
                  value={form.description}
                  aria-invalid={Boolean(errors.description)}
                  disabled={busy}
                  onChange={(event) =>
                    setField("description")(event.target.value)
                  }
                />
                <FieldError>{errors.description}</FieldError>
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
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="relative z-10 mx-0 mb-0 shrink-0 rounded-none border-border bg-card px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="relative z-10 cursor-pointer"
              disabled={busy || !specsReady}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void submit()
              }}
            >
              {uploadingImage
                ? "Uploading…"
                : saving
                  ? editing
                    ? "Saving…"
                    : "Creating…"
                  : editing
                    ? "Save changes"
                    : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
