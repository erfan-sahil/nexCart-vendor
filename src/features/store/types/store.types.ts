export type StoreCategory = {
  id: string
  name: string
  slug: string
}

export type StoreAddress = {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type BankPayout = {
  method: "bank"
  accountHolderName: string
  bankName: string
  accountNumber: string
  branchName: string
  routingNumber: string
  updatedAt: string
}

export type MobilePayout = {
  method: "mobile"
  accountHolderName: string
  provider: string
  accountNumber: string
  updatedAt: string
}

export type StorePayout = BankPayout | MobilePayout

export type VendorStore = {
  id: string
  slug: string
  name: string
  logo: string
  banner: string
  description: string
  contact: {
    email: string
    phone: string
  }
  address: StoreAddress
  categories: StoreCategory[]
  returnPolicy: string
  shippingPolicy: string
  rating: {
    average: number
    count: number
  }
  totalProducts: number
  totalOrders: number
  totalSales: number
  joinedAt: string
  isActive: boolean
  isSuspended: boolean
  payout: StorePayout | null
}

export type UpdateStorePayout =
  | {
      method: "bank"
      accountHolderName: string
      bankName: string
      accountNumber: string
      branchName: string
      routingNumber?: string
    }
  | {
      method: "mobile"
      accountHolderName: string
      provider: string
      accountNumber: string
    }

export type UpdateStorePayload = {
  name: string
  slug: string
  description: string
  contact: VendorStore["contact"]
  address: StoreAddress
  categoryIds: string[]
  returnPolicy: string
  shippingPolicy: string
  isActive: boolean
  logo?: string
  banner?: string
  payout?: UpdateStorePayout
}

export type UpdateStoreRequest = {
  payload: UpdateStorePayload
  logo: File | null
  banner: File | null
}
