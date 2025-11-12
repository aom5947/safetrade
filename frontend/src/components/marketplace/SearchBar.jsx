const SearchBar = ({ search, setSearch, onClearFilters }) => {
    return (
        <div className="flex items-center gap-3" data-aos="fade-down">
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                className="flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ค้นหาประกาศ เช่น iPhone, Nike..."
            />
            <button
                onClick={onClearFilters}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
                ล้างตัวกรอง
            </button>
        </div>
    );
};

export default SearchBar;