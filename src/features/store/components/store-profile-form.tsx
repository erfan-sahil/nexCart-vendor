import { useEffect, useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCategoryTree } from "@/features/products/hooks"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess } from "@/lib/notify"

import { useUpdateStore } from "../hooks"
import { storeCategoryOptions } from "../lib/categories"
import {
  storeFieldErrors,
  toFormValues,
  toUpdatePayload,
} from "../lib/store-form"
import {
  storeProfileSchema,
  type StoreProfileFormValues,
} from "../lib/store-form-schema"
import type { VendorStore } from "../types"

import { StoreCategoryField } from "./store-category-field"
import { StoreMediaField } from "./store-media-field"

type StoreProfileFormProps = {
  store: VendorStore
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function messageOf(error: { message?: string } | undefined) {
  return error?.message
}

export function StoreProfileForm({ store }: StoreProfileFormProps) {
  const updateStore = useUpdateStore()
  const categories = useCategoryTree(true)
  const [editing, setEditing] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [mediaErrors, setMediaErrors] = useState<{
    logo?: string
    banner?: string
  }>({})
  const [notice, setNotice] = useState<string | null>(null)
  const form = useForm<StoreProfileFormValues>({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: toFormValues(store),
  })
  const categoryIds = useWatch({ control: form.control, name: "categoryIds" })
  const saving = updateStore.isPending
  const locked = !editing || saving
  const imageDirty = Boolean(
    logoFile || bannerFile || removeLogo || removeBanner
  )
  const dirty = form.formState.isDirty || imageDirty
  const options = storeCategoryOptions(categories.data ?? [], store.categories)
  const categoryError = messageOf(form.formState.errors.categoryIds)
  const rootError = form.formState.errors.root?.message

  useEffect(() => {
    if (
      form.formState.isDirty ||
      logoFile ||
      bannerFile ||
      removeLogo ||
      removeBanner
    ) {
      return
    }

    form.reset(toFormValues(store))
  }, [bannerFile, form, logoFile, removeBanner, removeLogo, store])

  const resetForm = (next: VendorStore) => {
    form.reset(toFormValues(next))
    setLogoFile(null)
    setBannerFile(null)
    setRemoveLogo(false)
    setRemoveBanner(false)
    setMediaErrors({})
  }

  const cancelEditing = () => {
    resetForm(store)
    setNotice(null)
    form.clearErrors()
    setEditing(false)
  }

  const onValid = async (values: StoreProfileFormValues) => {
    setNotice(null)
    setMediaErrors({})

    try {
      const saved = await updateStore.mutateAsync({
        payload: toUpdatePayload(values, {
          clearLogo: removeLogo && !logoFile,
          clearBanner: removeBanner && !bannerFile,
        }),
        logo: logoFile,
        banner: bannerFile,
      })
      resetForm(saved)
      setEditing(false)
      setNotice("Store updated")
      notifySuccess("Store updated")
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(0, {
              success: false,
              message: "Could not update the store. Please try again.",
              code: "UNKNOWN",
            })
      const mapped = storeFieldErrors(apiError)

      for (const [name, message] of Object.entries(mapped.fields)) {
        if (message) {
          form.setError(name as keyof StoreProfileFormValues, { message })
        }
      }

      setMediaErrors(mapped.media)

      if (mapped.message) {
        form.setError("root", { message: mapped.message })
      }

      notifyError(error, mapped.message ?? apiError.message)
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-5 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5"
      noValidate
      onSubmit={form.handleSubmit(onValid)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Store settings</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {editing
              ? "Update the public details shoppers see on your store page."
              : "Review your public storefront details. Click Edit to make changes."}
          </p>
        </div>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={cancelEditing}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNotice(null)
              setEditing(true)
            }}
          >
            <Pencil />
            Edit
          </Button>
        )}
      </div>

      <Separator />

      <Section
        title="Images"
        description="Logo appears on store cards. Banner covers the top of the store page."
      >
        <div className="grid items-start gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
          <StoreMediaField
            id="store-logo"
            label="Logo"
            description="JPEG, PNG, WebP, or GIF. Up to 5 MB."
            currentUrl={store.logo}
            file={logoFile}
            removed={removeLogo}
            error={mediaErrors.logo}
            disabled={locked}
            shape="logo"
            onFile={(file) => {
              setLogoFile(file)
              if (file) {
                setRemoveLogo(false)
              }
              setNotice(null)
            }}
            onRemove={() => {
              setRemoveLogo(true)
              setNotice(null)
            }}
          />
          <StoreMediaField
            id="store-banner"
            label="Banner"
            description="A wide image works best. Up to 5 MB."
            currentUrl={store.banner}
            file={bannerFile}
            removed={removeBanner}
            error={mediaErrors.banner}
            disabled={locked}
            shape="banner"
            onFile={(file) => {
              setBannerFile(file)
              if (file) {
                setRemoveBanner(false)
              }
              setNotice(null)
            }}
            onRemove={() => {
              setRemoveBanner(true)
              setNotice(null)
            }}
          />
        </div>
      </Section>

      <Separator />

      <Section
        title="Store details"
        description="Public name, URL slug, contact, and description."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field data-invalid={form.formState.errors.name ? true : undefined}>
            <FieldLabel htmlFor="store-name">Name</FieldLabel>
            <Input
              id="store-name"
              autoComplete="organization"
              aria-invalid={Boolean(form.formState.errors.name)}
              disabled={locked}
              {...form.register("name")}
            />
            <FieldError>{messageOf(form.formState.errors.name)}</FieldError>
          </Field>
          <Field data-invalid={form.formState.errors.slug ? true : undefined}>
            <FieldLabel htmlFor="store-slug">Slug</FieldLabel>
            <Input
              id="store-slug"
              aria-invalid={Boolean(form.formState.errors.slug)}
              disabled={locked}
              {...form.register("slug")}
            />
            <FieldDescription>
              Lowercase letters, numbers, and hyphens.
            </FieldDescription>
            <FieldError>{messageOf(form.formState.errors.slug)}</FieldError>
          </Field>
          <Field data-invalid={form.formState.errors.email ? true : undefined}>
            <FieldLabel htmlFor="store-email">Email</FieldLabel>
            <Input
              id="store-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              disabled={locked}
              {...form.register("email")}
            />
            <FieldError>{messageOf(form.formState.errors.email)}</FieldError>
          </Field>
          <Field data-invalid={form.formState.errors.phone ? true : undefined}>
            <FieldLabel htmlFor="store-phone">Phone</FieldLabel>
            <Input
              id="store-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+8801712345678"
              aria-invalid={Boolean(form.formState.errors.phone)}
              disabled={locked}
              {...form.register("phone")}
            />
            <FieldError>{messageOf(form.formState.errors.phone)}</FieldError>
          </Field>
          <Field
            className="sm:col-span-2 xl:col-span-4"
            data-invalid={form.formState.errors.description ? true : undefined}
          >
            <FieldLabel htmlFor="store-description">Description</FieldLabel>
            <Textarea
              id="store-description"
              rows={3}
              aria-invalid={Boolean(form.formState.errors.description)}
              disabled={locked}
              {...form.register("description")}
            />
            <FieldError>
              {messageOf(form.formState.errors.description)}
            </FieldError>
          </Field>
        </div>
      </Section>

      <Separator />

      <Section title="Address" description="Where this store operates from.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field
            className="xl:col-span-2"
            data-invalid={form.formState.errors.line1 ? true : undefined}
          >
            <FieldLabel htmlFor="store-line1">Street address</FieldLabel>
            <Input
              id="store-line1"
              autoComplete="address-line1"
              aria-invalid={Boolean(form.formState.errors.line1)}
              disabled={locked}
              {...form.register("line1")}
            />
            <FieldError>{messageOf(form.formState.errors.line1)}</FieldError>
          </Field>
          <Field
            className="xl:col-span-2"
            data-invalid={form.formState.errors.line2 ? true : undefined}
          >
            <FieldLabel htmlFor="store-line2">
              Apartment, suite, or unit
            </FieldLabel>
            <Input
              id="store-line2"
              autoComplete="address-line2"
              aria-invalid={Boolean(form.formState.errors.line2)}
              disabled={locked}
              {...form.register("line2")}
            />
            <FieldError>{messageOf(form.formState.errors.line2)}</FieldError>
          </Field>
          <Field data-invalid={form.formState.errors.city ? true : undefined}>
            <FieldLabel htmlFor="store-city">City</FieldLabel>
            <Input
              id="store-city"
              autoComplete="address-level2"
              aria-invalid={Boolean(form.formState.errors.city)}
              disabled={locked}
              {...form.register("city")}
            />
            <FieldError>{messageOf(form.formState.errors.city)}</FieldError>
          </Field>
          <Field data-invalid={form.formState.errors.state ? true : undefined}>
            <FieldLabel htmlFor="store-state">State</FieldLabel>
            <Input
              id="store-state"
              autoComplete="address-level1"
              aria-invalid={Boolean(form.formState.errors.state)}
              disabled={locked}
              {...form.register("state")}
            />
            <FieldError>{messageOf(form.formState.errors.state)}</FieldError>
          </Field>
          <Field
            data-invalid={form.formState.errors.postalCode ? true : undefined}
          >
            <FieldLabel htmlFor="store-postal-code">Postal code</FieldLabel>
            <Input
              id="store-postal-code"
              autoComplete="postal-code"
              aria-invalid={Boolean(form.formState.errors.postalCode)}
              disabled={locked}
              {...form.register("postalCode")}
            />
            <FieldError>
              {messageOf(form.formState.errors.postalCode)}
            </FieldError>
          </Field>
          <Field
            data-invalid={form.formState.errors.country ? true : undefined}
          >
            <FieldLabel htmlFor="store-country">Country</FieldLabel>
            <Input
              id="store-country"
              autoComplete="country-name"
              aria-invalid={Boolean(form.formState.errors.country)}
              disabled={locked}
              {...form.register("country")}
            />
            <FieldError>{messageOf(form.formState.errors.country)}</FieldError>
          </Field>
        </div>
      </Section>

      <Separator />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <Section
          title="Categories"
          description="Products can only be listed in these categories."
        >
          <StoreCategoryField
            options={options}
            value={categoryIds}
            error={categoryError}
            disabled={locked}
            loading={categories.isPending}
            loadError={
              categories.isError ? "Categories could not be loaded." : null
            }
            onChange={(value) => {
              form.setValue("categoryIds", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
              setNotice(null)
            }}
          />
        </Section>

        <Section title="Policies" description="Shown on the public store page.">
          <div className="flex flex-col gap-3">
            <Field
              data-invalid={
                form.formState.errors.shippingPolicy ? true : undefined
              }
            >
              <FieldLabel htmlFor="store-shipping-policy">
                Shipping policy
              </FieldLabel>
              <Textarea
                id="store-shipping-policy"
                rows={7}
                aria-invalid={Boolean(form.formState.errors.shippingPolicy)}
                disabled={locked}
                {...form.register("shippingPolicy")}
              />
              <FieldError>
                {messageOf(form.formState.errors.shippingPolicy)}
              </FieldError>
            </Field>
            <Field
              data-invalid={
                form.formState.errors.returnPolicy ? true : undefined
              }
            >
              <FieldLabel htmlFor="store-return-policy">
                Return policy
              </FieldLabel>
              <Textarea
                id="store-return-policy"
                rows={7}
                aria-invalid={Boolean(form.formState.errors.returnPolicy)}
                disabled={locked}
                {...form.register("returnPolicy")}
              />
              <FieldError>
                {messageOf(form.formState.errors.returnPolicy)}
              </FieldError>
            </Field>
          </div>
        </Section>
      </div>

      <Separator />

      <Section
        title="Visibility"
        description="Closed stores are hidden from shoppers. Suspended stores stay hidden until an administrator lifts the suspension."
      >
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <label className="flex w-fit items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-primary"
                checked={field.value}
                disabled={locked}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.checked)
                  setNotice(null)
                }}
              />
              <span>
                <span className="block text-sm font-medium">Store is open</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Uncheck to close the storefront temporarily.
                </span>
              </span>
            </label>
          )}
        />
      </Section>

      {rootError ? (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      ) : null}
      {notice ? (
        <p
          className="text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      {editing ? (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={cancelEditing}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </form>
  )
}
