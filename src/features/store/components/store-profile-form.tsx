import { useEffect, useState, type ReactNode } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCategoryTree } from "@/features/products/hooks"
import { ApiError } from "@/lib/api/errors"

import { useUpdateStore } from "../hooks"
import { storeCategoryOptions } from "../lib/categories"
import {
  payoutFieldsDirty,
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
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
  const payoutMethod = useWatch({ control: form.control, name: "payoutMethod" })
  const categoryIds = useWatch({ control: form.control, name: "categoryIds" })
  const saving = updateStore.isPending
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

  const onValid = async (values: StoreProfileFormValues) => {
    setNotice(null)
    setMediaErrors({})

    try {
      const saved = await updateStore.mutateAsync({
        payload: toUpdatePayload(values, {
          clearLogo: removeLogo && !logoFile,
          clearBanner: removeBanner && !bannerFile,
          includePayout: payoutFieldsDirty(
            (name) => form.getFieldState(name).isDirty
          ),
        }),
        logo: logoFile,
        banner: bannerFile,
      })
      resetForm(saved)
      setNotice("Store updated")
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
    }
  }

  return (
    <form
      className="flex flex-col gap-6 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5"
      noValidate
      onSubmit={form.handleSubmit(onValid)}
    >
      <Section
        title="Images"
        description="The logo appears on store cards. The banner is the cover at the top of the store page."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <StoreMediaField
            id="store-logo"
            label="Logo"
            description="JPEG, PNG, WebP, or GIF. Up to 5 MB."
            currentUrl={store.logo}
            file={logoFile}
            removed={removeLogo}
            error={mediaErrors.logo}
            disabled={saving}
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
            disabled={saving}
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
        description="This is the public name and description shoppers see."
      >
        <Field data-invalid={form.formState.errors.name ? true : undefined}>
          <FieldLabel htmlFor="store-name">Name</FieldLabel>
          <Input
            id="store-name"
            autoComplete="organization"
            aria-invalid={Boolean(form.formState.errors.name)}
            disabled={saving}
            {...form.register("name")}
          />
          <FieldError>{messageOf(form.formState.errors.name)}</FieldError>
        </Field>
        <Field data-invalid={form.formState.errors.slug ? true : undefined}>
          <FieldLabel htmlFor="store-slug">Slug</FieldLabel>
          <Input
            id="store-slug"
            aria-invalid={Boolean(form.formState.errors.slug)}
            disabled={saving}
            {...form.register("slug")}
          />
          <FieldDescription>
            Lowercase letters, numbers, and hyphens. Used in the store URL.
          </FieldDescription>
          <FieldError>{messageOf(form.formState.errors.slug)}</FieldError>
        </Field>
        <Field
          data-invalid={form.formState.errors.description ? true : undefined}
        >
          <FieldLabel htmlFor="store-description">Description</FieldLabel>
          <Textarea
            id="store-description"
            rows={4}
            aria-invalid={Boolean(form.formState.errors.description)}
            disabled={saving}
            {...form.register("description")}
          />
          <FieldError>
            {messageOf(form.formState.errors.description)}
          </FieldError>
        </Field>
      </Section>

      <Separator />

      <Section
        title="Contact"
        description="Shoppers can use these details to reach the store."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={form.formState.errors.email ? true : undefined}>
            <FieldLabel htmlFor="store-email">Email</FieldLabel>
            <Input
              id="store-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              disabled={saving}
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
              disabled={saving}
              {...form.register("phone")}
            />
            <FieldError>{messageOf(form.formState.errors.phone)}</FieldError>
          </Field>
        </div>
      </Section>

      <Separator />

      <Section title="Address" description="Where this store operates from.">
        <Field data-invalid={form.formState.errors.line1 ? true : undefined}>
          <FieldLabel htmlFor="store-line1">Street address</FieldLabel>
          <Input
            id="store-line1"
            autoComplete="address-line1"
            aria-invalid={Boolean(form.formState.errors.line1)}
            disabled={saving}
            {...form.register("line1")}
          />
          <FieldError>{messageOf(form.formState.errors.line1)}</FieldError>
        </Field>
        <Field data-invalid={form.formState.errors.line2 ? true : undefined}>
          <FieldLabel htmlFor="store-line2">
            Apartment, suite, or unit
          </FieldLabel>
          <Input
            id="store-line2"
            autoComplete="address-line2"
            aria-invalid={Boolean(form.formState.errors.line2)}
            disabled={saving}
            {...form.register("line2")}
          />
          <FieldError>{messageOf(form.formState.errors.line2)}</FieldError>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={form.formState.errors.city ? true : undefined}>
            <FieldLabel htmlFor="store-city">City</FieldLabel>
            <Input
              id="store-city"
              autoComplete="address-level2"
              aria-invalid={Boolean(form.formState.errors.city)}
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
              {...form.register("country")}
            />
            <FieldError>{messageOf(form.formState.errors.country)}</FieldError>
          </Field>
        </div>
      </Section>

      <Separator />

      <Section
        title="Categories"
        description="Products can only be listed in categories selected here."
      >
        <StoreCategoryField
          options={options}
          value={categoryIds}
          error={categoryError}
          disabled={saving}
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

      <Separator />

      <Section title="Policies" description="Shown on the public store page.">
        <Field
          data-invalid={form.formState.errors.shippingPolicy ? true : undefined}
        >
          <FieldLabel htmlFor="store-shipping-policy">
            Shipping policy
          </FieldLabel>
          <Textarea
            id="store-shipping-policy"
            rows={4}
            aria-invalid={Boolean(form.formState.errors.shippingPolicy)}
            disabled={saving}
            {...form.register("shippingPolicy")}
          />
          <FieldError>
            {messageOf(form.formState.errors.shippingPolicy)}
          </FieldError>
        </Field>
        <Field
          data-invalid={form.formState.errors.returnPolicy ? true : undefined}
        >
          <FieldLabel htmlFor="store-return-policy">Return policy</FieldLabel>
          <Textarea
            id="store-return-policy"
            rows={4}
            aria-invalid={Boolean(form.formState.errors.returnPolicy)}
            disabled={saving}
            {...form.register("returnPolicy")}
          />
          <FieldError>
            {messageOf(form.formState.errors.returnPolicy)}
          </FieldError>
        </Field>
      </Section>

      <Separator />

      <Section
        title="Visibility"
        description="A closed store stays hidden from shoppers. A suspended store stays hidden until an administrator lifts the suspension."
      >
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-primary"
                checked={field.value}
                disabled={saving}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.checked)
                  setNotice(null)
                }}
              />
              <span>
                <span className="block text-sm font-medium">Store is open</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Closed stores are omitted from public listings.
                </span>
              </span>
            </label>
          )}
        />
      </Section>

      <Separator />

      <Section
        title="Payout account"
        description="Bank or mobile account used when this store withdraws earnings."
      >
        <Field
          data-invalid={form.formState.errors.payoutMethod ? true : undefined}
        >
          <FieldLabel htmlFor="store-payout-method">Method</FieldLabel>
          <Controller
            name="payoutMethod"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value || "unset"}
                disabled={saving}
                onValueChange={(value) => {
                  field.onChange(value === "unset" ? "" : value)
                  setNotice(null)
                }}
              >
                <SelectTrigger
                  id="store-payout-method"
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.payoutMethod)}
                >
                  <SelectValue placeholder="No payout account" />
                </SelectTrigger>
                <SelectContent>
                  {store.payout ? null : (
                    <SelectItem value="unset">No payout account</SelectItem>
                  )}
                  <SelectItem value="bank">Bank account</SelectItem>
                  <SelectItem value="mobile">Mobile wallet</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>
            {messageOf(form.formState.errors.payoutMethod)}
          </FieldError>
        </Field>

        {payoutMethod ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              data-invalid={
                form.formState.errors.accountHolderName ? true : undefined
              }
            >
              <FieldLabel htmlFor="store-account-holder">
                Account holder
              </FieldLabel>
              <Input
                id="store-account-holder"
                autoComplete="name"
                aria-invalid={Boolean(form.formState.errors.accountHolderName)}
                disabled={saving}
                {...form.register("accountHolderName")}
              />
              <FieldError>
                {messageOf(form.formState.errors.accountHolderName)}
              </FieldError>
            </Field>
            {payoutMethod === "bank" ? (
              <>
                <Field
                  data-invalid={
                    form.formState.errors.bankName ? true : undefined
                  }
                >
                  <FieldLabel htmlFor="store-bank-name">Bank</FieldLabel>
                  <Input
                    id="store-bank-name"
                    aria-invalid={Boolean(form.formState.errors.bankName)}
                    disabled={saving}
                    {...form.register("bankName")}
                  />
                  <FieldError>
                    {messageOf(form.formState.errors.bankName)}
                  </FieldError>
                </Field>
                <Field
                  data-invalid={
                    form.formState.errors.branchName ? true : undefined
                  }
                >
                  <FieldLabel htmlFor="store-branch-name">Branch</FieldLabel>
                  <Input
                    id="store-branch-name"
                    aria-invalid={Boolean(form.formState.errors.branchName)}
                    disabled={saving}
                    {...form.register("branchName")}
                  />
                  <FieldError>
                    {messageOf(form.formState.errors.branchName)}
                  </FieldError>
                </Field>
                <Field
                  data-invalid={
                    form.formState.errors.accountNumber ? true : undefined
                  }
                >
                  <FieldLabel htmlFor="store-account-number">
                    Account number
                  </FieldLabel>
                  <Input
                    id="store-account-number"
                    aria-invalid={Boolean(form.formState.errors.accountNumber)}
                    disabled={saving}
                    {...form.register("accountNumber")}
                  />
                  <FieldError>
                    {messageOf(form.formState.errors.accountNumber)}
                  </FieldError>
                </Field>
                <Field
                  data-invalid={
                    form.formState.errors.routingNumber ? true : undefined
                  }
                >
                  <FieldLabel htmlFor="store-routing-number">
                    Routing number
                  </FieldLabel>
                  <Input
                    id="store-routing-number"
                    aria-invalid={Boolean(form.formState.errors.routingNumber)}
                    disabled={saving}
                    {...form.register("routingNumber")}
                  />
                  <FieldDescription>Optional.</FieldDescription>
                  <FieldError>
                    {messageOf(form.formState.errors.routingNumber)}
                  </FieldError>
                </Field>
              </>
            ) : (
              <>
                <Field
                  data-invalid={
                    form.formState.errors.provider ? true : undefined
                  }
                >
                  <FieldLabel htmlFor="store-provider">Provider</FieldLabel>
                  <Input
                    id="store-provider"
                    aria-invalid={Boolean(form.formState.errors.provider)}
                    disabled={saving}
                    {...form.register("provider")}
                  />
                  <FieldError>
                    {messageOf(form.formState.errors.provider)}
                  </FieldError>
                </Field>
                <Field
                  data-invalid={
                    form.formState.errors.accountNumber ? true : undefined
                  }
                >
                  <FieldLabel htmlFor="store-mobile-number">
                    Account number
                  </FieldLabel>
                  <Input
                    id="store-mobile-number"
                    aria-invalid={Boolean(form.formState.errors.accountNumber)}
                    disabled={saving}
                    {...form.register("accountNumber")}
                  />
                  <FieldError>
                    {messageOf(form.formState.errors.accountNumber)}
                  </FieldError>
                </Field>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No payout account is saved for this store.
          </p>
        )}
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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving || !dirty}>
          {saving ? "Saving…" : "Save store"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving || !dirty}
          onClick={() => {
            resetForm(store)
            setNotice(null)
            form.clearErrors()
          }}
        >
          Discard changes
        </Button>
      </div>
    </form>
  )
}
