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
import NoteCard from "@/components/NoteCard";
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
            if (!currentUser) {
                router.push("/");
            } else {
                setUser(currentUser);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

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

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

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
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
                <Loader2 className="w-8 h-8 text-[#D1F441] animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0f0f0f]">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0f0f0f]/80 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-5 h-5 text-white/60" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 flex items-center justify-center">
                                    <img src="/logo.png" alt="IbraBrain" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">IbraBrain Notes</h1>
                                    <p className="text-xs text-white/40">{notes.length} items</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {user?.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || "User"}
                                    className="w-8 h-8 rounded-full border border-white/10"
                                />
                            )}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="sticky top-[73px] z-30 bg-[#0f0f0f]/80 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-xl">
                            <FilterButton
                                active={filter === "ALL"}
                                onClick={() => setFilter("ALL")}
                                icon={<Filter className="w-4 h-4" />}
                                label="All"
                            />
                            <FilterButton
                                active={filter === "NOTE"}
                                onClick={() => setFilter("NOTE")}
                                icon={<FileText className="w-4 h-4" />}
                                label="Notes"
                                accentColor="#D1F441"
                            />
                            <FilterButton
                                active={filter === "PASSWORD"}
                                onClick={() => setFilter("PASSWORD")}
                                icon={<Lock className="w-4 h-4" />}
                                label="Passwords"
                                accentColor="#5D5FEF"
                            />
                        </div>

                        {/* Search & Add */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search notes..."
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D1F441]/50 text-sm"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openNoteModal()}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D1F441] hover:bg-[#c5e83b] text-[#0f0f0f] font-semibold transition-all text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add New</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {filteredNotes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
                            {filter === "PASSWORD" ? (
                                <Lock className="w-10 h-10 text-[#5D5FEF]/50" />
                            ) : (
                                <FileText className="w-10 h-10 text-[#D1F441]/50" />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery ? "No results found" : "No items yet"}
                        </h3>
                        <p className="text-white/40 mb-6 max-w-sm">
                            {searchQuery
                                ? `No ${filter === "ALL" ? "items" : filter.toLowerCase() + "s"} match "${searchQuery}"`
                                : `Start by creating your first ${filter === "PASSWORD" ? "password" : "note"}`}
                        </p>
                        {!searchQuery && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openNoteModal()}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#D1F441] hover:bg-[#c5e83b] text-[#0f0f0f] font-semibold transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Create First {filter === "PASSWORD" ? "Password" : "Note"}
                            </motion.button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onClick={() => openNoteModal(note)}
                                    onDelete={() => setDeleteConfirm(note.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 z-50 w-full max-w-sm"
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">Delete Item?</h3>
                            <p className="text-white/60 text-sm mb-6">
                                This action cannot be undone. The item will be permanently deleted.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2 rounded-full border border-white/10 text-white/60 hover:border-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
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
