import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

// Custom Hooks
import { useProductDetails } from "@/hooks/useProductDetails";
import { useClipboard } from "@/hooks/useClipboard";

// Components ย่อย
import LoadingState from "@/components/product/LoadingState";
import ErrorState from "@/components/product/ErrorState";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductDetails from "@/components/product/ProductDetails";
import SafetyTips from "@/components/product/SafetyTips";
import SellerContactCard from "@/components/product/SellerContactCard";
import GuestContact from "@/components/product/GuestContact";

function Product() {
    const { productID } = useParams();
    const navigate = useNavigate();

    const { product, isLoading, error } = useProductDetails(productID);
    const { copyToClipboard, copied } = useClipboard();

    if (isLoading) return <LoadingState />;
    if (error || !product) return <ErrorState error={error} onBack={() => navigate("/marketplace")} />;

    const priceText = typeof product.price === "number"
        ? `฿ ${product.price.toLocaleString()}`
        : product.price || "—";

    console.log(product, "sadsa");
    

    return (
        <div className="bg-gray-50">
            <Navbar role="buyer" />
            <div className="max-w-5xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold mb-6">รายละเอียดสินค้า</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
                        <ProductImageGallery images={product.images} />
                        <ProductDetails product={product} priceText={priceText} />
                        <GuestContact product={product} />
                        <SafetyTips />
                    </div>

                    <SellerContactCard
                        product={product}
                        copyToClipboard={copyToClipboard}
                        copied={copied}
                    />
                </div>
            </div>
        </div>
    );
}

export default Product;
