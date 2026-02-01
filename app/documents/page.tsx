"use client";

// Documents Page - Document Manager
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LogOut,
    Loader2,
    ArrowLeft,
    FolderOpen,
    GraduationCap,
    Briefcase,
    User as UserIcon,
    MoreHorizontal,
} from "lucide-react";
import { User } from "firebase/auth";
import { onAuthChange, signOut } from "@/lib/auth";
import {
    Document,
    subscribeToDocuments,
    deleteDocument,
    DOCUMENT_CATEGORIES,
    DocumentCategory,
} from "@/lib/documents";
import DocumentCard from "@/components/DocumentCard";
import DocumentUploader from "@/components/DocumentUploader";
import DocumentModal from "@/components/DocumentModal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

type FilterType = "all" | DocumentCategory;

// Category icons
const categoryIcons: Record<FilterType, React.ReactNode> = {
    all: <FolderOpen className="w-4 h-4" />,
    Kuliah: <GraduationCap className="w-4 h-4" />,
    Pekerjaan: <Briefcase className="w-4 h-4" />,
    Pribadi: <UserIcon className="w-4 h-4" />,
    Lainnya: <MoreHorizontal className="w-4 h-4" />,
};

export default function DocumentsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Documents state
    const [documents, setDocuments] = useState<Document[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Document | null>(null);

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

    // Subscribe to documents
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToDocuments(user.uid, setDocuments);
        return () => unsubscribe();
    }, [user]);

    // Filter documents
    const filteredDocuments = useMemo(() => {
        if (activeFilter === "all") return documents;
        return documents.filter((doc) => doc.category === activeFilter);
    }, [documents, activeFilter]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const handleEdit = (doc: Document) => {
        setSelectedDocument(doc);
        setEditModalOpen(true);
    };

    const handleDelete = async (doc: Document) => {
        try {
            await deleteDocument(doc.id, doc.storagePath);
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
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-12 px-8">
                {/* Header Section */}
                <div className="mb-8 relative group">
                    <div className="flex items-center gap-4">
                        <div className="text-6xl select-none">📂</div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#FFFFFF] mb-1">Documents</h1>
                            <p className="text-[#9B9B9B] text-lg">Manage your files and resources.</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 pb-2 border-b border-[#2F2F2F]">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <FilterTab
                            active={activeFilter === "all"}
                            onClick={() => setActiveFilter("all")}
                            icon={categoryIcons.all}
                            label="All"
                            count={documents.length}
                        />
                        {DOCUMENT_CATEGORIES.map((cat) => (
                            <FilterTab
                                key={cat}
                                active={activeFilter === cat}
                                onClick={() => setActiveFilter(cat)}
                                icon={categoryIcons[cat]}
                                label={cat}
                                count={documents.filter((d) => d.category === cat).length}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                    {/* Uploader */}
                    {user && <DocumentUploader userId={user.uid} />}

                    {/* Document List */}
                    <AnimatePresence mode="wait">
                        {filteredDocuments.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-16 text-center"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
                                    <FolderOpen className="w-10 h-10 text-[#D1F441]/50" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {activeFilter === "all" ? "No documents yet" : `No ${activeFilter} documents`}
                                </h3>
                                <p className="text-white/40 mb-6 max-w-sm">
                                    Upload your first document to get started
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                {filteredDocuments.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        document={doc}
                                        onEdit={() => handleEdit(doc)}
                                        onDelete={() => setDeleteConfirm(doc)}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Edit Modal */}
                <DocumentModal
                    isOpen={editModalOpen}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedDocument(null);
                    }}
                    document={selectedDocument}
                />

                {/* Delete Confirmation */}
                <DeleteConfirmModal
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                    documentName={deleteConfirm?.name || ""}
                />
            </div>
        </DashboardLayout>
    );
}

// Filter Tab Component
interface FilterTabProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count: number;
}

function FilterTab({ active, onClick, icon, label, count }: FilterTabProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all text-sm font-medium whitespace-nowrap border-b-2 ${active
                ? "border-white text-white"
                : "border-transparent text-[#9B9B9B] hover:text-white"
                }`}
        >
            {icon}
            <span>{label}</span>
            <span className={`text-xs ${active ? "text-white/60" : "text-white/40"}`}>
                ({count})
            </span>
        </button>
    );
}

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    documentName: string;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, documentName }: DeleteConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 z-50 w-full max-w-sm"
                    >
                        <h3 className="text-lg font-semibold text-white mb-2">Delete Document?</h3>
                        <p className="text-white/60 text-sm mb-1">
                            Are you sure you want to delete:
                        </p>
                        <p className="text-white font-medium mb-4 truncate">&quot;{documentName}&quot;</p>
                        <p className="text-white/40 text-sm mb-6">
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2 rounded-full border border-white/10 text-white/60 hover:border-white/20 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
