"use client";

// Skeleton Loading Components
import { motion } from "framer-motion";

// Base Skeleton component
interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
        </div>
    );
}

// Note Card Skeleton
export function NoteCardSkeleton() {
    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-5">
            <div className="flex items-start gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center gap-2 mt-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        </div>
    );
}

// Prompt Card Skeleton
export function PromptCardSkeleton() {
    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-5">
            <div className="flex items-start gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                </div>
            </div>
            <div className="space-y-2 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-8 w-full rounded-lg mb-3" />
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-7 w-18 rounded-full" />
            </div>
        </div>
    );
}

// Asset Card Skeleton
export function AssetCardSkeleton() {
    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3">
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}

// Dashboard Widget Skeleton
export function DashboardWidgetSkeleton() {
    return (
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-12" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </div>
    );
}

// Grid Skeleton wrapper
interface GridSkeletonProps {
    count?: number;
    Skeleton: React.ComponentType;
    columns?: string;
}

export function GridSkeleton({
    count = 6,
    Skeleton: SkeletonComponent,
    columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: GridSkeletonProps) {
    return (
        <div className={`grid ${columns} gap-4`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <SkeletonComponent />
                </motion.div>
            ))}
        </div>
    );
}
