# C2C Marketplace System - ภาพรวมระบบ

## 📋 ชื่อระบบ

**C2C (Consumer-to-Consumer) Marketplace / Classified Ads Platform**

ระบบประกาศซื้อขายแบบ peer-to-peer คล้าย Facebook Marketplace ที่ผู้ใช้สามารถลงประกาศขายสินค้า ค้นหา และติดต่อกันเองได้

---

## 🛠️ Tech Stack

### Backend

- **Framework:** Node.js + Express.js
- **Database:** PostgreSQL (NeonDB)
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time Chat:** Socket.io
- **File Upload:** UploadThing (https://uploadthing.com/)
- **Email Service:** Nodemailer

### Frontend

- **Framework:** React 19
- **Styling:** Tailwind CSS
- **State Management:** useState, or ??
- **Form Handling:** React Hook Form
- **HTTP Client:** Axios
- **Real-time:** Socket.io-client
- **Routing:** React Router v7

### Database

- **PostgreSQL (NeonDB)** - Serverless Postgres

---

## 👥 User Roles & Permissions

### 1. Guest (ไม่ได้ล็อกอิน)

- ดูประกาศทั้งหมด
- ค้นหา/กรอง/ดูหมวดหมู่
- ติดต่อผู้ขายผ่านฟอร์ม (ใส่ชื่อ, เบอร์โทร, email)
- **ไม่สามารถ:** ลงประกาศ, แชท, รีวิว

### 2. User (ผู้ใช้ทั่วไป - ล็อกอินแล้ว)

- ทุกสิทธิ์ของ Guest
- แชทกับผู้ขาย (real-time)
- บันทึกประกาศที่สนใจ (favorites/saved listings)
- ดูประวัติการติดต่อ/แชท
- แก้ไขโปรไฟล์ของตัวเอง
- **ไม่สามารถ:** ลงประกาศขาย

### 3. Seller (ผู้ขาย)

- ทุกสิทธิ์ของ User
- **ลงประกาศขายสินค้า**
- แก้ไข/ลบประกาศของตัวเอง
- เปลี่ยนสถานะประกาศ (available, sold, expired)
- จัดการประกาศทั้งหมดของตัวเอง
- ตอบแชทผู้ซื้อ
- ดูสถิติประกาศ (views, contacts)
- รับรีวิว/เรตติ้งจากผู้ซื้อ

### 4. Admin (ผู้ดูแลระบบ)

- ทุกสิทธิ์ของ Seller
- **ดูภาพรวมระบบ** (dashboard)
- **จัดการผู้ใช้:** ดู, ระงับ, ปลดแบน, เปลี่ยน role
- **จัดการประกาศ:** ลบประกาศที่ละเมิด, ซ่อนประกาศ
- **จัดการรีวิว:** ลบรีวิวที่เป็น spam/ไม่เหมาะสม
- **จัดการหมวดหมู่:** เพิ่ม/แก้ไข/ลบหมวดหมู่สินค้า
- **ดูรายงาน:** จากผู้ใช้ (report listings/users)
- **ไม่สามารถ:** จัดการ admin คนอื่น, เปลี่ยนการตั้งค่าระบบหลัก

### 5. Super Admin (ผู้ดูแลระบบสูงสุด)

- **ทุกสิทธิ์ในระบบ**
- จัดการ Admin ทั้งหมด (เพิ่ม/ลด role)
- การตั้งค่าระบบทั้งหมด
- เข้าถึง logs และ analytics ทั้งหมด
- Backup/Restore database
---

## 📊 Database Schema

### Tables หลัก
สามารถปรับเปลี่ยน ข้อมูลใน tables ตามใจของคุณเพื่อความเหมาะสม ประสิทธิภาพ ? ถามก่อนเปลี่ยนทุกครั้ง

#### 1. users

```sql
- id (integer PRIMARY KEY, PRIMARY KEY)
-  "username" text NOT NULL,
- email (TEXT, UNIQUE, NOT NULL)
- password (VARCHAR, NOT NULL)
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
- phone (VARCHAR)
- role (ENUM: 'user', 'seller', 'admin', 'super_admin', DEFAULT: 'user')
- avatar_url (TEXT)
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');
ALTER TABLE users
ADD COLUMN status user_status DEFAULT 'active';
- email_verified (BOOLEAN, DEFAULT: false)
- rating_average (DECIMAL(3,2), DEFAULT: 0.00)
- rating_count (INTEGER, DEFAULT: 0)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. categories

```sql
- id (integer, PRIMARY KEY)
- name (VARCHAR, NOT NULL)
- slug (VARCHAR, UNIQUE, NOT NULL)
- icon (VARCHAR)
- parent_id (UUID, FOREIGN KEY -> categories.id, NULL for main category)
- display_order (INTEGER)
- is_active (BOOLEAN, DEFAULT: true)
- created_at (TIMESTAMP)
```

#### 3. listings

```sql
- id (UUID, PRIMARY KEY)
- seller_id (UUID, FOREIGN KEY -> users.id)
- category_id (UUID, FOREIGN KEY -> categories.id)
- title (VARCHAR, NOT NULL)
- description (TEXT, NOT NULL)
- price (DECIMAL(10,2), NOT NULL)
- location (VARCHAR)
- location_lat (DECIMAL(10,8))
- location_lng (DECIMAL(11,8))
- status (ENUM: 'pending', 'active', 'sold', 'expired', 'hidden', 'rejected', DEFAULT: 'pending' หรือ 'active' ตามการตั้งค่า)
- view_count (INTEGER, DEFAULT: 0)
- contact_count (INTEGER, DEFAULT: 0)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. listing_images

```sql
- id (UUID, PRIMARY KEY)
- listing_id (UUID, FOREIGN KEY -> listings.id)
- image_url (TEXT, NOT NULL)
- display_order (INTEGER)
- uploaded_at (TIMESTAMP)
```

#### 5. conversations

```sql
- id (UUID, PRIMARY KEY)
- listing_id (UUID, FOREIGN KEY -> listings.id)
- buyer_id (UUID, FOREIGN KEY -> users.id)
- seller_id (UUID, FOREIGN KEY -> users.id)
- last_message_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### 6. messages

```sql
- id (UUID, PRIMARY KEY)
- conversation_id (UUID, FOREIGN KEY -> conversations.id)
- sender_id (UUID, FOREIGN KEY -> users.id)
- message_text (TEXT, NOT NULL)
- is_read (BOOLEAN, DEFAULT: false)
- sent_at (TIMESTAMP)
```

#### 7. guest_contacts

```sql
- id (UUID, PRIMARY KEY)
- listing_id (UUID, FOREIGN KEY -> listings.id)
- contact_name (VARCHAR, NOT NULL)
- contact_phone (VARCHAR, NOT NULL)
- contact_email (VARCHAR, NOT NULL)
- message (TEXT)
- contacted_at (TIMESTAMP)
```

#### 8. reviews

```sql
- id (UUID, PRIMARY KEY)
- listing_id (UUID, FOREIGN KEY -> listings.id)
- reviewer_id (UUID, FOREIGN KEY -> users.id) -- ผู้รีวิว
- reviewed_user_id (UUID, FOREIGN KEY -> users.id) -- ผู้ถูกรีวิว (seller)
- rating (INTEGER, CHECK: 1-5)
- comment (TEXT)
- is_spam (BOOLEAN, DEFAULT: false) -- ตรวจสอบโดย admin
- created_at (TIMESTAMP)
```

#### 9. saved_listings

```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY -> users.id)
- listing_id (UUID, FOREIGN KEY -> listings.id)
- saved_at (TIMESTAMP)
- UNIQUE(user_id, listing_id)
```

#### 10. reports

```sql
- id (UUID, PRIMARY KEY)
- reporter_id (UUID, FOREIGN KEY -> users.id, NULL for guest)
- reported_type (ENUM: 'listing', 'user', 'review')
- reported_id (UUID) -- ID ของสิ่งที่ถูกรายงาน
- reason (TEXT, NOT NULL)
- status (ENUM: 'pending', 'reviewing', 'resolved', 'rejected')
- resolved_by (UUID, FOREIGN KEY -> users.id)
- resolved_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### 11. activity_logs

