import React from 'react';

export default function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="mb-6">
                <svg className="w-32 h-32 text-gray-300" viewBox="0 0 200 150" fill="none">
                    <rect x="40" y="50" width="120" height="80" fill="currentColor" opacity="0.3" />
                    <rect x="50" y="40" width="100" height="10" fill="currentColor" opacity="0.4" />
                    <path d="M50 40 L100 20 L150 40" stroke="currentColor" strokeWidth="3" opacity="0.4" />
                </svg>
            </div>
            <p className="text-gray-500 text-lg">{message}</p>
        </div>
    );
}
