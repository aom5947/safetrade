const statusOptions = [
    { value: 'active', label: 'แสดงให้ผู้ซื้อเห็น', color: 'bg-green-500' },
    { value: 'sold', label: 'ขายแล้ว', color: 'bg-gray-500' },
    { value: 'expired', label: 'หมดอายุ', color: 'bg-red-500' },
    { value: 'hidden', label: 'ถูกซ่อน', color: 'bg-yellow-500' },
    { value: 'pending', label: 'รออนุมัติ', color: 'bg-blue-500' },
    { value: 'rejected', label: 'ถูกปฏิเสธ', color: 'bg-red-500' },
];


export default function ProductDetails({ product, priceText }) {

    const status = statusOptions.find(opt => opt.value === product.status);

    return (
        <div className="mt-6">
            <div>
                <h2 className="text-2xl font-bold">{product.title}</h2>
                <p className="text-3xl font-bold text-blue-600 my-2">{priceText}</p>
            </div>

            <h2 className={`w-fit font-bold px-2 py-1 rounded-md text-white ${status?.color || 'bg-gray-300'}`}>
                สถานะสินค้า: {status.label || 'ไม่ทราบสถานะ'}
            </h2>
            {product.description && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">รายละเอียด</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>
            )}
        </div>
    );
}
