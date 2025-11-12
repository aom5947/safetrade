import React from 'react';
import { FileX } from 'lucide-react';

const EmptyState = ({ title = 'ไม่พบข้อมูล', description, icon: Icon = FileX }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};

export { EmptyState };
