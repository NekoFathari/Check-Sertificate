"use client"

import { Toaster as SonnerToaster } from "sonner"

function Toaster({ ...props }: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  )
}

export { Toaster }