```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY -> users.id)
- action (VARCHAR) -- 'create_listing', 'update_listing', 'delete_user', etc.
- target_type (VARCHAR) -- 'listing', 'user', 'review', etc.
- target_id (UUID)
- details (JSONB)
- ip_address (VARCHAR)
- created_at (TIMESTAMP)
```

---

## 🎯 Core Features (ละเอียด)

### 1. ระบบลงประกาศ/รายการสินค้า (Listing Management)

#### Frontend Components:

- `CreateListingPage` - หน้าสร้างประกาศใหม่
- `EditListingPage` - หน้าแก้ไขประกาศ
- `ListingDetailPage` - หน้ารายละเอียดประกาศ
- `MyListingsPage` - หน้าจัดการประกาศของตัวเอง
- `ImageUploader` - component อัปโหลดรูปภาพ
- `CategorySelector` - component เลือกหมวดหมู่

#### Backend Endpoints:

```
POST   /api/listings              - สร้างประกาศใหม่ (seller only)
GET    /api/listings              - ดูประกาศทั้งหมด (public)
GET    /api/listings/:id          - ดูประกาศเดี่ยว (public)
PUT    /api/listings/:id          - แก้ไขประกาศ (owner only)
DELETE /api/listings/:id          - ลบประกาศ (owner/admin)
PATCH  /api/listings/:id/status   - เปลี่ยนสถานะ (sold/expired)
POST   /api/listings/:id/images   - อัปโหลดรูปภาพ
DELETE /api/listings/:id/images/:imageId - ลบรูปภาพ
```

#### Features:

- อัปโหลดรูปภาพหลายรูป (แนะนำ 5-10 รูป)
- ตั้งราคา
- เลือกหมวดหมู่
- ระบุตำแหน่ง (location)
- กำหนดวันหมดอายุประกาศ (auto-expire)
- แก้ไข/ลบประกาศได้เฉพาะเจ้าของ
- เปลี่ยนสถานะ: active → sold/expired

---

### 2. ระบบค้นหา/กรอง/หมวดหมู่

#### Frontend Components:

- `SearchBar` - ช่องค้นหา
- `FilterPanel` - แผงกรองข้อมูล
- `CategoryMenu` - เมนูหมวดหมู่
- `SortDropdown` - เรียงลำดับ
- `ListingGrid` - แสดงผลประกาศแบบ grid

#### Backend Endpoints:

```
GET /api/listings?
  q=keyword
  &category=uuid
  &min_price=1000
  &max_price=50000
  &location=bangkok
  &sort=newest|price_low|price_high
  &page=1
  &limit=20

GET /api/categories              - ดูหมวดหมู่ทั้งหมด
GET /api/categories/:slug        - ดูประกาศในหมวดหมู่
```

