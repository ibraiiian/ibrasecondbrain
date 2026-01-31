"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    Lock,
    Sparkles,
    Image,
    Clock,
    ArrowUpRight,
    Search
} from "lucide-react";
import { onAuthChange } from "@/lib/auth";
import { User } from "firebase/auth";
import { subscribeToNotes, Note } from "@/lib/notes";
import { subscribeToPrompts, Prompt } from "@/lib/prompts";
import { subscribeToAssets, Asset } from "@/lib/assets";
import { subscribeToDocuments, Document } from "@/lib/documents";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    // Stats
    const [notes, setNotes] = useState<Note[]>([]);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser: User | null) => {
            if (currentUser) {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to data
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

    // Calculate stats
    const recentNotes = notes.slice(0, 5); // Show more recent items

    // Determine greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-12 px-8">
                {/* Header Section */}
                <div className="mb-12 group relative">
                    {/* Cover Placeholder - Icon */}
                    <div className="absolute -top-16 left-0 text-7xl select-none animate-in fade-in zoom-in duration-300">
                        🧠
                    </div>

                    <h1 className="text-4xl font-bold text-[#FFFFFF] mt-4 mb-2">
                        {getGreeting()}, {user?.displayName?.split(" ")[0] || "User"}
                    </h1>
                </div>

                {/* Callout Blocks (Quick Stats) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className="p-4 bg-[#202020] rounded-md border border-[#2F2F2F] flex items-start gap-4 hover:bg-[#252525] transition-colors cursor-pointer" onClick={() => router.push('/notes')}>
                        <FileText className="w-5 h-5 text-[#9B9B9B] mt-0.5" />
                        <div>
                            <h3 className="text-[#FFFFFF] font-medium mb-1">Quick Note</h3>
                            <p className="text-sm text-[#9B9B9B]">Capture a thought...</p>
                        </div>
                    </div>
                    <div className="p-4 bg-[#202020] rounded-md border border-[#2F2F2F] flex items-start gap-4 hover:bg-[#252525] transition-colors cursor-pointer" onClick={() => router.push('/creative')}>
                        <Sparkles className="w-5 h-5 text-[#9B9B9B] mt-0.5" />
                        <div>
                            <h3 className="text-[#FFFFFF] font-medium mb-1">New Prompt</h3>
                            <p className="text-sm text-[#9B9B9B]">Ask AI something...</p>
                        </div>
                    </div>
                </div>

                {/* 3-Column Shortcuts / Wiki Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Column 1: Workspace */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-[#9B9B9B] mb-3 uppercase tracking-wider">Workspace</h2>
                        <button onClick={() => router.push('/notes')} className="w-full flex items-center gap-2 p-1 hover:bg-[#2C2C2C] rounded-sm text-[#FFFFFF] transition-colors group">
                            <div className="w-5 h-5 flex items-center justify-center bg-[#2C2C2C] group-hover:bg-[#3F3F3F] rounded text-xs">📝</div>
                            <span className="text-sm border-b border-transparent group-hover:border-[#5A5A5A]">All Notes</span>
                        </button>
                        <button onClick={() => router.push('/documents')} className="w-full flex items-center gap-2 p-1 hover:bg-[#2C2C2C] rounded-sm text-[#FFFFFF] transition-colors group">
                            <div className="w-5 h-5 flex items-center justify-center bg-[#2C2C2C] group-hover:bg-[#3F3F3F] rounded text-xs">📂</div>
                            <span className="text-sm border-b border-transparent group-hover:border-[#5A5A5A]">Documents</span>
                        </button>
                        <button onClick={() => router.push('/vault')} className="w-full flex items-center gap-2 p-1 hover:bg-[#2C2C2C] rounded-sm text-[#FFFFFF] transition-colors group">
                            <div className="w-5 h-5 flex items-center justify-center bg-[#2C2C2C] group-hover:bg-[#3F3F3F] rounded text-xs">🔐</div>
                            <span className="text-sm border-b border-transparent group-hover:border-[#5A5A5A]">Vault</span>
                        </button>
                    </div>

                    {/* Column 2: Creative */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-[#9B9B9B] mb-3 uppercase tracking-wider">Creative</h2>
                        <button onClick={() => router.push('/creative')} className="w-full flex items-center gap-2 p-1 hover:bg-[#2C2C2C] rounded-sm text-[#FFFFFF] transition-colors group">
                            <div className="w-5 h-5 flex items-center justify-center bg-[#2C2C2C] group-hover:bg-[#3F3F3F] rounded text-xs">✨</div>
                            <span className="text-sm border-b border-transparent group-hover:border-[#5A5A5A]">AI Prompts</span>
                        </button>
                        <button onClick={() => router.push('/creative')} className="w-full flex items-center gap-2 p-1 hover:bg-[#2C2C2C] rounded-sm text-[#FFFFFF] transition-colors group">
                            <div className="w-5 h-5 flex items-center justify-center bg-[#2C2C2C] group-hover:bg-[#3F3F3F] rounded text-xs">🎨</div>
                            <span className="text-sm border-b border-transparent group-hover:border-[#5A5A5A]">Assets</span>
                        </button>
                    </div>

                    {/* Column 3: Stats */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-[#9B9B9B] mb-3 uppercase tracking-wider">Overview</h2>
                        <div className="flex items-center justify-between text-sm py-1 border-b border-[#2F2F2F]">
                            <span className="text-[#9B9B9B]">Total Notes</span>
                            <span className="text-[#FFFFFF]">{notes.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-1 border-b border-[#2F2F2F]">
                            <span className="text-[#9B9B9B]">Vault Items</span>
                            <span className="text-[#FFFFFF]">{notes.filter(n => n.type === 'PASSWORD').length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-1 border-b border-[#2F2F2F]">
                            <span className="text-[#9B9B9B]">Assets</span>
                            <span className="text-[#FFFFFF]">{assets.length}</span>
                        </div>
                    </div>
                </div>

                {/* Recently Viewed */}
                <div>
                    <h2 className="text-sm font-semibold text-[#9B9B9B] mb-3 pb-2 border-b border-[#2F2F2F]">Recently Viewed</h2>
                    <div className="space-y-1">
                        {recentNotes.length > 0 ? recentNotes.map(note => (
                            <div key={note.id} className="flex items-center gap-2 p-2 hover:bg-[#2C2C2C] rounded-sm cursor-pointer group" onClick={() => router.push('/notes')}>
                                <FileText className="w-4 h-4 text-[#9B9B9B]" />
                                <span className="text-sm text-[#FFFFFF] group-hover:underline decoration-[#5A5A5A] underline-offset-4">{note.title || "Untitled"}</span>
                                <span className="text-xs text-[#5A5A5A] ml-auto">
                                    {note.updatedAt?.seconds ? new Date(note.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                        )) : (
                            <p className="text-sm text-[#5A5A5A] italic pl-2">No recent items</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

