import { Navigate, useNavigate, useParams } from "react-router"

import { Button } from "@/components/ui/button"
import { useProduct, useProductVariants } from "@/features/products"
import { ProductForm } from "@/features/products/components/product-form"

const productIdPattern = /^[a-f\d]{24}$/i

export function EditProductPage() {
  const { productId = "" } = useParams()
  const navigate = useNavigate()
  const id = productIdPattern.test(productId) ? productId : ""
  const product = useProduct(id)
  const variants = useProductVariants(id, id.length > 0)

  if (!id) {
    return <Navigate to="/store/products" replace />
  }

  if (product.isPending || variants.isPending) {
    return (
      <p className="w-full text-sm text-muted-foreground">Loading product…</p>
    )
  }

  if (product.isError || !product.data || variants.isError || !variants.data) {
    return (
      <section className="flex w-full flex-col items-start gap-3 rounded-xl border border-border bg-card px-4 py-8 text-card-foreground shadow-sm sm:px-5">
        <p role="alert" className="text-sm text-destructive">
          This product could not be loaded.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/store/products")}
        >
          Back to products
        </Button>
      </section>
    )
  }

  return (
    <ProductForm
      product={product.data}
      variants={variants.data.items}
      onCancel={() => navigate("/store/products")}
      onSaved={() => navigate("/store/products")}
    />
  )
}
