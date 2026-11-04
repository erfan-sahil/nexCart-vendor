import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createStoreReviewReply,
  listStoreReviews,
  vendorReviewKeys,
} from "../services"
import type { ListStoreReviewsParams } from "../types"

export function useStoreReviewsQuery(params: ListStoreReviewsParams) {
  return useQuery({
    queryKey: vendorReviewKeys.list(params),
    queryFn: () => listStoreReviews(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateStoreReviewReplyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStoreReviewReply,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vendorReviewKeys.lists(),
      })
    },
  })
}
