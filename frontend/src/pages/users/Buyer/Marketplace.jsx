import { useState, useEffect, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// Hooks
import { useCategories } from "@/hooks/useCategories";
import { useListings } from "@/hooks/useListings";
import { useSavedListings } from "@/hooks/useSavedListings";
import { useFilter } from "@/hooks/useFilter";

// Components
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/marketplace/Breadcrumb";
import BannerSlider from "@/components/marketplace/BannerSlider";
import SearchBar from "@/components/marketplace/SearchBar";
import CategoryPills from "@/components/marketplace/CategoryPills";
import SidebarFilters from "@/components/marketplace/SidebarFilters";
import ListingsGrid from "@/components/marketplace/ListingsGrid";
import Pagination from "@/components/marketplace/Pagination";

// Assets
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import banner3 from "@/assets/banner3.png";

function Marketplace({ user }) {
  // ===== State =====
  const [sort, setSort] = useState("newest");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
  });

  // ===== Custom Hooks =====
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const {
    search,
    setSearch,
    filter,
    setFilter,
    filtered,
    clearFilters,
  } = useFilter([]);

  const { listings, loading: listingsLoading, error: listingsError } = useListings(
    filter,
    pagination,
    sort
  );

  const {
    savedListings,
    loadingIds,
    handleToggleFavorite,
  } = useSavedListings();

  // ===== Effects =====
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Update filtered listings when listings change
  const filteredListings = useMemo(() => {
    let items = [...listings];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(q));
    }

    // Price filter
    const min = Number(filter.min || 0);
    const max = Number(filter.max || 0);
    if (min) items = items.filter((i) => i.price >= min);
    if (max) items = items.filter((i) => i.price <= max);

    // Location filter
    if (filter.location.trim()) {
      const loc = filter.location.toLowerCase();
      items = items.filter((i) => i.location && i.location.toLowerCase().includes(loc));
    }

    return items;
  }, [listings, search, filter]);

  // ===== Handlers =====
  const handleCategoryChange = (category) => {
    setFilter((f) => ({
      ...f,
      category: category.slug,
      categorySlug: category.slug === "all" ? null : category.slug,
    }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((p) => ({ ...p, page: newPage }));
  };

  // ===== Computed Values =====
  const { currentCategory, parentCategory } = useMemo(() => {
    if (filter.category === "all") {
      return { currentCategory: categories[0], parentCategory: null };
    }

    // ค้นหาใน main categories
    let found = categories.find((cat) => cat.slug === filter.category);
    if (found) {
      return { currentCategory: found, parentCategory: null };
    }

    // ค้นหาใน subcategories
    for (const cat of categories) {
      if (cat.subcategories && cat.subcategories.length > 0) {
        found = cat.subcategories.find((sub) => sub.slug === filter.category);
        if (found) {
          return { currentCategory: found, parentCategory: cat };
        }
      }
    }

    return { currentCategory: categories[0], parentCategory: null };
  }, [categories, filter.category]);

  const currentCatLabel = currentCategory?.name || "ทั้งหมด";
  const displaySubcategories =
    parentCategory?.subcategories || currentCategory?.subcategories || [];

  const user_role = localStorage.getItem("user_role");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role={user_role} />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          parentCategory={parentCategory}
          currentCategory={currentCatLabel}
        />

        {/* Banner Slider */}
        <BannerSlider banners={[banner1, banner2, banner3]} />

        {/* Error Messages */}
        {(categoriesError || listingsError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {categoriesError || listingsError}
          </div>
        )}

        {/* Search Bar */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          onClearFilters={clearFilters}
        />

        {/* Category Pills + Sort */}
        <CategoryPills
          categories={categories}
          selectedCategory={filter.category}
          onCategoryChange={handleCategoryChange}
          sort={sort}
          onSortChange={handleSortChange}
        />

        {/* Content Grid with Sidebar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar Filters */}
          <SidebarFilters
            displaySubcategories={displaySubcategories}
            parentCategory={parentCategory}
            selectedCategory={filter.category}
            onCategoryChange={handleCategoryChange}
            filter={filter}
            setFilter={setFilter}
          />

          {/* Listings Grid */}
          <main className="md:col-span-9" data-aos="fade-up">
            <ListingsGrid
              listings={filteredListings}
              loading={listingsLoading}
              savedListings={savedListings}
              loadingIds={loadingIds}
              onToggleFavorite={handleToggleFavorite}
              categorySelected={filter.category !== "all"}
            />

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Marketplace;