import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  businessProfileKeys,
  getMyVendorApplication,
  updateMyBusinessRecords,
} from "../services"
import type { UpdateBusinessRecordsPayload } from "../types"

export function useMyBusinessProfile() {
  return useQuery({
    queryKey: businessProfileKeys.mine(),
    queryFn: getMyVendorApplication,
    staleTime: 60_000,
  })
}

export function useUpdateBusinessRecords() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateBusinessRecordsPayload) =>
      updateMyBusinessRecords(payload),
    onSuccess: (application) => {
      queryClient.setQueryData(businessProfileKeys.mine(), application)
    },
  })
}
