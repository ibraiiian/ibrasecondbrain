"use client";

// Lightbox - Full-size image preview
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Download } from "lucide-react";
import { Asset } from "@/lib/assets";

interface LightboxProps {
    asset: Asset | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete?: () => void;
}

export default function Lightbox({ asset, isOpen, onClose, onDelete }: LightboxProps) {
    if (!asset) return null;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = asset.imageUrl;
        link.download = asset.description || "asset";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        {/* Image Container */}
                        <div className="relative max-w-[90vw] max-h-[90vh] pointer-events-auto">
                            <img
                                src={asset.imageUrl}
                                alt={asset.description || "Asset preview"}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />

                            {/* Description */}
                            {asset.description && (
                                <p className="absolute bottom-4 left-4 right-4 text-white/80 text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    {asset.description}
                                </p>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
                            <button
                                onClick={handleDownload}
                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                title="Download"
                            >
                                <Download className="w-5 h-5 text-white" />
                            </button>
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                title="Close"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
