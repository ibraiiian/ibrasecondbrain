"use client";

// Document Modal - Edit document metadata
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { Document, DOCUMENT_CATEGORIES, DocumentCategory, updateDocument } from "@/lib/documents";

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
}

export default function DocumentModal({ isOpen, onClose, document }: DocumentModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<DocumentCategory>("Lainnya");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when document changes
    useEffect(() => {
        if (document) {
            setName(document.name);
            setDescription(document.description);
            setCategory(document.category);
        }
    }, [document]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!document || !name.trim()) return;

        setSaving(true);
        setError(null);

        try {
            await updateDocument(document.id, {
                name: name.trim(),
                description: description.trim(),
                category,
            });
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            setError("Failed to update document. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && document && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1a1a] rounded-2xl border border-white/10 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white">Edit Document</h2>
                            <button
                                onClick={handleClose}
                                disabled={saving}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* File info (read-only) */}
                            <div className="p-3 bg-white/5 rounded-lg">
                                <p className="text-white/40 text-xs mb-1">File</p>
                                <p className="text-white text-sm truncate">{document.fileName}</p>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-white/60 text-sm mb-1 block">
                                    Nama Dokumen *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama dokumen"
                                    disabled={saving}
                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50 disabled:opacity-50"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-white/60 text-sm mb-1 block">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Deskripsi singkat (opsional)"
                                    rows={3}
                                    disabled={saving}
                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50 resize-none disabled:opacity-50"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-white/60 text-sm mb-1 block">
                                    Kategori
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                                    disabled={saving}
                                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#D1F441]/50 disabled:opacity-50"
                                >
                                    {DOCUMENT_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat} className="bg-[#1a1a1a]">
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={saving}
                                    className="flex-1 py-2.5 rounded-full border border-white/10 text-white/60 hover:border-white/20 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !name.trim()}
                                    className="flex-1 py-2.5 rounded-full bg-[#D1F441] hover:bg-[#c5e83b] text-[#0f0f0f] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
