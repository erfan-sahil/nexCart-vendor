import { useQuery } from "@tanstack/react-query"

import { businessProfileKeys, getMyVendorApplication } from "../services"

export function useMyBusinessProfile() {
  return useQuery({
    queryKey: businessProfileKeys.mine(),
    queryFn: getMyVendorApplication,
    staleTime: 60_000,
  })
}
