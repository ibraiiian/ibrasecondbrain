"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Plus, Search } from "lucide-react";
import { onAuthChange } from "@/lib/auth";
import { User } from "firebase/auth";
import { subscribeToNotes, Note } from "@/lib/notes";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function VaultPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser: User | null) => {
            if (currentUser) {
                setUser(currentUser);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsubNotes = subscribeToNotes(user.uid, (allNotes) => {
            // Filter only passwords
            setNotes(allNotes.filter(n => n.type === 'PASSWORD'));
        });
        return () => unsubNotes();
    }, [user]);

    // Notion Gallery View Card
    const VaultCard = ({ note }: { note: Note }) => (
        <div
            className="group relative flex flex-col rounded-md bg-[#202020] border border-[#2F2F2F] hover:bg-[#2C2C2C] transition-colors cursor-pointer overflow-hidden h-40"
            onClick={() => router.push(`/notes?id=${note.id}`)} // Assuming navigating to notes with ID opens modal
        >
            {/* Cover Preview (Placeholder) */}
            <div className="h-1/2 bg-[#2C2C2C] w-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#5A5A5A]" />
            </div>

            {/* Content */}
            <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🔐</span>
                    <h3 className="text-sm font-medium text-[#FFFFFF] truncate">{note.title || "Untitled"}</h3>
                </div>
                {/* Properties / Tags */}
                <div className="flex gap-1 mt-2">
                    <span className="px-1.5 py-0.5 rounded bg-red-900/30 text-red-200 text-[10px]">
                        Password
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#3F3F3F] text-[#9B9B9B] text-[10px]">
                        {new Date((note.updatedAt?.seconds || 0) * 1000).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto py-12 px-8">
                {/* Page Header */}
                <div className="mb-8 relative group">
                    <div className="flex items-center gap-4">
                        <div className="text-6xl select-none">🔐</div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#FFFFFF] mb-1">Vault</h1>
                            <p className="text-[#9B9B9B] text-lg">Secure storage for your sensitive data.</p>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#2F2F2F]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[#FFFFFF] font-medium border-b-2 border-[#FFFFFF] pb-2 text-sm">
                            Gallery View
                        </div>
                        <div className="flex items-center gap-2 text-[#9B9B9B] hover:text-[#FFFFFF] pb-2 text-sm cursor-pointer transition-colors">
                            List View
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2C2C2C] rounded text-sm text-[#9B9B9B] cursor-pointer">
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </div>
                        <button className="flex items-center gap-1 bg-[#5D5FEF] hover:bg-[#4b4dcf] text-white px-3 py-1 rounded-sm text-sm font-medium transition-colors">
                            <Plus className="w-4 h-4" />
                            New
                        </button>
                    </div>
                </div>

                {/* Gallery Grid */}
                {notes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {notes.map(note => (
                            <VaultCard key={note.id} note={note} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-[#5A5A5A]">
                        <Lock className="w-12 h-12 mb-4 opacity-20" />
                        <p>Your vault is empty</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
