"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    Search,
    Home,
    Settings,
    Plus,
    ChevronRight,
    FileText,
    Hash,
    MoreHorizontal,
    Lock,
    Sparkles,
    FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "firebase/auth";

interface SidebarProps {
    user: User | null;
    onSignOut: () => void;
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
    const [isPrivateOpen, setIsPrivateOpen] = useState(true);

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Notes", href: "/notes", icon: FileText },
        { name: "Vault", href: "/vault", icon: Lock },
        { name: "Creative Hub", href: "/creative", icon: Sparkles },
        { name: "Documents", href: "/documents", icon: FolderOpen },
    ];

    return (
        <aside className="w-60 h-screen bg-[#202020] border-r border-[#2F2F2F] flex flex-col text-[#9B9B9B]">
            {/* User Profile / Workspace Switcher */}
            <div className="h-12 flex items-center px-4 hover:bg-[#2C2C2C] cursor-pointer transition-colors m-1 rounded-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-5 h-5 rounded-sm" />
                    ) : (
                        <div className="w-5 h-5 rounded-sm bg-[#3F3F3F] flex items-center justify-center text-[10px] text-white font-bold">
                            {user?.displayName?.[0] || "I"}
                        </div>
                    )}
                    <span className="text-sm font-medium text-[#FFFFFF] truncate">
                        {user?.displayName ? `${user.displayName}'s Brain` : "Ibra's Brain"}
                    </span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-2 py-1 space-y-0.5">
                <div className="h-7 flex items-center px-3 hover:bg-[#2C2C2C] rounded-sm cursor-pointer text-sm gap-3 group">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                    <span className="ml-auto text-xs opacity-0 group-hover:opacity-100 border border-[#3F3F3F] rounded px-1">Ctrl K</span>
                </div>
                <div className="h-7 flex items-center px-3 hover:bg-[#2C2C2C] rounded-sm cursor-pointer text-sm gap-3">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
                {/* Favorites Section */}
                <div className="mb-4">
                    <div
                        className="flex items-center gap-1 px-1 py-1 hover:bg-[#2C2C2C] rounded-sm cursor-pointer text-xs font-medium mb-0.5 group"
                        onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                    >
                        <ChevronRight className={cn("w-3 h-3 transition-transform", isFavoritesOpen && "rotate-90")} />
                        <span>Favorites</span>
                    </div>
                    {isFavoritesOpen && (
                        <div className="space-y-0.5">
                            {/* Placeholder for favorites */}
                            <div className="px-6 py-1 text-xs text-[#5A5A5A]">No favorites yet</div>
                        </div>
                    )}
                </div>

                {/* Private Section */}
                <div className="mb-4">
                    <div
                        className="flex items-center gap-1 px-1 py-1 hover:bg-[#2C2C2C] rounded-sm cursor-pointer text-xs font-medium mb-0.5 group"
                        onClick={() => setIsPrivateOpen(!isPrivateOpen)}
                    >
                        <ChevronRight className={cn("w-3 h-3 transition-transform", isPrivateOpen && "rotate-90")} />
                        <span>Private</span>
                        <Plus className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 hover:bg-[#3F3F3F] rounded" />
                    </div>

                    {isPrivateOpen && (
                        <div className="space-y-0.5">
                            {navigation.map((item) => (
                                <div
                                    key={item.href}
                                    onClick={() => router.push(item.href)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-sm cursor-pointer text-sm group min-h-[28px]",
                                        pathname === item.href ? "bg-[#2C2C2C] text-[#FFFFFF]" : "hover:bg-[#2C2C2C] text-[#9B9B9B]"
                                    )}
                                >
                                    <item.icon className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{item.name}</span>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center">
                                        <MoreHorizontal className="w-3 h-3 hover:text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-2 border-t border-[#2F2F2F]">
                <div
                    onClick={onSignOut}
                    className="h-8 flex items-center px-2 hover:bg-[#2C2C2C] rounded-sm cursor-pointer text-sm gap-2 text-[#9B9B9B] hover:text-[#FFFFFF]"
                >
                    <div className="w-4 h-4 flex items-center justify-center">
                        <span className="text-xs">➜</span>
                    </div>
                    <span>Log out</span>
                </div>
                <div className="h-8 flex items-center px-2 hover:bg-[#2C2C2C] rounded-sm cursor-pointer text-sm gap-2 text-[#9B9B9B] hover:text-[#FFFFFF] mt-1">
                    <Plus className="w-4 h-4" />
                    <span>New Page</span>
                </div>
            </div>
        </aside>
    );
}
