// Frontend utility for UploadThing
import { generateReactHelpers } from "@uploadthing/react"

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: "https://testmybackendpower.onrender.com/api/uploadthing",
})
