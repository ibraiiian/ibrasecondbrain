"use client";

// Creative Page - AI Prompt Library + Visual Asset Organizer
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain,
    Plus,
    LogOut,
    Sparkles,
    Image,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import { User } from "firebase/auth";
import { onAuthChange, signOut } from "@/lib/auth";
import { Prompt, subscribeToPrompts, deletePrompt } from "@/lib/prompts";
import { Asset, subscribeToAssets, deleteAsset } from "@/lib/assets";
import PromptCard from "@/components/PromptCard";
import PromptModal from "@/components/PromptModal";
import AssetCard from "@/components/AssetCard";
import AssetUploader from "@/components/AssetUploader";
import Lightbox from "@/components/Lightbox";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

type TabType = "prompts" | "assets";

export default function CreativePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("prompts");

    // Prompts state
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [promptModalOpen, setPromptModalOpen] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [deletePromptConfirm, setDeletePromptConfirm] = useState<string | null>(null);

    // Assets state
    const [assets, setAssets] = useState<Asset[]>([]);
    const [lightboxAsset, setLightboxAsset] = useState<Asset | null>(null);
    const [deleteAssetConfirm, setDeleteAssetConfirm] = useState<Asset | null>(null);

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

    // Subscribe to prompts
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToPrompts(user.uid, setPrompts);
        return () => unsubscribe();
    }, [user]);

    // Subscribe to assets
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToAssets(user.uid, setAssets);
        return () => unsubscribe();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const openPromptModal = useCallback((prompt?: Prompt) => {
        setSelectedPrompt(prompt || null);
        setPromptModalOpen(true);
    }, []);

    const handleDeletePrompt = async (id: string) => {
        try {
            await deletePrompt(id);
            setDeletePromptConfirm(null);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleDeleteAsset = async (asset: Asset) => {
        try {
            await deleteAsset(asset.id, asset.storagePath);
            setDeleteAssetConfirm(null);
            setLightboxAsset(null);
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
                        <div className="text-6xl select-none">✨</div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#FFFFFF] mb-1">Creative Hub</h1>
                            <p className="text-[#9B9B9B] text-lg">AI Prompts & Visual Assets.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Actions */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#2F2F2F]">
                <div className="flex items-center gap-2 text-sm">
                    <div
                        onClick={() => setActiveTab("prompts")}
                        className={`cursor-pointer pb-2 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'prompts' ? 'border-white text-white' : 'border-transparent text-[#9B9B9B] hover:text-white'}`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Prompt Library
                    </div>
                    <div
                        onClick={() => setActiveTab("assets")}
                        className={`cursor-pointer pb-2 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'assets' ? 'border-white text-white' : 'border-transparent text-[#9B9B9B] hover:text-white'}`}
                    >
                        <Image className="w-4 h-4" />
                        Asset Gallery
                    </div>
                </div>

                {activeTab === "prompts" && (
                    <button
                        onClick={() => openPromptModal()}
                        className="flex items-center gap-1 bg-[#202020] hover:bg-[#2C2C2C] text-[#FFFFFF] px-3 py-1 rounded-sm text-sm border border-[#2F2F2F] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Prompt
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {activeTab === "prompts" ? (
                        <motion.div
                            key="prompts"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {prompts.length === 0 ? (
                                <EmptyState
                                    icon={<Sparkles className="w-10 h-10 text-[#D1F441]/50" />}
                                    title="No prompts yet"
                                    description="Start building your AI prompt library"
                                    actionLabel="Create First Prompt"
                                    onAction={() => openPromptModal()}
                                />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {prompts.map((prompt) => (
                                        <PromptCard
                                            key={prompt.id}
                                            prompt={prompt}
                                            onClick={() => openPromptModal(prompt)}
                                            onDelete={() => setDeletePromptConfirm(prompt.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="assets"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Uploader */}
                            {user && <AssetUploader userId={user.uid} />}

                            {/* Gallery - Masonry Grid */}
                            {assets.length === 0 ? (
                                <div className="pt-8">
                                    <EmptyState
                                        icon={<Image className="w-10 h-10 text-[#5D5FEF]/50" />}
                                        title="No assets yet"
                                        description="Upload images to build your moodboard"
                                    />
                                </div>
                            ) : (
                                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                                    {assets.map((asset) => (
                                        <div key={asset.id} className="break-inside-avoid">
                                            <AssetCard
                                                asset={asset}
                                                onClick={() => setLightboxAsset(asset)}
                                                onDelete={() => setDeleteAssetConfirm(asset)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Prompt Modal */}
            {user && (
                <PromptModal
                    isOpen={promptModalOpen}
                    onClose={() => {
                        setPromptModalOpen(false);
                        setSelectedPrompt(null);
                    }}
                    prompt={selectedPrompt}
                    userId={user.uid}
                />
            )}

            {/* Lightbox */}
            <Lightbox
                asset={lightboxAsset}
                isOpen={!!lightboxAsset}
                onClose={() => setLightboxAsset(null)}
                onDelete={() => lightboxAsset && setDeleteAssetConfirm(lightboxAsset)}
            />

            {/* Delete Prompt Confirmation */}
            <DeleteConfirmModal
                isOpen={!!deletePromptConfirm}
                onClose={() => setDeletePromptConfirm(null)}
                onConfirm={() => deletePromptConfirm && handleDeletePrompt(deletePromptConfirm)}
                title="Delete Prompt?"
            />

            {/* Delete Asset Confirmation */}
            <DeleteConfirmModal
                isOpen={!!deleteAssetConfirm}
                onClose={() => setDeleteAssetConfirm(null)}
                onConfirm={() => deleteAssetConfirm && handleDeleteAsset(deleteAssetConfirm)}
                title="Delete Asset?"
            />
        </DashboardLayout>
    );
}

// Empty State Component
interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-white/40 mb-6 max-w-sm">{description}</p>
            {actionLabel && onAction && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onAction}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#D1F441] hover:bg-[#c5e83b] text-[#0f0f0f] font-semibold transition-all"
                >
                    <Plus className="w-5 h-5" />
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
}

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title }: DeleteConfirmModalProps) {
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
                        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                        <p className="text-white/60 text-sm mb-6">
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
