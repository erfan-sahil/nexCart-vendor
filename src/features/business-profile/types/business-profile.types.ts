export const VENDOR_APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "more_info_required",
  "approved",
  "rejected",
] as const

export type VendorApplicationStatus =
  (typeof VENDOR_APPLICATION_STATUSES)[number]

export type VendorDocumentType = "nid" | "passport"

export type VendorBusinessType = "individual" | "company"

export type VendorAddress = {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type VendorApplication = {
  id: string
  userId: string
  status: VendorApplicationStatus
  personal: {
    fullName: string
    email: string
    phone: string
    dateOfBirth: string | null
    address: VendorAddress
  }
  identity: {
    documentType: VendorDocumentType | null
    documentNumber: string
    documentImages: string[]
    selfieUrl: string
  }
  business: {
    storeName: string
    businessType: VendorBusinessType | null
    address: VendorAddress
    tradeLicense: {
      number: string
      documentUrl: string
    } | null
    tax: {
      taxId: string
      documentUrl: string
    } | null
  }
  selling: {
    categoryIds: string[]
    description: string
  }
  reviewNote: string
  submittedAt: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  createdAt: string
  updatedAt: string
}
