"use client";

import React from "react";
import { Category } from "@/types/tradeAI.types";
import { DollarSign, BarChart3, Clock, Sparkles, ShieldCheck } from "lucide-react";

interface CategoryInfoTipProps {
    category: Category;
}

const CATEGORY_DETAILS: Record<
    Category,
    {
        title: string;
        badge: string;
        badgeType: "rule" | "ai";
        description: string;
        icon: React.ReactNode;
    }
> = {
    moneyManagement: {
        title: "Money Management",
        badge: "Rule Engine",
        badgeType: "rule",
        description: "Evaluates Long vs Short win rates and calculates minimum Risk-to-Reward ratio (R:R).",
        icon: <DollarSign className="w-3.5 h-3.5 text-emerald-600" />,
    },
    instruments: {
        title: "Instruments",
        badge: "Rule Engine",
        badgeType: "rule",
        description: "Ranks Top 3 profitable assets & Worst 3 loss-making assets with potential savings.",
        icon: <BarChart3 className="w-3.5 h-3.5 text-blue-600" />,
    },
    timeManagement: {
        title: "Time Management",
        badge: "AI Reasoning Model",
        badgeType: "ai",
        description: "Analyzes 3-hour trading time windows to uncover optimal hours & emotional habits.",
        icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    },
};

export default function CategoryInfoTip({ category }: CategoryInfoTipProps) {
    const details = CATEGORY_DETAILS[category];

    if (!details) return null;

    return (
        <div className="mx-4 md:mx-8 mb-2 px-3 py-1.5 rounded-lg bg-neutral-50/80 border border-neutral-200/70 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 bg-white rounded-md border border-neutral-200 shadow-2xs shrink-0">
                    {details.icon}
                </div>
                <span className="font-semibold text-neutral-800 text-[11px] shrink-0">
                    {details.title}:
                </span>
                <span className="text-neutral-500 text-[11px] truncate">
                    {details.description}
                </span>
            </div>
            {details.badgeType === "ai" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0 font-mono">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {details.badge}
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    {details.badge}
                </span>
            )}
        </div>
    );
}
