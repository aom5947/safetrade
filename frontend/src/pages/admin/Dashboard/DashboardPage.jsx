import React from 'react';
import { Users, Package, Flag, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/Admin_components/ui/card';

export const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">ภาพรวมระบบและสถิติการใช้งาน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="ผู้ใช้งานทั้งหมด" value="1,234" icon={Users} color="bg-blue-500" />
        <StatCard title="ประกาศทั้งหมด" value="5,678" icon={Package} color="bg-purple-500" />
        <StatCard title="รายงานรอตรวจสอบ" value="12" icon={Flag} color="bg-orange-500" />
        <StatCard title="รีวิวทั้งหมด" value="890" icon={Star} color="bg-yellow-500" />
      </div>
    </div>
  );
};

export default DashboardPage;
