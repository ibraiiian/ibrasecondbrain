"use client";

// Vault Card for Password entries - The Vault UI
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Copy, Lock, Check, Globe, User } from "lucide-react";
import { Note } from "@/lib/notes";

interface VaultCardProps {
    note: Note;
    onClick: () => void;
}

export default function VaultCard({ note, onClick }: VaultCardProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const maskedPassword = "••••••••••";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-[#1a1a1a] rounded-xl border-2 border-dashed border-[#5D5FEF]/30 hover:border-[#5D5FEF]/60 p-5 cursor-pointer transition-all duration-300"
            onClick={onClick}
        >
            {/* Lock Badge */}
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#5D5FEF] flex items-center justify-center shadow-lg shadow-[#5D5FEF]/30">
                <Lock className="w-4 h-4 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-4 pr-6">{note.title}</h3>

            {/* URL if available */}
            {note.url && (
                <div className="flex items-center gap-2 text-white/40 text-sm mb-3">
                    <Globe className="w-4 h-4" />
                    <span className="truncate">{note.url}</span>
                </div>
            )}

            {/* Username Row */}
            {note.username && (
                <div className="flex items-center justify-between gap-2 mb-3 p-3 bg-[#0f0f0f] rounded-lg">
                    <div className="flex items-center gap-2 text-white/60 min-w-0">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate text-sm">{note.username}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(note.username || "", "username");
                        }}
                        className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy username"
                    >
                        {copiedField === "username" ? (
                            <Check className="w-4 h-4 text-[#D1F441]" />
                        ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                        )}
                    </button>
                </div>
            )}

            {/* Password Row */}
            <div className="flex items-center justify-between gap-2 p-3 bg-[#0f0f0f] rounded-lg">
                <div className="flex items-center gap-2 text-white/60 min-w-0">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span className="font-mono text-sm">
                        {showPassword ? note.content : maskedPassword}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {/* Toggle Visibility */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPassword(!showPassword);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4 text-white/40" />
                        ) : (
                            <Eye className="w-4 h-4 text-white/40" />
                        )}
                    </button>
                    {/* Copy Password */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(note.content, "password");
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy password"
                    >
                        {copiedField === "password" ? (
                            <Check className="w-4 h-4 text-[#D1F441]" />
                        ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                        )}
                    </button>
                </div>
            </div>

            {/* Category Badge */}
            <div className="mt-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#5D5FEF]/20 text-[#5D5FEF] text-xs font-medium">
                    {note.category}
                </span>
                {/* Tags */}
                {note.tags?.slice(0, 2).map((tag) => (
                    <span
                        key={tag}
                        className="px-2 py-1 rounded-full bg-white/5 text-white/40 text-xs"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}