#### Search/Filter Options:

- **Keyword Search:** ค้นจาก title, description
- **Category Filter:** กรองตามหมวดหมู่หลัก/หมวดหมู่ย่อย
- **Price Range:** ราคาต่ำสุด - สูงสุด
- **Location:** ค้นตามพื้นที่
- **Sort Options:**
  - ล่าสุด (newest)
  - ราคาต่ำไปสูง (price_low)
  - ราคาสูงไปต่ำ (price_high)
  - ดูมากที่สุด (most_viewed)
- **Pagination:** แบ่งหน้า

#### Categories Example:

```
📱 Electronics
  ├─ Phones
  ├─ Laptops
  ├─ Cameras

🚗 Vehicles
  ├─ Cars
  ├─ Motorcycles
  ├─ Bicycles

🏠 Home & Living
  ├─ Furniture
  ├─ Appliances

👕 Fashion
  ├─ Clothing
  ├─ Shoes
  ├─ Accessories
```

---

### 3. ระบบแชทโต้ตอบ (Real-time Chat)

#### Frontend Components:

- `ConversationList` - รายการแชททั้งหมด
- `ChatBox` - กล่องแชท
- `MessageBubble` - ข้อความแต่ละข้อ
- `ChatNotification` - แจ้งเตือนข้อความใหม่

#### Backend Endpoints:

```
GET    /api/conversations              - รายการแชททั้งหมด
GET    /api/conversations/:id          - ข้อความในแชท
POST   /api/conversations              - เริ่มแชทใหม่
POST   /api/conversations/:id/messages - ส่งข้อความ
PATCH  /api/messages/:id/read          - ทำเครื่องหมายว่าอ่านแล้ว
```

#### WebSocket Events:

```javascript
// Client → Server
socket.emit("join_conversation", { conversationId });
socket.emit("send_message", { conversationId, message });
socket.emit("typing", { conversationId });

// Server → Client
socket.on("new_message", (message) => {});
socket.on("user_typing", (data) => {});
socket.on("message_read", (messageId) => {});
```

#### Features:

- แชทแบบ real-time ด้วย Socket.io
- แจ้งเตือนข้อความใหม่
- แสดงสถานะ "กำลังพิมพ์..."
- เก็บประวัติแชท
- แยกแชทตาม listing
- ทำเครื่องหมายอ่าน/ยังไม่อ่าน

---

### 4. ติดต่อกลับแบบไม่ต้อง Login (Guest Contact)

#### Frontend Components:

- `GuestContactForm` - ฟอร์มติดต่อสำหรับผู้ที่ไม่ได้ล็อกอิน

#### Backend Endpoints:

```
POST /api/listings/:id/contact   - ส่งข้อมูลติดต่อ (public)
GET  /api/listings/:id/contacts  - ดูรายการติดต่อ (seller only)
```

#### Form Fields:

```javascript
{
  contact_name: "string",     // required
  contact_phone: "string",    // required
  contact_email: "string",    // required
  message: "text"            // optional
}
```

#### Features:

- Guest สามารถติดต่อผู้ขายได้โดยไม่ต้องล็อกอิน
- เจ้าของประกาศจะได้รับ email แจ้งเตือน
- เจ้าของประกาศเห็นรายการติดต่อในหน้า dashboard
- นับจำนวนครั้งที่มีคนติดต่อ (contact_count)

---

### 5. ระบบรีวิว/เรตติ้ง (Review & Rating)

#### Frontend Components:

- `ReviewForm` - ฟอร์มรีวิว
- `ReviewList` - รายการรีวิว
- `StarRating` - แสดงดาว
- `UserRatingBadge` - แสดงคะแนนรวมของผู้ใช้

#### Backend Endpoints:

```
POST   /api/listings/:id/reviews      - สร้างรีวิว (user only)
GET    /api/listings/:id/reviews      - ดูรีวิวของประกาศ
GET    /api/users/:id/reviews         - ดูรีวิวของผู้ใช้
DELETE /api/reviews/:id               - ลบรีวิว (admin only)
PATCH  /api/reviews/:id/spam          - ทำเครื่องหมายเป็น spam
```

#### Features:

- **ให้คะแนน 1-5 ดาว**
- **เขียนความคิดเห็น**
- รีวิวได้เฉพาะผู้ที่แชทกับผู้ขายแล้ว (มี conversation)
- รีวิวได้ครั้งเดียวต่อประกาศ
- แสดงคะแนนเฉลี่ยของผู้ขาย
- Admin สามารถลบรีวิว spam ได้
- **คัดกรอง spam (ในอนาคต):**
  - Rate limiting (จำกัดจำนวนรีวิวต่อวัน)
  - ตรวจสอบรีวิวซ้ำๆ

---

### 6. การจัดการประกาศ (Listing Management)

#### Seller Dashboard Components:

- `SellerDashboard` - หน้าหลัก seller
- `ListingStats` - สถิติประกาศ
- `ListingStatusToggle` - เปลี่ยนสถานะ

#### Features:

- **สถานะประกาศ:**

  - `active` - กำลังขาย
  - `sold` - ขายแล้ว
  - `expired` - หมดอายุ
  - `hidden` - ซ่อน (โดย admin)

