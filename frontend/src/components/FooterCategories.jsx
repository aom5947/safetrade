import { getActiveSortedSubcategories } from "../utils/categoryUtils";

/**
 * Component สำหรับแสดงหมวดหมู่และหมวดหมู่ย่อย
 */
function CategoryColumn({ category, onSubcategoryClick }) {
  const activeSubcategories = getActiveSortedSubcategories(
    category.subcategories
  );

  return (
    <div>
      {/* Category Header */}
      <p className="font-semibold mb-2 flex items-center gap-1">
        <span>{category.icon || "📦"}</span>
        {category.name}
      </p>

      {/* Subcategories List */}
      <ul className="space-y-1 text-gray-600">
        {activeSubcategories.length > 0 ? (
          activeSubcategories.map((subcategory) => (
            <li key={subcategory.category_id}>
              <button
                onClick={() => onSubcategoryClick(subcategory.slug)}
                className="hover:underline"
              >
                {subcategory.name}
              </button>
            </li>
          ))
        ) : (
          <li className="text-gray-400 italic text-xs">ไม่มีหมวดย่อย</li>
        )}
      </ul>
    </div>
  );
}

/**
 * Footer Categories component
 * แสดงหมวดหมู่สินค้าทั้งหมดในส่วน footer
 * 
 * @param {Array} categories - array ของหมวดหมู่ทั้งหมด
 * @param {boolean} isLoading - สถานะการโหลดข้อมูล
 * @param {Error} error - error object ถ้ามี
 * @param {Function} onSubcategoryClick - callback เมื่อคลิกหมวดหมู่ย่อย
 */
function FooterCategories({
  categories,
  isLoading,
  error,
  onSubcategoryClick,
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-sm">
        {isLoading ? (
          <p className="col-span-full text-gray-400">กำลังโหลดหมวดหมู่...</p>
        ) : error ? (
          <p className="col-span-full text-red-600">
            เกิดข้อผิดพลาดในการโหลดหมวดหมู่
          </p>
        ) : categories.length === 0 ? (
          <p className="col-span-full text-gray-400">ยังไม่มีหมวดหมู่</p>
        ) : (
          categories.map((category) => (
            <CategoryColumn
              key={category.category_id}
              category={category}
              onSubcategoryClick={onSubcategoryClick}
            />
          ))
        )}
      </div>

      {/* Footer Bottom - Copyright & Links */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-gray-500 flex flex-wrap items-center gap-3 justify-between">
          <p>© {currentYear} SafeTrade – Marketplace</p>
          <div className="flex items-center gap-3">
            <span>นโยบายความเป็นส่วนตัว</span>
            <span>เงื่อนไขการใช้งาน</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterCategories;
