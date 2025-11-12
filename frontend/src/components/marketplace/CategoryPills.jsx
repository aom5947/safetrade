import { FiFilter, FiChevronDown } from "react-icons/fi";

const CategoryPills = ({ categories, selectedCategory, onCategoryChange, sort, onSortChange }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            {/* Categories Pills */}
            <div className="flex flex-wrap items-center gap-2" data-aos="fade-right">
                {categories.map((c) => (
                    <button
                        key={c.category_id}
                        onClick={() => onCategoryChange(c)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${selectedCategory === c.slug
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white hover:bg-gray-50"
                            }`}
                    >
                        {c.icon && <span className="mr-1">{c.icon}</span>}
                        {c.name}
                    </button>
                ))}
            </div>

            {/* Filter & Sort */}
            <div className="flex items-center gap-2" data-aos="fade-left">
                <button className="px-3 py-2 rounded-lg border bg-white flex items-center gap-2">
                    <FiFilter /> ตัวกรองทั้งหมด
                </button>
                <div className="relative">
                    <select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="appearance-none px-3 py-2 pr-8 rounded-lg border bg-white"
                    >
                        <option value="newest">มาใหม่ล่าสุด</option>
                        <option value="price_low">ราคาต่ำไปสูง</option>
                        <option value="price_high">ราคาสูงไปต่ำ</option>
                        <option value="most_viewed">ดูมากที่สุด</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
            </div>
        </div>
    );
};

export default CategoryPills;