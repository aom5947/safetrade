import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ searchQuery, onSearchChange, onSearchSubmit }) {
    return (
        <form onSubmit={onSearchSubmit} className="mb-6">
            <div className="relative">
                <input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
        </form>
    );
}
