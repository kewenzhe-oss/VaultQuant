"use client";

import React, { useState } from "react";
import { Lightbulb, CheckCircle2, ChevronDown, ChevronUp, X } from "lucide-react";

export default function StrategyInfoBanner() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed) return null;

    return (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white border border-blue-100 rounded-xl p-4 shadow-xs text-neutral-800 transition-all mb-4">
            {/* Header / Summary Line */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
                        <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">
                            How Trading Strategies Work
                        </h3>
                        <p className="text-xs text-neutral-500">
                            Build a rule-based plan to eliminate emotional trading and track your execution discipline.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-blue-100/50 transition-colors"
                    >
                        {isExpanded ? "Hide Sample" : "Show Sample"}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={() => setIsDismissed(true)}
                        className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                        title="Dismiss info"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expanded Content with Tips & Sample Strategy */}
            {isExpanded && (
                <div className="mt-3.5 pt-3.5 border-t border-blue-100/80 grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                    {/* Concept Guide */}
                    <div className="md:col-span-5 space-y-2">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-700 block">
                            💡 Core Concept
                        </span>
                        <p className="text-neutral-600 leading-relaxed">
                            Define objective <strong className="text-neutral-800">Open</strong> &amp; <strong className="text-neutral-800">Close</strong> position checklists for your strategy. When logging trades, check off the rules you followed to calculate your <strong className="text-blue-700">Discipline Score (%)</strong>.
                        </p>
                        <div className="flex items-center gap-1.5 text-neutral-500 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Keep rules quantifiable (e.g. indicators, price levels, R:R).</span>
                        </div>
                    </div>

                    {/* Sample Strategy Card */}
                    <div className="md:col-span-7 bg-white/90 border border-neutral-200/80 rounded-lg p-3 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                            <span className="font-semibold text-neutral-800 text-xs flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Sample Strategy: Trend Breakout Plan
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">EXAMPLE</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                            {/* Sample Open Rules */}
                            <div className="space-y-1">
                                <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px] block">
                                    Open Position Rules:
                                </span>
                                <ul className="space-y-1 text-neutral-600">
                                    <li className="flex items-start gap-1">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span>Price closes above 20-day SMA with &gt;1.5x avg volume</span>
                                    </li>
                                    <li className="flex items-start gap-1">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span>Risk-to-Reward ratio (R:R) &ge; 2:1</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Sample Close Rules */}
                            <div className="space-y-1">
                                <span className="font-semibold text-rose-700 uppercase tracking-wider text-[10px] block">
                                    Close Position Rules:
                                </span>
                                <ul className="space-y-1 text-neutral-600">
                                    <li className="flex items-start gap-1">
                                        <span className="text-rose-500 font-bold">✓</span>
                                        <span>Stop Loss: Closes below 20-day SMA (Max 2% risk)</span>
                                    </li>
                                    <li className="flex items-start gap-1">
                                        <span className="text-rose-500 font-bold">✓</span>
                                        <span>Take Profit: Scale out 50% at 2R target</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
