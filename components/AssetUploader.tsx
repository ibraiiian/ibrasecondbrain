"use client";

// Asset Uploader - Drag & Drop + Click to Upload
import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, Image, X } from "lucide-react";
import { uploadAsset } from "@/lib/storage";
import { createAsset } from "@/lib/assets";

interface AssetUploaderProps {
    userId: string;
    onUploadComplete?: () => void;
}

export default function AssetUploader({ userId, onUploadComplete }: AssetUploaderProps) {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("File size must be less than 10MB");
            return;
        }

        setError(null);
        setUploading(true);
        setProgress(30);

        try {
            // Upload to Storage
            const { url, storagePath } = await uploadAsset(userId, file);
            setProgress(70);

            // Create Firestore document
            await createAsset({
                userId,
                imageUrl: url,
                storagePath,
                description: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            });
            setProgress(100);

            onUploadComplete?.();
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            setProgress(0);
            // Reset input
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
        },
        [userId]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                id="asset-upload"
            />

            <label
                htmlFor="asset-upload"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dragOver
                        ? "border-[#5D5FEF] bg-[#5D5FEF]/10"
                        : "border-white/20 bg-[#1a1a1a] hover:border-[#5D5FEF]/50"
                    } ${uploading ? "pointer-events-none" : ""}`}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-10 h-10 text-[#5D5FEF] animate-spin" />
                        <p className="text-white/60 text-sm">Uploading... {progress}%</p>
                        <div className="w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-[#5D5FEF]"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-[#5D5FEF]/10 flex items-center justify-center">
                            {dragOver ? (
                                <Image className="w-8 h-8 text-[#5D5FEF]" />
                            ) : (
                                <Upload className="w-8 h-8 text-[#5D5FEF]" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-white font-medium">
                                {dragOver ? "Drop image here" : "Drop image or click to upload"}
                            </p>
                            <p className="text-white/40 text-sm mt-1">
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                    </>
                )}
            </label>

            {/* Error message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 left-0 right-0 flex items-center justify-center gap-2 text-red-400 text-sm"
                >
                    <X className="w-4 h-4" />
                    {error}
                </motion.div>
            )}
        </motion.div>
    );
}
