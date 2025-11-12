import { api } from "@/services/api";

/**
 * ดึงข้อมูลหมวดหมู่จาก slug
 * 
 * @param {string} slug - slug ของหมวดหมู่
 * @returns {Promise<Object|null>} ข้อมูลหมวดหมู่ หรือ null ถ้าไม่พบ
 */
export async function fetchCategoryBySlug(slug) {
  try {
    const response = await api.get(`/categories/${slug}`);
    
    if (response.data?.success) {
      return response.data.category;
    } else {
      console.warn(`⚠️ Category not found: ${slug}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Failed to fetch category by slug (${slug}):`, error);
    return null;
  }
}

/**
 * กรองและเรียง subcategories ที่ active
 * 
 * @param {Array} subcategories - array ของ subcategories
 * @returns {Array} subcategories ที่ active และเรียงแล้ว
 */
export function getActiveSortedSubcategories(subcategories) {
  if (!Array.isArray(subcategories) || subcategories.length === 0) {
    return [];
  }

  return subcategories
    .filter((subcategory) => subcategory.is_active)
    .sort((a, b) => a.display_order - b.display_order);
}
