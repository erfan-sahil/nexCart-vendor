import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getMyStore, storeKeys, updateMyStore } from "../services"
import type { UpdateStoreRequest } from "../types"

export function useMyStore() {
  return useQuery({
    queryKey: storeKeys.mine,
    queryFn: getMyStore,
    staleTime: 60_000,
  })
}

export function useUpdateStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateStoreRequest) => updateMyStore(input),
    onSuccess: (store) => {
      queryClient.setQueryData(storeKeys.mine, store)
    },
  })
}
