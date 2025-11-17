// Frontend utility for UploadThing
import { generateReactHelpers } from "@uploadthing/react"

// 👇 base URL ของ backend (ปรับได้ผ่าน .env)
// ถ้าไม่มี VITE_BACKEND_URL จะใช้ URL ที่ deploy บน Render แทน
const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "https://testmybackendpower.onrender.com";

// เดิมเรายิงตรงไป localhost:3000 (เก็บไว้เป็นประวัติ ไม่ลบออก)
// url: "http://localhost:3000/api/uploadthing",

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: `${backendBaseUrl}/api/uploadthing`,
})
