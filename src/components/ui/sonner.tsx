import React from "react"
import { Toaster as LocalToaster } from "./toaster"
import { toast as localToast } from "@/hooks/use-toast"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return <LocalToaster {...props} />
}

export { Toaster, localToast as toast }
