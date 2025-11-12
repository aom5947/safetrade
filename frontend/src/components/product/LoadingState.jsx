import Navbar from "@/components/Navbar";

export default function LoadingState() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar role="buyer" />
            <div className="max-w-4xl mx-auto px-6 py-10 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        </div>
    );
}