- **การจัดการ:**

  - แก้ไขข้อมูล (title, description, price, images)
  - เปลี่ยนสถานะเป็น "ขายแล้ว"
  - ลบประกาศ (soft delete)
  - ดูสถิติ (views, contacts, saves)

- **Auto-expire:**
  - ประกาศหมดอายุอัตโนมัติหลังจาก X วัน (เช่น 30, 60, 90 วัน)
  - Cron job ตรวจสอบและอัปเดตสถานะทุกวัน

---

### 7. ระบบ Listing Moderation (ตัวเลือก 2 แบบ)

#### 🎯 ควรเลือกแบบไหน?

คำถาม: **"Seller ลงประกาศแล้วต้องรอ Admin อนุมัติไหม?"**

มี 2 แบบให้เลือก:

---

#### ✅ Option 1: Direct Publish (แนะนำ)

**ลงแล้วขึ้นเลย ไม่ต้องรอ Admin**

##### การทำงาน:

```
1. Seller สร้างประกาศ
2. บันทึกใน database → status: 'active'
3. ปรากฏในหน้าหลักทันที
4. Admin moderation ทีหลัง (ผ่าน report system)
```

##### ข้อดี:

- ✅ รวดเร็ว ผู้ใช้ได้รับ feedback ทันที
- ✅ ไม่ต้องรอ admin ทำให้ marketplace มีชีวิตชีวา
- ✅ Admin ทำงานน้อยกว่า (ดูเฉพาะรายงาน)
- ✅ เหมาะกับระบบที่มีผู้ใช้เยอะ
- ✅ เหมือน Facebook Marketplace, OLX, Kaidee

##### ข้อเสีย:

- ❌ อาจมีประกาศไม่เหมาะสมขึ้นก่อน (แก้ได้โดย report + auto-hide)
- ❌ ต้องพึ่งพา report system

##### Database Status Flow:

```
active → sold / expired / hidden (by admin)
```

##### Implementation:

```javascript
// Backend: Create Listing
POST /api/listings
→ status: 'active' (ตั้งค่า default)
→ Response: { success: true, listing, message: "ประกาศของคุณถูกเผยแพร่แล้ว" }

// ไม่ต้องมี approve endpoint
```

---

#### ⏳ Option 2: Moderation Queue

**ต้องรอ Admin อนุมัติก่อนขึ้น**

##### การทำงาน:

```
1. Seller สร้างประกาศ
2. บันทึกใน database → status: 'pending'
3. ส่งไปที่ Admin Moderation Queue
4. Admin ตรวจสอบ → อนุมัติ (active) หรือปฏิเสธ (rejected)
5. ประกาศปรากฏในหน้าหลัก
```

##### ข้อดี:

- ✅ ควบคุมคุณภาพได้ดี
- ✅ ไม่มีประกาศไม่เหมาะสมขึ้นเลย
- ✅ เหมาะกับ marketplace เฉพาะทาง
- ✅ เหมือน marketplace ที่มี quality control สูง

##### ข้อเสีย:

- ❌ ช้า seller ต้องรอ (อาจใช้เวลา 1-24 ชม.)
- ❌ Admin ต้องทำงานเยอะ (ถ้ามีประกาศเยอะ admin จะทำไม่ทัน)
- ❌ ผู้ใช้อาจเบื่อถ้ารอนาน
- ❌ ต้องมี notification system ที่ดี

##### Database Status Flow:

```
pending → active / rejected (by admin)
active → sold / expired / hidden
```

##### Additional Endpoints:

```javascript
// Admin: Get Pending Listings
GET /api/admin/listings/pending

// Admin: Approve Listing
PATCH /api/admin/listings/:id/approve
→ status: 'pending' → 'active'
→ แจ้ง seller ว่าประกาศได้รับการอนุมัติ (email/notification)

// Admin: Reject Listing
PATCH /api/admin/listings/:id/reject
Body: { reason: "เหตุผลที่ปฏิเสธ" }
→ status: 'pending' → 'rejected'
→ แจ้ง seller พร้อมเหตุผล
```

##### Database Schema Changes:

```sql
-- เพิ่มฟิลด์ใน listings table
- approved_by (UUID, FOREIGN KEY -> users.id, NULL)
- approved_at (TIMESTAMP, NULL)
- rejection_reason (TEXT, NULL)
```

---

#### 💡 คำแนะนำ:

**ถ้าคุณทำ marketplace ทั่วไป:**
→ **ใช้ Option 1: Direct Publish**

- เหมาะกับระบบที่เริ่มต้น
- มี seller/admin น้อย
- ต้องการความเร็ว

**ถ้าคุณทำ marketplace เฉพาะทาง:**
→ **ใช้ Option 2: Moderation Queue**

- เช่น ขายของสะสม, ของโบราณ, อสังหาริมทรัพย์
- ต้องการควบคุมคุณภาพสูง
- มี admin team พร้อมดูแล

---

#### 🔄 Hybrid Option (แนะนำสำหรับระยะยาว):

เริ่มด้วย **Option 1** แล้วเพิ่ม "Trusted Seller" system:

```
- Seller ใหม่ → status: 'pending' (รอ admin อนุมัติ 1-3 ประกาศแรก)
- Seller ที่ผ่านการตรวจสอบ → status: 'active' (ขึ้นเลย)
- Seller ที่มี rating สูง → "Verified Badge"
```

Implementation:

