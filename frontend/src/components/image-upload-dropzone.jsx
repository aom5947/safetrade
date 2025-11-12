import { useState } from "react"
import { generateUploadDropzone } from "@uploadthing/react"
import { Button } from "@/components/Admin_components/ui/button"
import { X, CheckCircle, Upload } from "lucide-react"
import { Label } from "@/components/Admin_components/ui/label"

// Generate the UploadDropzone component
const UploadDropzone = generateUploadDropzone({
    url: "http://localhost:3000/api/uploadthing",
})

export function ImageUploadDropzone({ maxImages = 18, onImagesChange, initialImages = [], headerText }) {
    const [uploadedImages, setUploadedImages] = useState(initialImages)
    const [isUploading, setIsUploading] = useState(false)

    const handleRemoveImage = (index) => {
        const newImages = uploadedImages.filter((_, i) => i !== index)
        setUploadedImages(newImages)
        onImagesChange?.(newImages)
    }

    const canUploadMore = uploadedImages.length < maxImages

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-base font-semibold">
                    {headerText ? headerText : "Product Images "} <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                    Upload at least 1 image (maximum {maxImages} images, 4MB each)
                </p>
            </div>

            {/* UploadThing Dropzone */}
            {canUploadMore && (
                <div className="relative">
                    <UploadDropzone
                        endpoint="imageUploader"
                        onBeforeUploadBegin={(files) => {
                            setIsUploading(true)
                            return files
                        }}
                        onClientUploadComplete={(res) => {
                            setIsUploading(false)
                            if (res) {
                                const newUrls = res.map((file) => file.url)
                                const updatedImages = [...uploadedImages, ...newUrls].slice(0, maxImages)
                                console.log(newUrls);
                                console.log(updatedImages);
                                
                                setUploadedImages(updatedImages)
                                onImagesChange?.(updatedImages)
                            }
                        }}
                        onUploadError={(error) => {
                            setIsUploading(false)
                            console.error("Upload error:", error)
                            alert(`Upload failed: ${error.message}`)
                        }}
                        appearance={{
                            container: "border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary transition-colors",
                            uploadIcon: "text-muted-foreground",
                            label: "text-sm font-medium text-foreground",
                            allowedContent: "text-xs text-muted-foreground",
                            button:
                                "bg-primary text-primary-foreground hover:bg-primary/90 ut-ready:bg-primary ut-uploading:bg-primary/50",
                        }}
                        content={{
                            label: canUploadMore
                                ? "Click to select or drag and drop images here"
                                : `Maximum ${maxImages} images reached`,
                            allowedContent: "Images up to 4MB",
                            button: ({ ready, isUploading }) => {
                                if (isUploading) return "Uploading..."
                                if (ready) return "Upload Image"
                                return "Preparing..."
                            },
                        }}
                    />
                    {isUploading && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 animate-pulse text-primary" />
                                <p className="text-sm font-medium">Uploading...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Display uploaded images */}
            {uploadedImages.length > 0 && (
                <div>
                    <p className="text-sm font-medium mb-3">
                        Uploaded Images ({uploadedImages.length}/{maxImages})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {uploadedImages.map((url, index) => (
                            <div
                                key={index}
                                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border"
                            >
                                <img
                                    src={url || "/placeholder.svg"}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Remove button */}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                {/* Success indicator */}
                                <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                                    <CheckCircle className="w-4 h-4" />
                                </div>

                                {/* Image number */}
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    #{index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload limit warning */}
            {!canUploadMore && (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    Maximum {maxImages} images reached. Remove an image to upload more.
                </p>
            )}
        </div>
    )
}
