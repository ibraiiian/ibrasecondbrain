"use client";

// NoteCard component - Switches between Note view and Password (Vault) view
import { motion } from "framer-motion";
import { FileText, Clock, Tag, Trash2 } from "lucide-react";
import { Note } from "@/lib/notes";
import VaultCard from "./VaultCard";

interface NoteCardProps {
    note: Note;
    onClick: () => void;
    onDelete?: () => void;
}

export default function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
    // Render VaultCard for password entries
    if (note.type === "PASSWORD") {
        return <VaultCard note={note} onClick={onClick} />;
    }

    // Format date
    const formatDate = (timestamp: { seconds: number } | null) => {
        if (!timestamp) return "Just now";
        const date = new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Strip HTML tags for preview
    const getPreview = (html: string) => {
        const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        return text.length > 100 ? text.substring(0, 100) + "..." : text;
    };

    // Category colors
    const categoryColors: Record<string, string> = {
        Academic: "bg-[#D1F441]/20 text-[#D1F441]",
        Work: "bg-[#5D5FEF]/20 text-[#5D5FEF]",
        Personal: "bg-orange-500/20 text-orange-400",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative bg-[#1a1a1a] rounded-xl border border-white/10 hover:border-white/20 p-5 cursor-pointer transition-all duration-300"
            onClick={onClick}
        >
            {/* Delete Button (appears on hover) */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                    title="Delete note"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {/* Note Icon & Title */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#D1F441]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#D1F441]" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white truncate pr-8">
                        {note.title || "Untitled Note"}
                    </h3>
                    <div className="flex items-center gap-2 text-white/40 text-xs mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(note.updatedAt)}</span>
                    </div>
                </div>
            </div>

            {/* Content Preview */}
            <p className="text-white/50 text-sm line-clamp-3 mb-4">
                {getPreview(note.content) || "No content yet..."}
            </p>

            {/* Category & Tags */}
            <div className="flex items-center gap-2 flex-wrap">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[note.category] || categoryColors.Personal
                        }`}
                >
                    {note.category}
                </span>
                {note.tags?.slice(0, 3).map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-white/40 text-xs"
                    >
                        <Tag className="w-3 h-3" />
                        {tag}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}