```javascript
// เพิ่มฟิลด์ใน users table
- is_verified (BOOLEAN, DEFAULT: false)
- listing_count (INTEGER, DEFAULT: 0)

// Logic เวลาสร้างประกาศ
if (user.is_verified || user.listing_count >= 3) {
  listing.status = 'active'
} else {
  listing.status = 'pending'
}
```

---

### 8. ระบบ Admin & Super Admin

#### Admin Dashboard Features:

##### A. Dashboard Overview

```
📊 Statistics
- จำนวนผู้ใช้ทั้งหมด (total users)
- จำนวนประกาศทั้งหมด (total listings)
- ประกาศใหม่วันนี้ (new listings today)
- รายงานที่รอดำเนินการ (pending reports)
- ผู้ใช้ใหม่เดือนนี้ (new users this month)
```

##### B. User Management

```
Frontend Components:
- AdminUserList
- UserDetailModal
- UserActionButtons

Backend Endpoints:
GET    /api/admin/users              - รายการผู้ใช้ทั้งหมด
GET    /api/admin/users/:id          - รายละเอียดผู้ใช้
PATCH  /api/admin/users/:id/ban      - แบน/ปลดแบนผู้ใช้
PATCH  /api/admin/users/:id/role     - เปลี่ยน role (super admin only)
DELETE /api/admin/users/:id          - ลบผู้ใช้ (super admin only)

Features:
- ดูรายชื่อผู้ใช้ทั้งหมด
- ค้นหาผู้ใช้ (email, ชื่อ, phone)
- กรองตาม role, status
- ระงับผู้ใช้ (ban/suspend)
- ดูประวัติการกระทำ (activity logs)
- เปลี่ยน role: user ↔ seller (admin)
- เปลี่ยน role: user/seller ↔ admin (super admin only)
```

##### C. Listing Management

```
Frontend Components:
- AdminListingList
- ListingActionMenu
- ListingReportReview

Backend Endpoints:
GET    /api/admin/listings           - รายการประกาศทั้งหมด
PATCH  /api/admin/listings/:id/hide  - ซ่อนประกาศ
DELETE /api/admin/listings/:id       - ลบประกาศ

Features:
- ดูประกาศทั้งหมด (รวมที่ซ่อน/ลบ)
- ค้นหา/กรองประกาศ
- ซ่อนประกาศที่ละเมิดกฎ
- ลบประกาศ (soft delete)
- ดูประวัติการแก้ไข
- ดูรายงานที่เกี่ยวข้อง
```

##### D. Review Management

```
Frontend Components:
- AdminReviewList
- ReviewModerationPanel

Backend Endpoints:
GET    /api/admin/reviews            - รายการรีวิวทั้งหมด
DELETE /api/admin/reviews/:id        - ลบรีวิว
PATCH  /api/admin/reviews/:id/spam   - ทำเครื่องหมาย spam

Features:
- ดูรีวิวทั้งหมด
- กรองรีวิวที่มีปัญหา
- ลบรีวิวที่เป็น spam
- ลบรีวิวที่ไม่เหมาะสม
```

##### E. Category Management

```
Frontend Components:
- CategoryManager
- CategoryForm

Backend Endpoints:
GET    /api/admin/categories         - รายการหมวดหมู่
POST   /api/admin/categories         - สร้างหมวดหมู่ใหม่
PUT    /api/admin/categories/:id     - แก้ไขหมวดหมู่
DELETE /api/admin/categories/:id     - ลบหมวดหมู่

Features:
- เพิ่ม/แก้ไข/ลบหมวดหมู่
- จัดเรียงลำดับการแสดงผล
- เปิด/ปิดการใช้งานหมวดหมู่
- สร้างหมวดหมู่ย่อย (subcategories)
```

##### F. Report Management

```
Frontend Components:
- ReportList
- ReportDetailModal
- ReportActionButtons

Backend Endpoints:
GET   /api/admin/reports             - รายการรายงาน
GET   /api/admin/reports/:id         - รายละเอียดรายงาน
PATCH /api/admin/reports/:id/status  - อัปเดตสถานะ

Report Status Flow:
pending → reviewing → resolved/rejected

Features:
- ดูรายงานทั้งหมด
- กรองตามประเภท (listing/user/review)
- กรองตามสถานะ
- ดูรายละเอียดสิ่งที่ถูกรายงาน
- ดำเนินการ (ลบ/ซ่อน/แบน)
- เปลี่ยนสถานะรายงาน
```

##### G. Super Admin Only Features

```
- จัดการ admin อื่นๆ (เพิ่ม/ลบ admin role)
- ดู activity logs ทั้งหมด
- การตั้งค่าระบบ (system settings)
- ดู analytics แบบละเอียด
- Export ข้อมูล
- Backup/Restore database
```

---

## 🔐 Authentication & Authorization

### Authentication Flow:

#### 1. Register

```
POST /api/auth/register
Body: { email, password, full_name, phone }
→ สร้าง user role: 'user'
→ ส่ง verification email
```

#### 2. Login

```
POST /api/auth/login
Body: { email, password }
→ ตรวจสอบ email & password
→ ตรวจสอบ is_active && !is_banned
→ สร้าง JWT token
→ Return: { token, user }
```

#### 3. Email Verification

```
GET /api/auth/verify-email?token=xxx
→ ทำเครื่องหมาย email_verified = true
```

#### 4. Forgot Password

```
POST /api/auth/forgot-password
Body: { email }
→ ส่ง reset password link

POST /api/auth/reset-password
Body: { token, new_password }
→ อัปเดต password
```

### Middleware:

