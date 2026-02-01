"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthChange, signOut } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2, User as UserIcon, Moon, Monitor, Bell, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser: User | null) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#191919]">
                <Loader2 className="w-8 h-8 text-[#D1F441] animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-12 px-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="text-6xl select-none">⚙️</div>
                    <div>
                        <h1 className="text-4xl font-bold text-[#FFFFFF] mb-1">Settings</h1>
                        <p className="text-[#9B9B9B] text-lg">Manage your account and preferences.</p>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="space-y-8">

                    {/* Account Section */}
                    <section>
                        <h2 className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-3 px-1">Account</h2>
                        <div className="bg-[#202020] border border-[#2F2F2F] rounded-lg overflow-hidden">
                            <div className="p-4 flex items-center gap-4 border-b border-[#2F2F2F] last:border-0">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-[#3F3F3F] flex items-center justify-center">
                                        <UserIcon className="w-6 h-6 text-[#9B9B9B]" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-[#FFFFFF] font-medium">{user?.displayName || "User"}</h3>
                                    <p className="text-sm text-[#9B9B9B]">{user?.email}</p>
                                </div>
                                <button className="px-3 py-1.5 text-sm text-[#9B9B9B] hover:text-[#FFFFFF] border border-[#3F3F3F] rounded hover:bg-[#2C2C2C] transition-colors">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Preferences Section */}
                    <section>
                        <h2 className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-3 px-1">Preferences</h2>
                        <div className="bg-[#202020] border border-[#2F2F2F] rounded-lg overflow-hidden">

                            {/* Theme */}
                            <div className="p-4 flex items-center justify-between border-b border-[#2F2F2F] hover:bg-[#252525] transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#2C2C2C] rounded text-[#9B9B9B]">
                                        <Moon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-[#FFFFFF] text-sm font-medium">Appearance</h3>
                                        <p className="text-xs text-[#9B9B9B]">Dark mode is active</p>
                                    </div>
                                </div>
                                <span className="text-xs text-[#5A5A5A]">Manage</span>
                            </div>

                            {/* Notifications */}
                            <div className="p-4 flex items-center justify-between hover:bg-[#252525] transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#2C2C2C] rounded text-[#9B9B9B]">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-[#FFFFFF] text-sm font-medium">Notifications</h3>
                                        <p className="text-xs text-[#9B9B9B]">Customize your alerts</p>
                                    </div>
                                </div>
                                <span className="text-xs text-[#5A5A5A]">Manage</span>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section>
                        <h2 className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-3 px-1">Security</h2>
                        <div className="bg-[#202020] border border-[#2F2F2F] rounded-lg overflow-hidden">
                            <div
                                className="p-4 flex items-center gap-3 hover:bg-[#2C2C2C] transition-colors cursor-pointer text-red-400"
                                onClick={async () => await signOut()}
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Log Out</span>
                            </div>
                        </div>
                    </section>

                    {/* App Info */}
                    <div className="text-center pt-8 pb-4">
                        <p className="text-xs text-[#5A5A5A]">
                            IbraBrain v1.0.0 • Developed by Ibra
                        </p>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
