import { useEffect, useMemo, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"

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
import { buildOfferPayloads, emptyOffer } from "../lib/create-offer"
import {
  EMPTY_PRODUCT_FORM,
  buildAttributeInputs,
  draftsFromAttributes,
  formFromProduct,
  toCreatePayload,
  toUpdatePayload,
  variantAssignments,
  type AttributeDraft,
  type CreateProductFormValues,
  type ProductAttributeInput,
} from "../lib/create-product"
import {
  buildProductFormSchema,
  type ProductFormValues,
} from "../lib/product-form-schema"
import type { CategoryAttribute, Product } from "../types"
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

function errorsFromApi(error: ApiError, attributes: ProductAttributeInput[]) {
  const fields: Partial<Record<ProductField, string>> = {}
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

function defaultValues(product: Product | null): ProductFormValues {
  const details = product ? formFromProduct(product) : EMPTY_PRODUCT_FORM

  return {
    ...details,
    images: [],
    offerMode: "single",
    offers: [emptyOffer()],
  }
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
  const [drafts, setDrafts] = useState<Record<string, AttributeDraft>>(() =>
    product ? draftsFromAttributes(product.attributes) : {}
  )
  const [attributeErrors, setAttributeErrors] = useState<
    Record<string, string>
  >({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savedWithoutApproval, setSavedWithoutApproval] = useState(false)
  const schemaOptions = useRef({
    requireImages: !editing,
    requireOffers: !editing && canSell,
    assignments: [] as CategoryAttribute[],
  })
  const form = useForm<ProductFormValues>({
    resolver: (values, context, options) =>
      zodResolver(buildProductFormSchema(schemaOptions.current))(
        values,
        context,
        options
      ),
    defaultValues: defaultValues(product),
  })
  const categoryId = useWatch({ control: form.control, name: "categoryId" })
  const status = useWatch({ control: form.control, name: "status" })
  const attributes = useCategoryAttributes(categoryId)

  useEffect(() => {
    schemaOptions.current = {
      requireImages: !editing,
      requireOffers: !editing && canSell,
      assignments: attributes.data ?? [],
    }
  }, [attributes.data, canSell, editing])
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
  const specsReady = !categoryId || attributes.isSuccess
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
  const rootError = form.formState.errors.root?.message

  const onCategoryChange = (value: string) => {
    form.setValue("categoryId", value, {
      shouldValidate: true,
      shouldDirty: true,
    })
    form.setValue("offerMode", "single")
    setDrafts({})
    setAttributeErrors({})
  }

  const onValid = async (values: ProductFormValues) => {
    if (uploadingImage || savedWithoutApproval) {
      return
    }

    if (!attributes.isSuccess && values.categoryId) {
      form.setError("root", {
        message: attributes.isError
          ? "Category details could not be loaded."
          : "Category details are still loading.",
      })
      return
    }

    const built = buildAttributeInputs(attributes.data ?? [], drafts)

    if (Object.keys(built.errors).length > 0) {
      setAttributeErrors(built.errors)
      form.setError("root", {
        message: "Check the highlighted fields and try again.",
      })
      return
    }

    if (!editing && !canSell) {
      form.setError("root", {
        message:
          "Price and stock are saved as variants. This account does not have permission to create variants.",
      })
      return
    }

    const sellingOnEdit =
      values.offerMode === "variants" ||
      values.offers.some(
        (offer) =>
          offer.sku.trim() !== "" ||
          offer.price.trim() !== "" ||
          offer.compareAtPrice.trim() !== "" ||
          offer.stock.trim() !== ""
      )
    const offer =
      !canSell || (editing && !sellingOnEdit)
        ? null
        : buildOfferPayloads(
            values.offerMode,
            values.offers,
            attributes.data ?? []
          )

    if (offer?.message) {
      form.setError("root", { message: offer.message })
      return
    }

    setAttributeErrors({})

    try {
      if (editing && product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          payload: toUpdatePayload(values, built.inputs),
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
        product: toCreatePayload(values, built.inputs, values.images),
        variants: offer.payloads,
        submitForApproval: values.status === "active",
      })

      if (result.approvalWarning) {
        setSavedWithoutApproval(true)
        form.setError("root", { message: result.approvalWarning })
        return
      }

      onSaved()
    } catch (error) {
      if (error instanceof ApiError) {
        const next = errorsFromApi(error, built.inputs)
        form.clearErrors()

        for (const [field, message] of Object.entries(next.fields)) {
          if (message && isProductField(field)) {
            form.setError(field, { message })
          }
        }

        setAttributeErrors(next.attributeErrors)

        if (next.message) {
          form.setError("root", { message: next.message })
        }

        return
      }

      form.setError("root", {
        message: editing
          ? "Could not update this product. Please try again."
          : "Could not create this product. Please try again.",
      })
    }
  }

  const onInvalid = () => {
    const values = form.getValues()

    if (!values.categoryId || attributes.isSuccess) {
      setAttributeErrors(
        buildAttributeInputs(attributes.data ?? [], drafts).errors
      )
    }

    form.setError("root", {
      message: "Check the highlighted fields and try again.",
    })
  }

  return (
    <form
      className="flex w-full flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        if (uploadingImage || savedWithoutApproval) {
          event.preventDefault()
          return
        }

        void form.handleSubmit(onValid, onInvalid)(event)
      }}
    >
      {rootError ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm whitespace-pre-line text-destructive"
        >
          {rootError}
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
              <Controller
                name="images"
                control={form.control}
                render={({ field, fieldState }) => (
                  <ProductImageField
                    images={field.value}
                    error={fieldState.error?.message}
                    disabled={saving}
                    required
                    onPendingChange={setUploadingImage}
                    onChange={(next) => {
                      field.onChange(next)
                      if (fieldState.error) {
                        void form.trigger("images")
                      }
                    }}
                  />
                )}
              />
            )}

            <div className={editing ? "contents" : "grid gap-4 sm:grid-cols-2"}>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-name">Name *</FieldLabel>
                    <Input
                      {...field}
                      id="product-name"
                      className="h-9"
                      required
                      aria-required
                      aria-invalid={fieldState.invalid}
                      disabled={busy}
                      autoFocus
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
                    <Input
                      {...field}
                      id="product-slug"
                      className="h-9"
                      placeholder="linen-shirt"
                      spellCheck={false}
                      aria-invalid={fieldState.invalid}
                      disabled={busy}
                    />
                    <FieldDescription>
                      Leave blank to generate one from the name.
                    </FieldDescription>
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="categoryId"
                control={form.control}
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-category">
                      Category *
                    </FieldLabel>
                    <Select
                      value={categoryId || undefined}
                      disabled={
                        busy ||
                        store.isLoading ||
                        tree.isLoading ||
                        categories.length === 0
                      }
                      onValueChange={onCategoryChange}
                    >
                      <SelectTrigger
                        id="product-category"
                        className="h-9! w-full cursor-pointer"
                        aria-required
                        aria-invalid={fieldState.invalid}
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
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-status">Status</FieldLabel>
                    <Select
                      value={field.value}
                      disabled={busy}
                      onValueChange={(value) => {
                        if (
                          (PRODUCT_STATUSES as readonly string[]).includes(
                            value
                          )
                        ) {
                          field.onChange(
                            value as CreateProductFormValues["status"]
                          )
                        }
                      }}
                    >
                      <SelectTrigger
                        id="product-status"
                        className="h-9! w-full cursor-pointer"
                        aria-invalid={fieldState.invalid}
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
                        {PRODUCT_STATUSES.map((item) => (
                          <SelectItem
                            key={item}
                            value={item}
                            className="cursor-pointer"
                          >
                            {PRODUCT_STATUS_LABEL[item]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Archived products stay out of the storefront.
                    </FieldDescription>
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="tags"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-tags">Tags</FieldLabel>
                    <Input
                      {...field}
                      id="product-tags"
                      className="h-9"
                      placeholder="linen, summer, shirt"
                      aria-invalid={fieldState.invalid}
                      disabled={busy}
                    />
                    <FieldDescription>
                      Separate tags with commas.
                    </FieldDescription>
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>
          </div>

          {categoryId && attributes.isLoading ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Loading category details…
            </p>
          ) : null}
          {categoryId && attributes.isError ? (
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

          <Controller
            name="shortDescription"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="sm:col-span-2"
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor="product-short-description">
                  Short description
                </FieldLabel>
                <Textarea
                  {...field}
                  id="product-short-description"
                  aria-invalid={fieldState.invalid}
                  disabled={busy}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                className="sm:col-span-2"
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor="product-description">
                  Description
                </FieldLabel>
                <Textarea
                  {...field}
                  id="product-description"
                  aria-invalid={fieldState.invalid}
                  disabled={busy}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          {!canSell ? null : (
            <div className="sm:col-span-2">
              <ProductOfferFields
                control={form.control}
                assignments={attributes.data ?? []}
                disabled={busy || savedWithoutApproval}
                required={!editing}
                canUseVariants={variantAxes.length > 0}
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
                  : status === "active"
                    ? "Create and submit"
                    : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  )
}
