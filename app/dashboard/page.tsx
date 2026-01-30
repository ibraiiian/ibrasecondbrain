"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Brain,
    LogOut,
    Loader2,
    FileText,
    Lock,
    Sparkles,
    Image,
    ChevronRight,
    Plus,
    FolderOpen,
} from "lucide-react";
import { onAuthChange, signOut } from "@/lib/auth";
import { User } from "firebase/auth";
import { subscribeToNotes, Note } from "@/lib/notes";
import { subscribeToPrompts, Prompt } from "@/lib/prompts";
import { subscribeToAssets, Asset } from "@/lib/assets";
import { subscribeToDocuments, Document } from "@/lib/documents";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Stats
    const [notes, setNotes] = useState<Note[]>([]);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

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

    // Subscribe to data for stats
    useEffect(() => {
        if (!user) return;

        const unsubNotes = subscribeToNotes(user.uid, setNotes);
        const unsubPrompts = subscribeToPrompts(user.uid, setPrompts);
        const unsubAssets = subscribeToAssets(user.uid, setAssets);
        const unsubDocuments = subscribeToDocuments(user.uid, setDocuments);

        return () => {
            unsubNotes();
            unsubPrompts();
            unsubAssets();
            unsubDocuments();
        };
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    // Calculate stats
    const noteCount = notes.filter((n) => n.type === "NOTE").length;
    const passwordCount = notes.filter((n) => n.type === "PASSWORD").length;
    const promptCount = prompts.length;
    const assetCount = assets.length;
    const documentCount = documents.length;

    // Recent items
    const recentNotes = notes.slice(0, 3);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
                <Loader2 className="w-8 h-8 text-[#D1F441] animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0f0f0f] p-4 sm:p-6">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 flex items-center justify-center">
                        <img src="/logo.png" alt="IbraBrain" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-bold text-white">IbraBrain</h1>
                </div>

                <div className="flex items-center gap-4">
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
            </motion.header>

            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-8"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    Welcome back, {user?.displayName?.split(" ")[0] || "User"}! 👋
                </h2>
                <p className="text-white/50">Your digital brain is ready.</p>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Notes Widget */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push("/notes")}
                    className="col-span-2 bg-gradient-to-br from-[#1a1a1a] to-[#1a1a1a]/50 rounded-2xl border border-white/10 hover:border-[#D1F441]/30 p-6 cursor-pointer transition-all group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#D1F441]/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-[#D1F441]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Notes</h3>
                                <p className="text-sm text-white/40">{noteCount} notes</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#D1F441] group-hover:translate-x-1 transition-all" />
                    </div>
                    {/* Recent Notes */}
                    {recentNotes.length > 0 ? (
                        <div className="space-y-2">
                            {recentNotes.map((note) => (
                                <div
                                    key={note.id}
                                    className="flex items-center gap-2 text-sm text-white/60 truncate"
                                >
                                    {note.type === "PASSWORD" ? (
                                        <Lock className="w-3 h-3 text-amber-400" />
                                    ) : (
                                        <FileText className="w-3 h-3" />
                                    )}
                                    <span className="truncate">{note.title || "Untitled"}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-white/30 italic">No notes yet</p>
                    )}
                </motion.div>

                {/* Passwords Widget */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push("/notes")}
                    className="bg-gradient-to-br from-[#1a1a1a] to-[#1a1a1a]/50 rounded-2xl border border-white/10 hover:border-amber-400/30 p-6 cursor-pointer transition-all"
                >
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center mb-3">
                        <Lock className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{passwordCount}</h3>
                    <p className="text-sm text-white/40">Passwords</p>
                </motion.div>

                {/* Prompts Widget */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push("/creative")}
                    className="bg-gradient-to-br from-[#1a1a1a] to-[#1a1a1a]/50 rounded-2xl border border-white/10 hover:border-[#D1F441]/30 p-6 cursor-pointer transition-all"
                >
                    <div className="w-12 h-12 rounded-xl bg-[#D1F441]/10 flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-[#D1F441]" />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{promptCount}</h3>
                    <p className="text-sm text-white/40">AI Prompts</p>
                </motion.div>

                {/* Documents Widget */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.22 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push("/documents")}
                    className="bg-gradient-to-br from-[#1a1a1a] to-[#1a1a1a]/50 rounded-2xl border border-white/10 hover:border-cyan-400/30 p-6 cursor-pointer transition-all"
                >
                    <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-3">
                        <FolderOpen className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{documentCount}</h3>
                    <p className="text-sm text-white/40">Documents</p>
                </motion.div>

                {/* Creative Hub Widget */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push("/creative")}
                    className="col-span-2 bg-gradient-to-br from-[#5D5FEF]/10 to-[#1a1a1a] rounded-2xl border border-white/10 hover:border-[#5D5FEF]/30 p-6 cursor-pointer transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#5D5FEF]/20 flex items-center justify-center">
                                <Image className="w-6 h-6 text-[#5D5FEF]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Creative Hub</h3>
                                <p className="text-sm text-white/40">
                                    {assetCount} assets · {promptCount} prompts
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#5D5FEF] group-hover:translate-x-1 transition-all" />
                    </div>
                </motion.div>

                {/* Quick Add Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/notes")}
                    className="col-span-2 bg-[#D1F441] hover:bg-[#c5e83b] rounded-2xl p-6 cursor-pointer transition-all flex items-center justify-center gap-3"
                >
                    <Plus className="w-6 h-6 text-[#0f0f0f]" />
                    <span className="text-lg font-bold text-[#0f0f0f]">Quick Add Note</span>
                </motion.div>
            </div>
        </main>
    );
}
