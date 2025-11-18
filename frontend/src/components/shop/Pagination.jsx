import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange, disabled = false }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center mt-8 gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || disabled}
                className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ก่อนหน้า
            </button>
            <span className="px-4 py-2 border border-gray-300 rounded-sm bg-white">
                {currentPage} / {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || disabled}
                className="px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ถัดไป
            </button>
        </div>
    );
}
