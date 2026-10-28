import { useNavigate } from "react-router"

import { ProductForm } from "@/features/products/components/product-form"

export function NewProductPage() {
  const navigate = useNavigate()

  return (
    <ProductForm
      onCancel={() => navigate("/store/products")}
      onSaved={() => navigate("/store/products")}
    />
  )
}
