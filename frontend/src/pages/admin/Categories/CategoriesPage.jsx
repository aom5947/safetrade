import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Folder, Plus, ChevronDown, ChevronRight, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/Admin_components/ui/Card';
import { Button } from '@/components/Admin_components/ui/Button';
import { Badge } from '@/components/Admin_components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Admin_components/ui/Table';
import { Loading } from '@/components/Admin_components/Loading';
import { EmptyState } from '@/components/Admin_components/EmptyState';
import { Modal } from '@/components/Admin_components/ui/Modal';
import { Input } from '@/components/Admin_components/ui/Input';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';

// แสดงสถานะทั้งหมด

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [editingCategory, setEditingCategory] = useState(null); // สำหรับโหมด Edit
  const [isEditMode, setIsEditMode] = useState(false); // ระบุว่าเป็น Create หรือ Edit

  const { register, handleSubmit, reset, setValue } = useForm();
  const abortControllerRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
    return () => {
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch (e) { }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await api.get('/categories?includeInactive=true', { signal: controller.signal });
      console.log(response);

      const cats = response?.data?.categories ?? [];
      setCategories(cats);
    } catch (err) {
      if (err.name === 'CanceledError' || axios.isCancel(err)) {
        console.log('fetchCategories aborted');
      } else {
        console.error(err);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  // เปิด Modal สำหรับสร้างหมวดหมู่ใหม่
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingCategory(null);
    reset(); // Clear form
    setShowModal(true);
  };

  // เปิด Modal สำหรับแก้ไขหมวดหมู่
  const handleOpenEditModal = (category) => {
    setIsEditMode(true);
    setEditingCategory(category);

    // ตั้งค่าเริ่มต้นใน form
    setValue('name', category.name);
    setValue('slug', category.slug);
    setValue('icon', category.icon || '');
    setValue('parent_id', category.parent_id || '');
    setValue('display_order', category.display_order || '');
    setValue('is_active', category.is_active);

    setShowModal(true);
  };

  // สร้างหมวดหมู่ใหม่
  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (isEditMode && editingCategory) {
        // UPDATE existing category
        await api.put(
          `/admin/categories/${editingCategory.category_id}`,
          {
            name: formData.name,
            slug: formData.slug,
            icon: formData.icon,
            parentId: formData.parent_id ? parseInt(formData.parent_id) : null,
            displayOrder: formData.display_order ? parseInt(formData.display_order) : null,
            isActive: formData.is_active !== false, // default true
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success('อัพเดทหมวดหมู่สำเร็จ');
      } else {
        // CREATE new category
        await api.post(
          '/admin/categories',
          {
            name: formData.name,
            slug: formData.slug,
            icon: formData.icon,
            parentId: formData.parent_id ? parseInt(formData.parent_id) : null,
            displayOrder: formData.display_order ? parseInt(formData.display_order) : null,
            isActive: formData.is_active !== false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success('สร้างหมวดหมู่สำเร็จ');
      }

      setShowModal(false);
      reset();
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      const errorMsg = isEditMode
        ? 'ไม่สามารถอัพเดทหมวดหมู่ได้'
        : 'ไม่สามารถสร้างหมวดหมู่ได้';
      toast.error(err?.response?.data?.message || errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ลบหมวดหมู่
  const handleDelete = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?')) return;

    try {
      await api.delete(`/admin/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('ลบสำเร็จ');
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'ไม่สามารถลบได้');
    }
  };

  // Toggle สถานะ Active/Inactive
  const handleToggleActive = async (category) => {
    try {
      const respone = await api.put(
        `/admin/categories/${category.category_id}`,
        {
          is_active: !category.is_active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('เปลี่ยนสถานะสำเร็จ');
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  // แสดงจํานวนหมวดหมู่ที่ถูกปิดใช้งาน หมวดหมู่ที่ลบ ต้องกลับมาเปิดได้ กรอก id กดส่ง
  // Render แต่ละแถวของหมวดหมู่ (รองรับ subcategories)
  const renderCategoryRow = (cat, level = 0) => {
    const hasChildren = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
    const isExpanded = expandedIds.has(cat.category_id);

    return (
      <React.Fragment key={cat.category_id}>
        <TableRow className="hover:bg-gray-50 transition-colors">
          <TableCell>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
              {cat.category_id}
            </code>
          </TableCell>
          <TableCell className="font-medium">
            <div style={{ marginLeft: level * 24 }} className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(cat.category_id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  aria-label="Toggle subcategories"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              ) : (
                <span style={{ width: 24, display: 'inline-block' }} />
              )}
              {cat.icon && <span className="text-xl">{cat.icon}</span>}
              <span className="text-gray-900">{cat.name}</span>
            </div>
          </TableCell>

          <TableCell>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
              {cat.slug}
            </code>
          </TableCell>

          <TableCell className="text-center">
            {cat.display_order || '-'}
          </TableCell>

          <TableCell>
            <button
              onClick={() => handleToggleActive(cat)}
              className="cursor-pointer"
            >
              <Badge
                variant={cat.is_active ? 'success' : 'secondary'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {cat.is_active ? '✓ ใช้งาน' : '✕ ปิดใช้งาน'}
              </Badge>
            </button>
          </TableCell>

          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenEditModal(cat)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                แก้ไข
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(cat.category_id)}
                className="hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                ลบ
              </Button>
            </div>
          </TableCell>
        </TableRow>

        {hasChildren && isExpanded && cat.subcategories.map(sub => renderCategoryRow(sub, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Folder className="w-8 h-8 text-blue-600" />
              จัดการหมวดหมู่
            </h1>
            <p className="text-gray-600 mt-2">
              เพิ่มและจัดการหมวดหมู่สินค้าของคุณ
            </p>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            เพิ่มหมวดหมู่ใหม่
          </Button>
        </div>

        {/* Main Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12">
                <Loading />
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={Folder}
                  title="ยังไม่มีหมวดหมู่"
                  description="เริ่มต้นสร้างหมวดหมู่แรกของคุณ"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                      <TableHead className="font-semibold text-gray-700">
                        id
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        ชื่อหมวดหมู่
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Slug
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-center">
                        ลำดับ
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        สถานะ
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">
                        จัดการ
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map(cat => renderCategoryRow(cat, 0))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            reset();
            setEditingCategory(null);
          }}
          title={
            <div className="flex items-center gap-3">
              {isEditMode ? (
                <>
                  <Edit2 className="w-6 h-6 text-blue-600" />
                  <span>แก้ไขหมวดหมู่</span>
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-blue-600" />
                  <span>เพิ่มหมวดหมู่ใหม่</span>
                </>
              )}
            </div>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อหมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name', { required: true })}
                placeholder="เช่น อิเล็กทรอนิกส์"
                className="w-full"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('slug', { required: true })}
                placeholder="electronics"
                className="w-full font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                ใช้สำหรับ URL (ใช้ตัวอักษรภาษาอังกฤษและขีดกลาง)
              </p>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ไอคอน (Emoji)
              </label>
              <Input
                {...register('icon')}
                placeholder="📱"
                className="w-full text-2xl"
                maxLength={4}
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ลำดับการแสดงผล
              </label>
              <Input
                {...register('display_order')}
                type="number"
                placeholder="0"
                className="w-full"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                ค่าน้อยจะแสดงก่อน
              </p>
            </div>

            {/* Parent ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parent ID (หมวดหมู่แม่)
              </label>
              <Input
                {...register('parent_id')}
                type="number"
                placeholder="เว้นว่างถ้าเป็นหมวดหมู่หลัก"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                ระบุ ID ของหมวดหมู่แม่ถ้าต้องการสร้างหมวดหมู่ย่อย
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                {...register('is_active')}
                defaultChecked={isEditMode ? editingCategory?.is_active : true}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                id="is_active"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                เปิดใช้งานหมวดหมู่นี้
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  reset();
                  setEditingCategory(null);
                }}
                className="flex-1"
                disabled={submitting}
              >
                <X className="w-4 h-4 mr-2" />
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'บันทึกการแก้ไข' : 'สร้างหมวดหมู่'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default CategoriesPage;