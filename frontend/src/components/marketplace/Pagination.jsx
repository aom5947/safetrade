const Pagination = ({ pagination, onPageChange }) => {
    if (pagination.totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-6 flex justify-center items-center gap-2">
            <button
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                ก่อนหน้า
            </button>
            <span className="text-sm text-gray-600">
                หน้า {pagination.page} / {pagination.totalPages}
            </span>
            <button
                onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
                ถัดไป
            </button>
        </div>
    );
};

export default Pagination;