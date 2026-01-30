"use client";

// Asset Card for Visual Asset Organizer
import { motion } from "framer-motion";
import { Trash2, Maximize2 } from "lucide-react";
import { Asset } from "@/lib/assets";

interface AssetCardProps {
    asset: Asset;
    onClick: () => void;
    onDelete?: () => void;
}

export default function AssetCard({ asset, onClick, onDelete }: AssetCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 hover:border-[#5D5FEF]/30 cursor-pointer transition-all"
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative aspect-square">
                <img
                    src={asset.imageUrl}
                    alt={asset.description || "Asset"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        title="View full size"
                    >
                        <Maximize2 className="w-5 h-5 text-white" />
                    </button>
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                            title="Delete asset"
                        >
                            <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Description */}
            {asset.description && (
                <div className="p-3">
                    <p className="text-white/60 text-sm truncate">{asset.description}</p>
                </div>
            )}
        </motion.div>
    );
}
