// Frontend utility for UploadThing
import { generateReactHelpers } from "@uploadthing/react"

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: "http://localhost:3000/api/uploadthing",
})