```javascript
// middleware/auth.js
-requireAuth() - // ต้อง login
  requireSeller() - // ต้องเป็น seller, admin, super_admin
  requireAdmin() - // ต้องเป็น admin, super_admin
  requireSuperAdmin() - // ต้องเป็น super_admin เท่านั้น
  optionalAuth(); // อนุญาตทั้ง login และ guest
```

### Role Upgrade Flow:

```
1. User สมัครใหม่ → role: 'user'
2. User คลิก "เป็นผู้ขาย" → role: 'seller'
3. Super Admin เลื่อน seller → admin
4. Super Admin เลื่อน admin → super_admin
```

---

## 📁 Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # PostgreSQL connection
│   │   ├── jwt.js             # JWT config
│   │   └── upload.js          # File upload config
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   ├── Category.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   ├── Review.js
│   │   └── Report.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   ├── categoryController.js
│   │   ├── chatController.js
│   │   ├── reviewController.js
│   │   ├── adminController.js
│   │   └── userController.js
│   │
│   ├── middlewares/
│   │   ├── auth.js            # Authentication
│   │   ├── roleCheck.js       # Authorization
│   │   ├── validate.js        # Input validation
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── listing.routes.js
│   │   ├── category.routes.js
│   │   ├── chat.routes.js
│   │   ├── review.routes.js
│   │   ├── admin.routes.js
│   │   └── user.routes.js
│   │
│   ├── services/
│   │   ├── emailService.js    # Send emails
│   │   ├── uploadService.js   # UploadThing integration
│   │   ├── searchService.js   # Search logic
│   │   └── notificationService.js
│   │
│   ├── utils/
│   │   ├── validators.js      # Custom validators
│   │   ├── helpers.js
│   │   └── constants.js
│   │
│   ├── socket/
│   │   └── chatSocket.js      # WebSocket handlers
│   │
│   └── app.js                 # Express app
│
├── migrations/                # Database migrations
├── seeds/                     # Seed data
├── tests/
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── listings/
│   │   │   ├── ListingCard.jsx
│   │   │   ├── ListingGrid.jsx
│   │   │   ├── ListingForm.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── FilterPanel.jsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ConversationList.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   └── MessageBubble.jsx
│   │   │
│   │   ├── reviews/
│   │   │   ├── ReviewForm.jsx
│   │   │   ├── ReviewList.jsx
│   │   │   └── StarRating.jsx
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagement.jsx
│   │       ├── ListingManagement.jsx
│   │       └── ReportManagement.jsx
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ListingDetailPage.jsx
│   │   ├── CreateListingPage.jsx
│   │   ├── MyListingsPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── admin/
│   │       └── AdminPage.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useChat.js
│   │   └── useListings.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ChatContext.jsx
│   │
│   ├── services/
│   │   ├── api.js             # Axios instance
│   │   ├── authApi.js
│   │   ├── listingApi.js
│   │   └── chatApi.js
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   │
│   └── App.jsx
│
├── public/
└── package.json
```

---

## 🔄 Complete User Flows

### Flow 1: User สมัครและลงประกาศครั้งแรก

```
1. User → หน้า Register → สมัครสมาชิก (role: 'user')
2. ตรวจสอบ email verification
3. Login เข้าสู่ระบบ
4. คลิก "เป็นผู้ขาย" → role เปลี่ยนเป็น 'seller'
5. กดปุ่ม "ลงประกาศ"
6. กรอกข้อมูล: title, description, price, category, location
7. อัปโหลดรูปภาพ
8. บันทึก → status: 'active'
9. ประกาศแสดงในหน้าหลัก
```

### Flow 2: Guest ติดต่อผู้ขาย (ไม่ได้ login)

```
1. Guest → เข้าดูประกาศ
2. คลิก "ติดต่อผู้ขาย"
3. กรอกฟอร์ม: ชื่อ, เบอร์โทร, email, ข้อความ
4. ส่งข้อมูล → บันทึกใน guest_contacts table
5. ผู้ขายได้รับ email แจ้งเตือน
6. ผู้ขายเห็นรายการติดต่อในหน้า dashboard
```

### Flow 3: User แชทกับผู้ขาย (login แล้ว)

```
1. User (login) → เข้าดูประกาศ
2. คลิก "แชท"
3. สร้าง conversation ใหม่ (ถ้ายังไม่มี)
4. เปิดหน้าแชท
5. พิมพ์ข้อความ → ส่งผ่าน WebSocket
6. ผู้ขายได้รับข้อความแบบ real-time
7. ผู้ขายตอบกลับ
8. บันทึกประวัติแชทใน database
```

### Flow 4: User รีวิวผู้ขาย

```
1. User ที่เคยแชทกับผู้ขาย → คลิก "รีวิว"
2. เลือกคะแนน 1-5 ดาว
3. เขียนความคิดเห็น
4. บันทึก → เพิ่มใน reviews table
5. อัปเดตคะแนนเฉลี่ยของผู้ขาย (rating_average, rating_count)
6. แสดงรีวิวในโปรไฟล์ผู้ขาย
```

### Flow 5: Admin จัดการรายงาน

```
1. User รายงานประกาศ → สร้าง report (status: 'pending')
2. Admin login → เข้า Admin Dashboard
3. เห็นรายงานใหม่
4. คลิกดูรายละเอียด
5. ตรวจสอบประกาศที่ถูกรายงาน
6. ตัดสินใจ:
   - ซ่อนประกาศ (hidden)
   - ลบประกาศ
   - แบนผู้ใช้
   - ปฏิเสธรายงาน (rejected)
