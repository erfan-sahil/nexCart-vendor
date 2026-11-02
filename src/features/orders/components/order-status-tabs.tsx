import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ORDER_STATUS_TABS, type OrderStatusTab } from "../constants"

type OrderStatusTabsProps = {
  value: OrderStatusTab
  onChange: (tab: OrderStatusTab) => void
}

export function OrderStatusTabs({ value, onChange }: OrderStatusTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as OrderStatusTab)}
      className="w-fit max-w-full"
    >
      <TabsList aria-label="Filter orders by status">
        {ORDER_STATUS_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
