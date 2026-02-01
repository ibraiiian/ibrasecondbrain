"use client";

// Notes Page - Main content management view
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Plus,
    LogOut,
    Filter,
    FileText,
    Lock,
    Loader2,
    Search,
    ArrowLeft,
} from "lucide-react";
import { User } from "firebase/auth";
import { onAuthChange, signOut } from "@/lib/auth";
import { Note, NoteType, subscribeToNotes, deleteNote } from "@/lib/notes";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import NoteModal from "@/components/NoteModal";

type FilterType = "ALL" | "NOTE" | "PASSWORD";

export default function NotesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<Note[]>([]);
    const [filter, setFilter] = useState<FilterType>("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Auth check
    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser: User | null) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Subscribe to notes
    useEffect(() => {
        if (!user) return;

        const typeFilter = filter === "ALL" ? undefined : filter as NoteType;
        const unsubscribe = subscribeToNotes(
            user.uid,
            (fetchedNotes) => setNotes(fetchedNotes),
            typeFilter
        );

        return () => unsubscribe();
    }, [user, filter]);

    // Filter notes by search
    const filteredNotes = notes.filter((note) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
    });

    const openNoteModal = useCallback((note?: Note) => {
        setSelectedNote(note || null);
        setModalOpen(true);
    }, []);

    const handleDelete = async (noteId: string) => {
        try {
            await deleteNote(noteId);
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#191919]">
                <Loader2 className="w-8 h-8 text-[#D1F441] animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-12 px-8">
                {/* Header Section */}
                <div className="mb-8 relative group">
                    <div className="flex items-center gap-4">
                        <div className="text-6xl select-none">📝</div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#FFFFFF] mb-1">Notes</h1>
                            <p className="text-[#9B9B9B] text-lg">Capture your thoughts and ideas.</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#2F2F2F]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[#FFFFFF] font-medium border-b-2 border-[#FFFFFF] pb-2 text-sm cursor-pointer">
                            List View
                        </div>
                        {/* Removed Gallery View option for now as requested "Notion List View" style */}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-2 py-1 bg-[#202020] hover:bg-[#2C2C2C] rounded text-sm text-[#9B9B9B] border border-[#2F2F2F] w-48 transition-colors">
                            <Search className="w-4 h-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search"
                                className="bg-transparent border-none focus:outline-none text-[#FFFFFF] placeholder-[#5A5A5A] text-sm w-full"
                            />
                        </div>
                        <button
                            onClick={() => openNoteModal()}
                            className="flex items-center gap-1 bg-[#202020] hover:bg-[#2C2C2C] text-[#FFFFFF] px-3 py-1 rounded-sm text-sm border border-[#2F2F2F] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New
                        </button>
                    </div>
                </div>

                {/* List View */}
                <div className="flex flex-col">
                    {/* List Header */}
                    <div className="flex items-center px-4 py-2 border-b border-[#2F2F2F] text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide">
                        <div className="flex-1">Title</div>
                        <div className="w-32">Date Created</div>
                        <div className="w-32">Tags</div>
                        <div className="w-10"></div>
                    </div>

                    {/* List Items */}
                    <div className="mt-1">
                        {filteredNotes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-[#5A5A5A]">
                                <FileText className="w-12 h-12 mb-4 opacity-20" />
                                <p>No notes found</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredNotes.map((note) => (
                                    <motion.div
                                        key={note.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group flex items-center px-4 py-2 hover:bg-[#2C2C2C] border-b border-transparent hover:border-[#2F2F2F] transition-colors cursor-pointer rounded-sm"
                                        onClick={() => openNoteModal(note)}
                                    >
                                        <div className="flex-1 flex items-center gap-3 overflow-hidden">
                                            <FileText className="w-4 h-4 text-[#9B9B9B] shrink-0" />
                                            <span className="text-sm text-[#FFFFFF] font-medium truncate">{note.title || "Untitled"}</span>
                                        </div>
                                        <div className="w-32 text-xs text-[#9B9B9B]">
                                            {note.createdAt?.seconds ? new Date(note.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                        </div>
                                        <div className="w-32 flex gap-1 overflow-hidden">
                                            {note.tags && note.tags.length > 0 ? (
                                                note.tags.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 rounded bg-[#3F3F3F] text-[#9B9B9B] text-[10px] truncate max-w-[80px]">
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[#5A5A5A] text-xs">-</span>
                                            )}
                                        </div>
                                        <div className="w-10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm(note.id);
                                                }}
                                                className="p-1 hover:bg-[#3F3F3F] rounded text-[#9B9B9B] hover:text-red-400 transition-colors"
                                            >
                                                <LogOut className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>

            {/* Note Modal */}
            {user && (
                <NoteModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedNote(null);
                    }}
                    note={selectedNote}
                    userId={user.uid}
                />
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirm(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#202020] rounded-lg border border-[#2F2F2F] p-6 z-50 w-full max-w-sm"
                        >
                            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">Delete Note?</h3>
                            <p className="text-[#9B9B9B] text-sm mb-6">
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 rounded text-[#9B9B9B] hover:bg-[#2C2C2C] hover:text-[#FFFFFF] transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-4 py-2 rounded bg-red-900/30 text-red-200 hover:bg-red-900/50 transition-colors text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

// Filter Button Component
interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    accentColor?: string;
}

function FilterButton({ active, onClick, icon, label, accentColor }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${active
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
                }`}
            style={active && accentColor ? { color: accentColor } : undefined}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}