7. อัปเดตสถานะรายงาน → 'resolved'
8. บันทึก activity log
```

### Flow 6: Auto-expire ประกาศ

```
1. Cron Job ทำงานทุกวัน 00:00
2. Query listings ที่ expires_at < NOW() และ status = 'active'
3. อัปเดต status → 'expired'
4. ส่ง email แจ้งผู้ขาย (optional)
5. ผู้ขายสามารถ "ต่ออายุ" ประกาศได้
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

```
✅ Database setup (PostgreSQL + NeonDB)
✅ User authentication (register, login, JWT)
✅ Basic user profile
✅ Role system (user, seller, admin, super_admin)
✅ Email verification
```

### Phase 2: Core Listing Features (Week 3-4)

```
✅ Category management
✅ Create/Edit/Delete listing
✅ Image upload
✅ Listing detail page
✅ Search & filter
✅ Pagination
```

### Phase 3: Communication (Week 5-6)

```
✅ Guest contact form
✅ Real-time chat (Socket.io)
✅ Conversation management
✅ Message notifications
✅ Email notifications
```

### Phase 4: Social Features (Week 7-8)

```
✅ Review & rating system
✅ Save/favorite listings
✅ User profile with reviews
✅ Seller dashboard
```

### Phase 5: Admin Panel (Week 9-10)

```
✅ Admin dashboard
✅ User management
✅ Listing moderation
✅ Review moderation
✅ Report system
✅ Activity logs
```

### Phase 6: Polish & Optimization (Week 11-12)

```
✅ Auto-expire listings
✅ Performance optimization
✅ SEO optimization
✅ Rate limiting & spam prevention
✅ Error handling
✅ Testing
✅ Documentation
```

---

## 🔒 Security Considerations

### 1. Authentication & Authorization

- **JWT tokens only** (access token + refresh token)
- Password hashing (bcrypt)
- Email verification required
- Rate limiting on login attempts
- Role-based access control (RBAC)

### 2. Input Validation

- Validate all inputs (express-validator)
- Sanitize HTML (DOMPurify)
- Prevent SQL injection (parameterized queries)
- Prevent XSS attacks

### 3. File Upload Security

- Validate file types (images only)
- Limit file size (e.g., 5MB per image)
- Use UploadThing's built-in security features
- UploadThing handles file storage and CDN automatically
- Configure allowed file types in UploadThing config

### 4. API Security

- CORS configuration
- Rate limiting (express-rate-limit)
- Helmet.js (security headers)
- HTTPS only in production

### 5. Data Privacy

- Hash passwords (never store plain text)
- Don't expose sensitive data in API responses
- Soft delete for GDPR compliance
- Activity logging for auditing

---

## 📊 Performance Optimization

### Database

- **Indexing:**
  - listings.seller_id
  - listings.category_id
  - listings.status
  - listings.created_at
  - conversations.buyer_id + seller_id
  - messages.conversation_id
- **Query Optimization:**
  - Use SELECT specific columns (not SELECT \*)
  - Implement pagination
  - Use database views for complex queries
- **Caching:**
  - Redis for frequently accessed data
  - Cache category list
  - Cache popular listings

### Frontend

- **Code Splitting:** React.lazy() + Suspense
- **Image Optimization:**
  - Lazy loading images
  - Use WebP format
  - Responsive images (srcset)
  - CDN for images
- **Bundle Optimization:**
  - Tree shaking
  - Minification
  - Gzip compression

### Backend

- **Caching:** Redis
- **Database Connection Pooling:** pg-pool
- **Async Processing:** Bull Queue (for emails, notifications)
- **Load Balancing:** (in production)

---

## 🧪 Testing Strategy

### Backend Testing

```
- Unit Tests (Jest)
  - Controllers
  - Services
  - Utilities

- Integration Tests
  - API endpoints
  - Database operations
  - Authentication flow

- E2E Tests (Supertest)
  - Complete user flows
```

### Frontend Testing

```
- Component Tests (React Testing Library)
- Integration Tests (user interactions)
- E2E Tests (Cypress/Playwright)
  - Login flow
  - Create listing flow
  - Chat flow
```

---

## 📝 API Documentation

### ใช้เครื่องมือ:

- **Swagger/OpenAPI:** `/api-docs`
- **Postman Collection**

### Documentation Sections:

```
1. Authentication endpoints
2. User endpoints
3. Listing endpoints
4. Category endpoints
5. Chat endpoints
6. Review endpoints
7. Admin endpoints
8. Error codes & responses
```

---

## 📸 UploadThing Integration

### Backend Setup

#### 1. Install Package

```bash
npm install uploadthing
```

#### 2. Create UploadThing Route (src/routes/uploadthing.routes.js)

```javascript
import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  // Image uploader for listings
  listingImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      // Verify JWT token
      const user = req.user; // from auth middleware
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),
};
```

#### 3. Register Route in Express

```javascript
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./routes/uploadthing.routes.js";

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  })
);
```

---

### Frontend Setup

#### 1. Install Packages

```bash
npm install uploadthing @uploadthing/react
```

#### 2. Create UploadThing Component (src/components/listings/ImageUploader.jsx)

