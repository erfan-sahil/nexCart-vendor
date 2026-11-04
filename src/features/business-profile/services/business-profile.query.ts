export const businessProfileKeys = {
  all: ["business-profile"] as const,
  mine: () => [...businessProfileKeys.all, "me"] as const,
}
