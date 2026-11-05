import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type RangeSelectProps<T extends string> = {
  value: T
  onValueChange: (value: T) => void
  options: readonly { value: T; label: string }[]
  ariaLabel?: string
}

export function RangeSelect<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel = "Date range",
}: RangeSelectProps<T>) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      aria-label={ariaLabel}
    >
      <TabsList>
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