```javascript
import { UploadButton, UploadDropzone } from "@uploadthing/react";

export function ImageUploader({ onUploadComplete }) {
  return (
    <UploadDropzone
      endpoint="listingImage"
      onClientUploadComplete={(res) => {
        console.log("Files: ", res);
        onUploadComplete(res);
      }}
      onUploadError={(error) => {
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
}
```

#### 3. Use in Create Listing Form

```javascript
const [uploadedImages, setUploadedImages] = useState([]);

<ImageUploader
  onUploadComplete={(files) => {
    const imageUrls = files.map((f) => f.url);
    setUploadedImages(imageUrls);
  }}
/>;
```

---

### UploadThing Features

- ✅ Automatic CDN delivery
- ✅ Image optimization
- ✅ Progress tracking
- ✅ Type validation (images only)
- ✅ Size limit (configurable)
- ✅ Multiple file upload
- ✅ No need for AWS S3/Cloudinary setup

---

## 🌐 Deployment

### Backend (Node.js)

- **Platform:** Railway.com หรือ Render.com
- **Environment Variables:** .env file
- **Process Manager:** PM2 (optional, Railway/Render มี built-in)

#### Railway.com Deployment:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add environment variables (ใน Railway dashboard)
DATABASE_URL
JWT_SECRET
UPLOADTHING_SECRET
...

# 5. Deploy
railway up
```

#### Render.com Deployment:

```
1. Connect GitHub repository
2. Select Node.js environment
3. Build command: npm install
4. Start command: npm start
5. Add environment variables in Render dashboard
6. Deploy
```

### Frontend (React)

- **Platform:** Vercel.com
- **Build:** npm run build
- **CDN:** Automatic (Vercel Edge Network)
- **Environment Variables:** Configure in Vercel dashboard

#### Vercel Deployment:

```bash
# 1. Install Vercel CLI (optional)
npm install -g vercel

# 2. Deploy via GitHub (Recommended)
- Connect GitHub repository to Vercel
- Vercel auto-detects React
- Set environment variables:
  * REACT_APP_API_URL (backend URL)
  * REACT_APP_UPLOADTHING_APP_ID
- Deploy automatically on git push

# 3. Or deploy via CLI
vercel
vercel --prod
```

### Database

- **NeonDB (PostgreSQL):** Already serverless
- **Backup:** Automated daily backups
- **Migrations:** Run before deployment

### File Storage

- **UploadThing** (https://uploadthing.com/)
- Easy integration with React and Next.js
- Built-in image optimization
- Configure max file size and allowed types

---

## 📈 Future Enhancements

### Phase 2 Features (Post-MVP):

```
1. Payment Gateway Integration
   - Escrow service
   - Secure payment

2. Mobile Apps
   - React Native
   - Push notifications

3. Advanced Search
   - Elasticsearch
   - Location-based search (GPS)
   - AI-powered recommendations

4. Spam Detection
   - Machine learning models
   - Auto-moderation

5. Social Features
   - Follow sellers
   - Share listings (social media)
   - Wishlist

6. Analytics Dashboard
   - Google Analytics
   - Custom analytics for sellers

7. Multi-language Support
   - i18n (internationalization)

8. Advanced Admin Tools
   - Bulk operations
   - Custom reporting
   - Email campaigns
```

---

## 🎯 Summary

ระบบนี้เป็น **C2C Marketplace Platform** แบบ full-stack ที่มีฟีเจอร์ครบถ้วน:

### ✅ Core Features:

- ลงประกาศขายสินค้า (มี 2 ตัวเลือก: ขึ้นเลย หรือ รอ admin อนุมัติ)
- ค้นหา/กรอง/หมวดหมู่
- แชท real-time
- ติดต่อแบบ guest (ไม่ต้อง login)
- รีวิว/เรตติ้ง
- ระบบ admin ที่ครบครัน

### 🔑 Key Technologies:

- **Backend:** Node.js + Express + PostgreSQL (NeonDB)
- **Frontend:** React 19 + Tailwind CSS
- **Real-time:** Socket.io
- **File Upload:** UploadThing
- **Authentication:** JWT only (no OAuth)
- **Deployment:**
  - Backend: Railway.com / Render.com
  - Frontend: Vercel.com

### 👥 User Roles:

- Guest → User → Seller → Admin → Super Admin

### 🎨 Best Practices:

- RESTful API design
- JWT authentication (no OAuth)
- Role-based authorization
- Input validation & sanitization
- Error handling
- Logging & monitoring
- Testing
- Documentation

---

## 📚 คำแนะนำเพิ่มเติม

1. **เริ่มจาก MVP (Minimum Viable Product):**

   - ทำ Phase 1-3 ก่อน (Authentication, Listings, Communication)
   - Deploy และทดสอบกับผู้ใช้จริง
   - ค่อยๆ เพิ่มฟีเจอร์ตาม Phase ต่อไป

2. **Database Migrations:**

   - ใช้ migration tool เช่น Knex.js หรือ Sequelize
   - Version control สำหรับ schema changes

3. **Environment Variables:**

   ```env
   # Database
   DATABASE_URL=your_neondb_url

   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret

   # UploadThing
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id

   # Email (Nodemailer/SendGrid)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000

   # Node Environment
   NODE_ENV=development
   ```

4. **Testing:**

   - Write tests ควบคู่กับการเขียนโค้ด
   - Test coverage อย่างน้อย 80%

5. **Documentation:**

   - อัปเดต README.md
   - Comment โค้ดที่ซับซ้อน
   - API documentation

6. **Code Quality:**
   - ESLint + Prettier
   - Code review

---
