"use client";

// Create/Edit Prompt Modal
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, Sparkles } from "lucide-react";
import {
    Prompt,
    AIModel,
    PromptTag,
    createPrompt,
    updatePrompt,
} from "@/lib/prompts";

interface PromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    prompt?: Prompt | null;
    userId: string;
    onSaved?: () => void;
}

const AI_MODELS: AIModel[] = ["Gemini", "GPT-4", "Midjourney", "Claude", "DALL-E", "Other"];
const PROMPT_TAGS: PromptTag[] = ["Coding", "Image Gen", "Writing", "Chat", "Other"];

export default function PromptModal({
    isOpen,
    onClose,
    prompt,
    userId,
    onSaved,
}: PromptModalProps) {
    const [title, setTitle] = useState("");
    const [promptBody, setPromptBody] = useState("");
    const [aiModel, setAiModel] = useState<AIModel>("Gemini");
    const [parameters, setParameters] = useState("");
    const [selectedTags, setSelectedTags] = useState<PromptTag[]>([]);
    const [saving, setSaving] = useState(false);

    // Initialize form
    useEffect(() => {
        if (prompt) {
            setTitle(prompt.title);
            setPromptBody(prompt.promptBody);
            setAiModel(prompt.aiModel);
            setParameters(prompt.parameters || "");
            setSelectedTags(prompt.tags || []);
        } else {
            setTitle("");
            setPromptBody("");
            setAiModel("Gemini");
            setParameters("");
            setSelectedTags([]);
        }
    }, [prompt, isOpen]);

    const toggleTag = (tag: PromptTag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSave = useCallback(async () => {
        if (!promptBody.trim()) return;

        setSaving(true);
        try {
            const data = {
                userId,
                title: title || "Untitled Prompt",
                promptBody,
                aiModel,
                parameters,
                tags: selectedTags,
            };

            if (prompt) {
                await updatePrompt(prompt.id, data);
            } else {
                await createPrompt(data);
            }

            onSaved?.();
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    }, [userId, title, promptBody, aiModel, parameters, selectedTags, prompt, onSaved, onClose]);

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] bg-[#0f0f0f] rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-[#D1F441]" />
                                <h2 className="text-lg font-semibold text-white">
                                    {prompt ? "Edit" : "New"} Prompt
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Title */}
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Prompt title..."
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50"
                            />

                            {/* AI Model Dropdown */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">AI Model</label>
                                <select
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value as AIModel)}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D1F441]/50 appearance-none cursor-pointer"
                                >
                                    {AI_MODELS.map((model) => (
                                        <option key={model} value={model}>
                                            {model}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Prompt Body */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Prompt Body</label>
                                <textarea
                                    value={promptBody}
                                    onChange={(e) => setPromptBody(e.target.value)}
                                    placeholder="Write your prompt here..."
                                    rows={6}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50 resize-none font-mono text-sm"
                                />
                            </div>

                            {/* Parameters */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">
                                    Parameters <span className="text-white/30">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={parameters}
                                    onChange={(e) => setParameters(e.target.value)}
                                    placeholder="e.g., --ar 16:9 --stylize 250"
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50 font-mono text-sm"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {PROMPT_TAGS.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag)
                                                    ? "bg-[#D1F441] text-[#0f0f0f]"
                                                    : "bg-[#1a1a1a] text-white/60 hover:text-white border border-white/10"
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={handleSave}
                                disabled={saving || !promptBody.trim()}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#D1F441] hover:bg-[#c5e83b] text-[#0f0f0f] font-semibold transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {saving ? "Saving..." : "Save Prompt"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
