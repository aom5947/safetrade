const SidebarFilters = ({
    displaySubcategories,
    parentCategory,
    selectedCategory,
    onCategoryChange,
    filter,
    setFilter,
}) => {
    return (
        <aside className="md:col-span-3 space-y-4" data-aos="fade-up">
            {/* Subcategories */}
            {displaySubcategories.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm p-4">
                    <h4 className="font-semibold mb-3">
                        {parentCategory ? parentCategory.name : "หมวดหมู่ย่อย"}
                    </h4>
                    <div className="space-y-2">
                        {/* ปุ่ม "ทั้งหมด" สำหรับ parent category */}
                        {parentCategory && (
                            <button
                                onClick={() => onCategoryChange(parentCategory)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${selectedCategory === parentCategory.slug
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : ""
                                    }`}
                            >
                                ทั้งหมด
                            </button>
                        )}
                        {displaySubcategories.map((sub) => (
                            <button
                                key={sub.category_id}
                                onClick={() => onCategoryChange(sub)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${selectedCategory === sub.slug
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : ""
                                    }`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ช่วงราคา */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
                <h4 className="font-semibold mb-3">ช่วงราคา (฿)</h4>
                <div className="flex items-center gap-2">
                    <input
                        value={filter.min}
                        onChange={(e) => setFilter((f) => ({ ...f, min: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="ต่ำสุด"
                        type="number"
                    />
                    <span className="text-gray-400">—</span>
                    <input
                        value={filter.max}
                        onChange={(e) => setFilter((f) => ({ ...f, max: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="สูงสุด"
                        type="number"
                    />
                </div>
            </div>

            {/* ทำเล */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
                <h4 className="font-semibold mb-3">ทำเล</h4>
                <input
                    value={filter.location}
                    onChange={(e) => setFilter((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="ค้นหาทำเล เช่น กทม., เชียงใหม่"
                />
            </div>

            {/* คำแนะนำความปลอดภัย */}
            <div className="bg-white rounded-xl border shadow-sm p-4 text-xs text-gray-600 space-y-2">
                <h4 className="font-semibold text-sm">ข้อควรระวังในการซื้อขาย</h4>
                <p>• คุยรายละเอียดให้ชัดเจนก่อนนัดรับของ</p>
                <p>• หลีกเลี่ยงการโอนมัดจำหากยังไม่ได้ตรวจสินค้า</p>
                <p>• นัดพบในพื้นที่สาธารณะและปลอดภัย</p>
            </div>
        </aside>
    );
};

export default SidebarFilters;