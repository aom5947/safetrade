import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Admin_components/ui/card';
import { Badge } from '@/components/Admin_components/ui/badge';
import { Alert, AlertDescription } from '@/components/Admin_components/ui/alert';
import { Mail, Phone, MessageSquare, Calendar, Package } from 'lucide-react';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';

export default function ContactListPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        const token = localStorage.getItem('token')
        try {
            setLoading(true);

            const result = await api.get('/guest-contacts/my-contacts',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log(result.data);


            if (result.data.success) {
                setContacts(result.data.data);
                setPagination(result.data.pagination);
            } else {
                setError('ไม่สามารถโหลดข้อมูลได้');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">รายชื่อผู้ติดต่อ</h1>
                    <p className="text-gray-600">
                        ทั้งหมด {pagination?.total || 0} รายการ
                    </p>
                </div>
                <div className='py-4'>
                    <Link to={'/marketplace'} className='bg-green-500 text-white p-2 rounded-md'>
                        กลับสู่หน้าหลัก
                    </Link>
                </div>
                {/* Contact List */}
                {contacts.length === 0 ? (
                    <Card>
                        <CardContent className="">
                            <div className="text-center text-gray-500">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>ยังไม่มีรายการติดต่อ</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {contacts.map((contact) => (
                            <Card key={contact.contact_id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl mb-2">{contact.contact_name}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                {contact.listing_title}
                                                <Badge
                                                    variant={contact.listing_status === 'active' ? 'default' : 'secondary'}
                                                    className="ml-2"
                                                >
                                                    {contact.listing_status === 'active' ? 'ใช้งาน' : 'อื่นๆ'}
                                                </Badge>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Contact Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Phone className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm">{contact.contact_phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm">{contact.contact_email}</span>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        {contact.message && (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-start gap-2">
                                                    <MessageSquare className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                                                    <p className="text-sm text-gray-700">{contact.message}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Date */}
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            <span>ติดต่อเมื่อ: {formatDate(contact.contacted_at)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination Info */}
                {pagination && pagination.total > 0 && (
                    <div className="mt-6 text-center text-sm text-gray-600">
                        แสดง {contacts.length} จาก {pagination.total} รายการ
                    </div>
                )}
            </div>
        </div>
    );
}