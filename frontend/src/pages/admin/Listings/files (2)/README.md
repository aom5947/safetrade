# Listings Management System - shadcn/ui Version

ระบบจัดการประกาศที่ใช้ shadcn/ui และ Tailwind CSS รองรับ API ครบถ้วน

## 🎯 Features

✅ **CRUD Operations**
- สร้าง/แก้ไข/ลบประกาศ
- เปลี่ยนสถานะประกาศ (6 สถานะ)
- จัดการรูปภาพประกาศ

✅ **Search & Filter**
- ค้นหาตามชื่อและรายละเอียด
- กรองตามหมวดหมู่
- กรองตามช่วงราคา
- กรองตามสถานที่
- เรียงลำดับ (ใหม่ล่าสุด, ราคา, ยอดดู)

✅ **UI/UX**
- Responsive design with Tailwind CSS
- Beautiful shadcn/ui components
- Loading states & Empty states
- Toast notifications
- Modal dialogs

## 📦 ไฟล์ที่สร้าง

```
src/
├── pages/admin/
│   └── ListingsPage.jsx          # หน้าหลัก
├── components/
│   ├── ListingFormModal.jsx      # Modal สร้าง/แก้ไข
│   ├── ListingDetailModal.jsx    # Modal ดูรายละเอียด
│   └── StatusUpdateModal.jsx     # Modal เปลี่ยนสถานะ
```

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
# shadcn/ui dependencies (ถ้ายังไม่มี)
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install sonner
```

### 2. ติดตั้ง shadcn/ui Components

```bash
# ติดตั้ง components ที่จำเป็น
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
```

หรือ ถ้าคุณติดตั้ง shadcn/ui แล้ว แค่ตรวจสอบว่ามี components เหล่านี้:
- `components/ui/dialog.jsx`
- `components/ui/button.jsx`
- `components/ui/input.jsx`
- `components/ui/label.jsx`
- `components/ui/textarea.jsx`
- `components/ui/select.jsx`
- `components/ui/badge.jsx`
- `components/ui/table.jsx`
- `components/ui/card.jsx`

### 3. เพิ่ม Utility Functions

สร้างหรือเพิ่มฟังก์ชันใน `lib/utils.js` หรือ `lib/utils.ts`:

```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Existing cn function from shadcn/ui
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Add these utility functions
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    sold: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    hidden: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusDisplayName = (status) => {
  const names = {
    active: 'เปิดใช้งาน',
    sold: 'ขายแล้ว',
    expired: 'หมดอายุ',
    hidden: 'ซ่อน',
    pending: 'รออนุมัติ',
    rejected: 'ปฏิเสธ',
  };
  return names[status] || status;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
};
```

### 4. Copy Components

```bash
# Copy ไฟล์ไปยัง project
cp ListingsPage.jsx src/pages/admin/
cp ListingFormModal.jsx src/components/
cp ListingDetailModal.jsx src/components/
cp StatusUpdateModal.jsx src/components/
```

### 5. ตรวจสอบ Import Paths

แก้ไข import paths ให้ตรงกับ project structure ของคุณ:

```javascript
// ตัวอย่าง paths ที่อาจต้องปรับ
import { api } from '@/services/api';
import { Loading } from '@/components/Admin_components/Loading';
import { EmptyState } from '@/components/Admin_components/EmptyState';
```

## 📝 การใช้งาน

### เพิ่ม Route

```javascript
// ใน App.jsx หรือ routes configuration
import ListingsPage from '@/pages/admin/ListingsPage';

<Route path="/admin/listings" element={<ListingsPage />} />
```

### API Service Setup

ตรวจสอบว่า API service (`@/services/api`) มี axios instance ที่ตั้งค่าแล้ว:

```javascript
// services/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🎨 Customization

### เปลี่ยนธีม shadcn/ui

แก้ไขใน `app/globals.css` หรือ `styles/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... เพิ่มสีตามต้องการ */
  }
}
```

### เปลี่ยนจำนวนรายการต่อหน้า

```javascript
const [pagination, setPagination] = useState({
  page: 1,
  limit: 50, // เปลี่ยนจาก 20 เป็น 50
  totalCount: 0,
  totalPages: 0,
});
```

### เพิ่ม Filter ใหม่

