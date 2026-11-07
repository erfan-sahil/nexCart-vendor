import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { ThemeProvider } from "@/app/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"

import App from "./app/App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="nexcart-vendor-theme">
      <App />
      <Toaster position="top-right" />
    </ThemeProvider>
  </StrictMode>
)
