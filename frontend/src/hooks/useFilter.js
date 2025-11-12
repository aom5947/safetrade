import { useState, useMemo } from "react";

export const useFilter = (listings) => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({
        category: "all",
        categorySlug: null,
        condition: [],
        min: "",
        max: "",
        location: "",
    });

    const filtered = useMemo(() => {
        let items = [...listings];

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter((i) => i.title.toLowerCase().includes(q));
        }

        // Price filter
        const min = Number(filter.min || 0);
        const max = Number(filter.max || 0);
        if (min) {
            items = items.filter((i) => i.price >= min);
        }
        if (max) {
            items = items.filter((i) => i.price <= max);
        }

        // Location filter
        if (filter.location.trim()) {
            const loc = filter.location.toLowerCase();
            items = items.filter((i) => i.location && i.location.toLowerCase().includes(loc));
        }

        return items;
    }, [listings, search, filter]);

    const clearFilters = () => {
        setFilter({
            category: "all",
            categorySlug: null,
            condition: [],
            min: "",
            max: "",
            location: "",
        });
        setSearch("");
    };

    return {
        search,
        setSearch,
        filter,
        setFilter,
        filtered,
        clearFilters,
    };
};