```javascript
// 1. เพิ่มใน state
const [filters, setFilters] = useState({
  // ... filters เดิม
  status: '', // เพิ่ม filter สถานะ
});

// 2. เพิ่มใน UI
<Select
  value={filters.status}
  onValueChange={(value) => handleFilterChange('status', value)}
>
  <SelectTrigger>
    <SelectValue placeholder="ทุกสถานะ" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">ทุกสถานะ</SelectItem>
    <SelectItem value="active">เปิดใช้งาน</SelectItem>
    <SelectItem value="sold">ขายแล้ว</SelectItem>
  </SelectContent>
</Select>

// 3. เพิ่มใน API params
const params = {
  // ... params เดิม
  status: filters.status || undefined,
};
```

## 🔧 API Endpoints

### รองรับ Endpoints ทั้งหมด:

```javascript
// GET - ดึงรายการประกาศทั้งหมด
GET /api/v1/listings?q=...&categoryId=...&minPrice=...&maxPrice=...&location=...&sort=...&page=...&limit=...

// GET - ดึงประกาศเดียว
GET /api/v1/listings/:id

// POST - สร้างประกาศใหม่
POST /api/v1/listings
Body: { title, description, price, categoryId?, location?, images?, ... }

// PUT - แก้ไขประกาศ
PUT /api/v1/listings/:id
Body: { title?, description?, price?, ... }

// PATCH - เปลี่ยนสถานะ
PATCH /api/v1/listings/:id/status
Body: { status: "active" | "sold" | "expired" | "hidden" | "pending" | "rejected" }

// DELETE - ลบประกาศ
DELETE /api/v1/listings/:id

// DELETE - ลบรูปภาพ
DELETE /api/v1/listings/images/:imageId
```

## 💡 Tips & Best Practices

### 1. Dark Mode Support

shadcn/ui รองรับ dark mode โดยอัตโนมัติ เพียงเพิ่ม:

```javascript
// ใน App.jsx หรือ layout
<html className={isDark ? 'dark' : ''}>
```

### 2. Loading States

Component มี loading states ครบถ้วนแล้ว:

```javascript
{loading ? (
  <Loading />
) : listings.length === 0 ? (
  <EmptyState icon={Package} title="ไม่พบประกาศ" />
) : (
  // ... แสดงข้อมูล
)}
```

### 3. Error Handling

ทุก API call มี error handling:

```javascript
try {
  await api.post('/listings', data);
  toast.success('สร้างประกาศสำเร็จ');
} catch (error) {
  toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด');
}
```

### 4. Form Validation

FormModal มี validation ครบถ้วน:

```javascript
if (!formData.title.trim()) {
  toast.error('กรุณาใส่ชื่อประกาศ');
  return;
}
```

## 🐛 Troubleshooting

### ปัญหา: shadcn/ui components ไม่ทำงาน

**วิธีแก้:**
1. ตรวจสอบว่าติดตั้ง dependencies ครบ
2. ตรวจสอบ `tailwind.config.js` มีการตั้งค่าถูกต้อง
3. ตรวจสอบ `globals.css` มี @layer base สำหรับ theme

### ปัญหา: Modal ไม่แสดง

**วิธีแก้:**
1. ตรวจสอบว่า Dialog component จาก shadcn/ui ติดตั้งแล้ว
2. ตรวจสอบ z-index ใน CSS
3. ตรวจสอบ state management ของ modal (isOpen)

### ปัญหา: API ไม่ส่ง request

**วิธีแก้:**
1. ตรวจสอบ baseURL ใน api service
2. ตรวจสอบ JWT token ถูกส่งใน headers
3. เปิด Network tab ใน DevTools ดู request/response
4. ตรวจสอบ CORS settings

### ปัญหา: TypeScript errors

**วิธีแก้:**
ถ้าใช้ TypeScript อาจต้องเพิ่ม type definitions:

```typescript
// types/listing.ts
export interface Listing {
  listing_id: number;
  title: string;
  description: string;
  price: number;
  status: 'active' | 'sold' | 'expired' | 'hidden' | 'pending' | 'rejected';
  // ... เพิ่ม properties อื่นๆ
}
```

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Sonner Toast](https://sonner.emilkowal.ski/)

## 📄 License

MIT

---

**สร้างโดย:** Claude with shadcn/ui  
**เวอร์ชัน:** 2.0 (shadcn/ui + Tailwind CSS)
