/**
 * Contact Utilities
 * Helper functions สำหรับจัดการข้อมูลการติดต่อ
 */

/**
 * สร้าง LINE link จาก LINE ID
 * 
 * @param {string} lineId - LINE ID หรือ URL
 * @returns {string|null} LINE URL หรือ null ถ้าไม่มีข้อมูล
 */
export function getLineLink(lineId) {
  if (!lineId || lineId === "—") return null;

  // ถ้าเป็น URL อยู่แล้ว ให้ return ไปเลย
  if (lineId.startsWith("http")) {
    return lineId;
  }

  // สร้าง LINE URL
  return `https://line.me/ti/p/~${encodeURIComponent(lineId)}`;
}

/**
 * สร้าง Facebook link จาก Facebook username หรือ ID
 * 
 * @param {string} facebookId - Facebook username, ID หรือ URL
 * @returns {string|null} Facebook URL หรือ null ถ้าไม่มีข้อมูล
 */
export function getFacebookLink(facebookId) {
  if (!facebookId || facebookId === "—") return null;

  // ถ้าเป็น URL อยู่แล้ว ให้ return ไปเลย
  if (facebookId.startsWith("http")) {
    return facebookId;
  }

  // สร้าง Facebook URL
  return `https://facebook.com/${encodeURIComponent(facebookId)}`;
}

/**
 * สร้าง tel: link สำหรับโทรศัพท์
 * 
 * @param {string} phoneNumber - หมายเลขโทรศัพท์
 * @returns {string|null} tel: URL หรือ null ถ้าไม่มีข้อมูล
 */
export function getPhoneLink(phoneNumber) {
  if (!phoneNumber || phoneNumber === "—") return null;

  // ลบช่องว่างและอักขระพิเศษ (เว้น + สำหรับรหัสประเทศ)
  const cleanNumber = String(phoneNumber).replace(/[\s-()]/g, "");

  return `tel:${cleanNumber}`;
}

/**
 * Format หมายเลขโทรศัพท์ให้อ่านง่าย
 * 
 * @param {string} phoneNumber - หมายเลขโทรศัพท์
 * @returns {string} หมายเลขที่ format แล้ว
 */
export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber || phoneNumber === "—") return "—";

  // ลบอักขระที่ไม่ใช่ตัวเลข
  const digitsOnly = String(phoneNumber).replace(/\D/g, "");

  // Format สำหรับเบอร์ไทย (10 หลัก)
  if (digitsOnly.length === 10) {
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }

  // Format สำหรับเบอร์ที่มีรหัสประเทศ
  if (digitsOnly.length === 12 && digitsOnly.startsWith("66")) {
    return digitsOnly.replace(/(\d{2})(\d{2})(\d{3})(\d{4})/, "+$1 $2-$3-$4");
  }

  // ถ้าไม่ตรงรูปแบบ return ค่าเดิม
  return phoneNumber;
}

/**
 * ตรวจสอบว่าข้อมูลการติดต่อมีหรือไม่
 * 
 * @param {Object} contact - object ของข้อมูลการติดต่อ
 * @returns {boolean} true ถ้ามีข้อมูลติดต่ออย่างน้อย 1 ช่องทาง
 */
export function hasContactInfo(contact) {
  return (
    (contact.phone && contact.phone !== "—") ||
    (contact.line && contact.line !== "—") ||
    (contact.facebook && contact.facebook !== "—")
  );
}

/**
 * ดึงช่องทางการติดต่อที่มีอยู่
 * 
 * @param {Object} contact - object ของข้อมูลการติดต่อ
 * @returns {Array} array ของช่องทางที่มี
 */
export function getAvailableContactMethods(contact) {
  const methods = [];

  if (contact.phone && contact.phone !== "—") {
    methods.push({ type: "phone", value: contact.phone });
  }
  if (contact.line && contact.line !== "—") {
    methods.push({ type: "line", value: contact.line });
  }
  if (contact.facebook && contact.facebook !== "—") {
    methods.push({ type: "facebook", value: contact.facebook });
  }

  return methods;
}
