"use client";

import React, { useState } from "react";
import { LiveChecklistItem, PortfolioRiskSummary, OpenPositionPayload } from "@/types/tradeAI.types";
import { ShieldCheck, AlertTriangle, AlertOctagon, Activity, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";

interface LiveExposureChecklistProps {
    checklist?: LiveChecklistItem[];
    portfolioSummary?: PortfolioRiskSummary | null;
    openPositions?: OpenPositionPayload[] | null;
}

export default function LiveExposureChecklist({
    checklist,
    portfolioSummary,
    openPositions,
}: LiveExposureChecklistProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Filter valid checklist items
    const hasItems = checklist && checklist.length > 0;
    const activePositionsCount = openPositions ? openPositions.length : (portfolioSummary?.totalOpenPositions || 0);

    // If there are no open positions and no specific AI risk items, do NOT render a dummy 0-position card to save space!
    if (!hasItems && activePositionsCount === 0) {
        return null;
    }

    const items = checklist || [];
    const isProfit = (portfolioSummary?.totalUnrealizedPnL || 0) >= 0;

    return (
        <div className="mx-4 md:mx-8 mb-2 bg-white border border-neutral-200/90 rounded-lg text-neutral-900 transition-all shadow-2xs">
            {/* Ultra-compact 1-line Header Bar (Height < 36px) */}
            <div className="px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 shrink-0">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <span className="font-semibold text-neutral-800 truncate">
                        Live Exposure &amp; Risk Checklist
                    </span>

                    {portfolioSummary && portfolioSummary.totalOpenPositions > 0 && (
                        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-neutral-500 border-l border-neutral-200 pl-2">
                            <span>{portfolioSummary.totalOpenPositions} Open</span>
                            <span>•</span>
                            <span>Value: ${portfolioSummary.totalPositionValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            <span>•</span>
                            <span className={`font-semibold flex items-center gap-0.5 ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
                                {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {isProfit ? "+" : ""}${portfolioSummary.totalUnrealizedPnL.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors shrink-0"
                >
                    {isExpanded ? "Hide Details" : `Risk Diagnosis (${items.length > 0 ? items.length : activePositionsCount})`}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Collapsible Details Panel (Only shown when user clicks to expand) */}
            {isExpanded && (
                <div className="px-3 pb-3 pt-2 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs bg-neutral-50/50 rounded-b-lg">
                    {items.map((item, idx) => {
                        const isSafe = item.status === "safe";
                        const isWarning = item.status === "warning";

                        return (
                            <div
                                key={idx}
                                className={`p-2.5 rounded-lg border transition-all text-xs flex items-start gap-2 ${
                                    isSafe
                                        ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
                                        : isWarning
                                        ? "bg-amber-50/60 border-amber-200/80 text-amber-950"
                                        : "bg-rose-50/60 border-rose-200/80 text-rose-950"
                                }`}
                            >
                                <div className="shrink-0 mt-0.5">
                                    {isSafe ? (
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : isWarning ? (
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    ) : (
                                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                                    )}
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <div className="font-semibold text-[11px] text-neutral-900 truncate">
                                        {item.title}
                                    </div>
                                    <p className="text-[10.5px] text-neutral-600 leading-tight">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
