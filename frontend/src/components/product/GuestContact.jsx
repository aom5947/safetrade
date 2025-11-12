import { api } from '@/services/api';
import React, { useState } from 'react';

const GuestContact = ({ product }) => {
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async () => {
        if (!contactName || !contactPhone || !contactEmail) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        
        setLoading(true);

        try {

            console.log(product.listing_id);
            
            await api.post('/guest-contacts', {
                listingId: product.listing_id,
                contactName: contactName,
                contactPhone: contactPhone,
                contactEmail: contactEmail,
                message: "สนใจสินค้า ราคาต่อได้ไหมคะ"
            });
            
            setMessage('ส่งข้อมูลเรียบร้อยแล้ว ขอบคุณที่ติดต่อเรา');
            setContactName('');
            setContactPhone('');
            setContactEmail('');
        } catch (error) {
            setMessage('เกิดข้อผิดพลาดในการส่งข้อมูล');
            console.error(error);
        }

        setLoading(false);
    };

    return (
        <>
            <div className='flex gap-x-2 justify-between my-4'>
                <input
                    type="text"
                    placeholder="ชื่อ - สกุล"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="text"
                    placeholder="เบอร์โทรศัพท์"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="email"
                    placeholder="อีเมล"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                >
                    สนใจให้ติดต่อกลับ
                </button>
            </div>
            {message && (
                <div className="self-center text-sm text-green-600 ml-4">
                    {message}
                </div>
            )}
        </>
    );
};

export default GuestContact;
