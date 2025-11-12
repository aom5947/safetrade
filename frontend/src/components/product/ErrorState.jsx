import Navbar from "@/components/Navbar";

export default function ErrorState({ error, onBack }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar role="buyer" />
            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="bg-white rounded-xl shadow p-8 text-center">
                    <h1 className="text-xl font-semibold mb-2">ไม่พบสินค้า</h1>
                    <p className="text-gray-600 mb-4">{error || "กรุณาเข้าหน้านี้จาก Marketplace"}</p>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        กลับไปหน้า Marketplace
                    </button>
                </div>
            </div>
        </div>
    );
}
