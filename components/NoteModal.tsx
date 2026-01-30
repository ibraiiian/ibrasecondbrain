"use client";

// Create/Edit Note Modal
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, Lock, FileText, Globe, User } from "lucide-react";
import Editor from "./Editor";
import { Note, NoteType, NoteCategory, createNote, updateNote } from "@/lib/notes";
import { useDebounceValue } from "@/hooks/useDebounce";

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note?: Note | null;
    userId: string;
    onSaved?: () => void;
}

export default function NoteModal({
    isOpen,
    onClose,
    note,
    userId,
    onSaved,
}: NoteModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState<NoteType>("NOTE");
    const [category, setCategory] = useState<NoteCategory>("Personal");
    const [tags, setTags] = useState("");
    const [username, setUsername] = useState("");
    const [url, setUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [autoSaved, setAutoSaved] = useState(false);

    // Debounced content for auto-save
    const debouncedContent = useDebounceValue(content, 1500);
    const debouncedTitle = useDebounceValue(title, 1500);

    // Initialize form with note data
    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setType(note.type);
            setCategory(note.category);
            setTags(note.tags?.join(", ") || "");
            setUsername(note.username || "");
            setUrl(note.url || "");
        } else {
            // Reset form for new note
            setTitle("");
            setContent("");
            setType("NOTE");
            setCategory("Personal");
            setTags("");
            setUsername("");
            setUrl("");
        }
    }, [note, isOpen]);

    // Auto-save for existing notes (only for NOTE type to preserve password editing safety)
    useEffect(() => {
        if (note && type === "NOTE" && (debouncedContent !== note.content || debouncedTitle !== note.title)) {
            const autoSave = async () => {
                try {
                    await updateNote(note.id, {
                        title: debouncedTitle || "Untitled",
                        content: debouncedContent,
                    });
                    setAutoSaved(true);
                    setTimeout(() => setAutoSaved(false), 2000);
                } catch (err) {
                    console.error("Auto-save failed:", err);
                }
            };
            autoSave();
        }
    }, [debouncedContent, debouncedTitle, note, type]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const noteData = {
                userId,
                title: title || "Untitled",
                content,
                type,
                category,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                ...(type === "PASSWORD" && { username, url }),
            };

            if (note) {
                await updateNote(note.id, noteData);
            } else {
                await createNote(noteData);
            }

            onSaved?.();
            onClose();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    }, [userId, title, content, type, category, tags, username, url, note, onSaved, onClose]);

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
                                {type === "PASSWORD" ? (
                                    <Lock className="w-5 h-5 text-[#5D5FEF]" />
                                ) : (
                                    <FileText className="w-5 h-5 text-[#D1F441]" />
                                )}
                                <h2 className="text-lg font-semibold text-white">
                                    {note ? "Edit" : "Create"} {type === "PASSWORD" ? "Password" : "Note"}
                                </h2>
                                {autoSaved && (
                                    <span className="text-xs text-[#D1F441] animate-pulse">Auto-saved</span>
                                )}
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
                            {/* Type Selector (only for new notes) */}
                            {!note && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setType("NOTE")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${type === "NOTE"
                                                ? "bg-[#D1F441]/10 border-[#D1F441] text-[#D1F441]"
                                                : "border-white/10 text-white/60 hover:border-white/20"
                                            }`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        Note
                                    </button>
                                    <button
                                        onClick={() => setType("PASSWORD")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${type === "PASSWORD"
                                                ? "bg-[#5D5FEF]/10 border-[#5D5FEF] text-[#5D5FEF]"
                                                : "border-white/10 text-white/60 hover:border-white/20"
                                            }`}
                                    >
                                        <Lock className="w-4 h-4" />
                                        Password
                                    </button>
                                </div>
                            )}

                            {/* Title */}
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={type === "PASSWORD" ? "Service name..." : "Note title..."}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50"
                            />

                            {/* Password-specific fields */}
                            {type === "PASSWORD" && (
                                <>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="Website URL..."
                                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#5D5FEF]/50"
                                        />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Username or email..."
                                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#5D5FEF]/50"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="password"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Password..."
                                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#5D5FEF]/50"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Note Editor */}
                            {type === "NOTE" && (
                                <Editor
                                    content={content}
                                    onChange={setContent}
                                    placeholder="Start writing your note..."
                                />
                            )}

                            {/* Category & Tags Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as NoteCategory)}
                                    className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D1F441]/50 appearance-none cursor-pointer"
                                >
                                    <option value="Academic">📚 Academic</option>
                                    <option value="Work">💼 Work</option>
                                    <option value="Personal">🏠 Personal</option>
                                </select>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="Tags (comma separated)"
                                    className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#D1F441] hover:bg-[#c5e83b] text-[#0f0f0f] font-semibold transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
