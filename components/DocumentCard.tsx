"use client";

// Document Card for Document Manager
import { motion } from "framer-motion";
import { Trash2, Download, Edit, FileText, FileType, Presentation, Table, File } from "lucide-react";
import { Document, getFileIconType, formatFileSize, DocumentCategory } from "@/lib/documents";

interface DocumentCardProps {
    document: Document;
    onEdit: () => void;
    onDelete: () => void;
}

// Category badge colors
const categoryColors: Record<DocumentCategory, string> = {
    Kuliah: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Pekerjaan: "bg-green-500/20 text-green-400 border-green-500/30",
    Pribadi: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Lainnya: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

// File type icons
function FileIcon({ type }: { type: string }) {
    const iconType = getFileIconType(type);
    const iconClass = "w-8 h-8";

    switch (iconType) {
        case "pdf":
            return <FileText className={`${iconClass} text-red-400`} />;
        case "word":
            return <FileType className={`${iconClass} text-blue-400`} />;
        case "powerpoint":
            return <Presentation className={`${iconClass} text-orange-400`} />;
        case "excel":
            return <Table className={`${iconClass} text-green-400`} />;
        case "text":
            return <FileText className={`${iconClass} text-gray-400`} />;
        default:
            return <File className={`${iconClass} text-white/60`} />;
    }
}

export default function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(document.fileUrl, "_blank");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="group bg-[#1a1a1a] rounded-xl border border-white/10 hover:border-[#D1F441]/30 p-4 transition-all"
        >
            <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FileIcon type={document.fileType} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-white font-medium truncate">{document.name}</h3>
                            {document.description && (
                                <p className="text-white/40 text-sm truncate mt-0.5">{document.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${categoryColors[document.category]}`}>
                            {document.category}
                        </span>
                        <span className="text-white/30 text-xs">{formatFileSize(document.fileSize)}</span>
                        <span className="text-white/30 text-xs truncate">{document.fileName}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4 text-[#D1F441]" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4 text-white/60" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
