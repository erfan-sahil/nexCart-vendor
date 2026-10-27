export const catalogKeys = {
  store: ["store", "me"] as const,
  tree: ["categories", "tree", "active"] as const,
  attributes: (categoryId: string) =>
    ["categories", categoryId, "attributes"] as const,
}
