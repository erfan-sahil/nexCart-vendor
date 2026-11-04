import { z } from "zod"

export const businessRecordsSchema = z.object({
  tradeLicenseNumber: z.string().trim().max(64),
  tradeLicenseDocumentUrl: z.string().trim().max(2048),
  taxId: z.string().trim().max(64),
  taxDocumentUrl: z.string().trim().max(2048),
  line1: z.string().trim().min(2, "Enter the street address").max(160),
  line2: z.string().trim().max(160),
  city: z.string().trim().min(2, "Enter the city").max(80),
  state: z.string().trim().min(2, "Enter the state").max(80),
  postalCode: z.string().trim().min(2, "Enter the postal code").max(20),
  country: z.string().trim().min(2, "Enter the country").max(80),
})

export type BusinessRecordsFormValues = z.infer<typeof businessRecordsSchema>
