import React from 'react';
import { Package, ShoppingBag, Star, Clock } from 'lucide-react';

export default function ShopTabs({ activeTab, onTabChange, role }) {

    const allTabs = [
        { id: 'products', label: 'สินค้า', icon: Package },
        { id: 'sold', label: 'ขายแล้ว', icon: ShoppingBag },
        { id: 'reviews', label: 'รีวิว', icon: Star },
        { id: 'statusPending', label: 'ประกาศที่ไม่ได้แสดง', icon: Clock }
    ];


    const tabs = role === 'seller'
        ? allTabs
        : allTabs.filter(tab => tab.id !== 'statusPending');

    return (
        <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex border-b border-gray-200">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors
                                ${activeTab === tab.id
                                    ? 'text-blue-500 border-b-2 border-blue-500'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
