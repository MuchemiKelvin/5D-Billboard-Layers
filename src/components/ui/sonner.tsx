import React from "react"
import { Toaster as LocalToaster } from "./toaster"


type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return <LocalToaster {...props} />
}

export { Toaster }
