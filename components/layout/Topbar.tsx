"use client";

import { usePathname } from "next/navigation";
import { Star, MoreHorizontal, Clock } from "lucide-react";

export function Topbar() {
    const pathname = usePathname();

    // Clean up pathname for breadcrumbs (e.g., "/dashboard" -> "Dashboard")
    const breadcrumbs = pathname
        .split("/")
        .filter(Boolean)
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1));

    if (breadcrumbs.length === 0) breadcrumbs.push("Dashboard");

    return (
        <div className="h-11 flex items-center justify-between px-3 sticky top-0 z-10 bg-[#191919] text-[#9B9B9B]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 text-sm overflow-hidden whitespace-nowrap">
                {breadcrumbs.map((crumb, index) => (
                    <div key={crumb} className="flex items-center gap-1">
                        {index > 0 && <span className="text-[#5A5A5A]">/</span>}
                        <div className="flex items-center gap-1 hover:bg-[#2C2C2C] px-1.5 py-0.5 rounded-sm cursor-pointer transition-colors">
                            <span className={index === breadcrumbs.length - 1 ? "text-[#FFFFFF]" : ""}>
                                {index === 0 ? "Workspace" : crumb}
                            </span>
                        </div>
                        {/* If it's the last item, show the actual page name if different or just keep it */}
                        {index === 0 && breadcrumbs.length == 1 && (
                            <>
                                <span className="text-[#5A5A5A]">/</span>
                                <span className="text-[#FFFFFF] px-1.5">{crumb}</span>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Page Actions */}
            <div className="flex items-center gap-1">
                <div className="text-xs text-[#5A5A5A] px-2">Edited just now</div>

                <button className="p-1 hover:bg-[#2C2C2C] rounded-sm transition-colors text-[#9B9B9B] hover:text-[#FFFFFF]">
                    <span className="text-xs font-medium px-1">Share</span>
                </button>

                <button className="p-1 hover:bg-[#2C2C2C] rounded-sm transition-colors text-[#9B9B9B] hover:text-[#FFFFFF]">
                    <Clock className="w-4 h-4" />
                </button>

                <button className="p-1 hover:bg-[#2C2C2C] rounded-sm transition-colors text-[#9B9B9B] hover:text-[#FFFFFF]">
                    <Star className="w-4 h-4" />
                </button>

                <button className="p-1 hover:bg-[#2C2C2C] rounded-sm transition-colors text-[#9B9B9B] hover:text-[#FFFFFF]">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
