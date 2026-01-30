"use client";

// Prompt Card component for AI Prompt Library
import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Sparkles, Trash2, Settings } from "lucide-react";
import { Prompt, PromptTag } from "@/lib/prompts";

interface PromptCardProps {
    prompt: Prompt;
    onClick: () => void;
    onDelete?: () => void;
}

// Tag colors per PRD - Visual Tags with colorful labels
const tagColors: Record<PromptTag, string> = {
    Coding: "bg-emerald-500/20 text-emerald-400",
    "Image Gen": "bg-purple-500/20 text-purple-400",
    Writing: "bg-amber-500/20 text-amber-400",
    Chat: "bg-blue-500/20 text-blue-400",
    Other: "bg-white/10 text-white/60",
};

// AI Model badge colors
const modelColors: Record<string, string> = {
    Gemini: "bg-blue-500/20 text-blue-400",
    "GPT-4": "bg-emerald-500/20 text-emerald-400",
    Midjourney: "bg-purple-500/20 text-purple-400",
    Claude: "bg-orange-500/20 text-orange-400",
    "DALL-E": "bg-pink-500/20 text-pink-400",
    Other: "bg-white/10 text-white/60",
};

export default function PromptCard({ prompt, onClick, onDelete }: PromptCardProps) {
    const [copied, setCopied] = useState(false);

    const copyPrompt = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(prompt.promptBody);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative bg-[#1a1a1a] rounded-xl border border-white/10 hover:border-[#D1F441]/30 p-5 cursor-pointer transition-all duration-300"
            onClick={onClick}
        >
            {/* Delete Button */}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                    title="Delete prompt"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#D1F441]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#D1F441]" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white truncate pr-8">
                        {prompt.title || "Untitled Prompt"}
                    </h3>
                    {/* AI Model Badge */}
                    <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${modelColors[prompt.aiModel] || modelColors.Other
                            }`}
                    >
                        {prompt.aiModel}
                    </span>
                </div>
            </div>

            {/* Prompt Preview */}
            <p className="text-white/50 text-sm line-clamp-3 mb-3 font-mono">
                {prompt.promptBody || "No prompt body..."}
            </p>

            {/* Parameters (if exists) */}
            {prompt.parameters && (
                <div className="flex items-center gap-2 text-white/40 text-xs mb-3 p-2 bg-[#0f0f0f] rounded-lg">
                    <Settings className="w-3 h-3" />
                    <span className="font-mono truncate">{prompt.parameters}</span>
                </div>
            )}

            {/* Tags & Copy Button */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 flex-wrap">
                    {prompt.tags?.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${tagColors[tag]}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <button
                    onClick={copyPrompt}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#D1F441]/10 text-[#D1F441] text-xs font-medium hover:bg-[#D1F441]/20 transition-all"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            Copy
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
