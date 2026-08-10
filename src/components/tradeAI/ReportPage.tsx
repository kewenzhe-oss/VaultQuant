"use client";

import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { CustomButton } from "../CustomButton";
import GeneratedReport from "./GeneratedReport";
import { Category, ReportType, OpenPositionPayload, PortfolioRiskSummary } from "@/types/tradeAI.types";
import { saveReport } from "@/server/actions/archive";
import { toast } from "sonner";
import CategoryInfoTip from "./CategoryInfoTip";
import LiveExposureChecklist from "./LiveExposureChecklist";

import { Trades } from "@/types";

interface ReportPageProps {
    goBackButton: string;
    tokens?: number | undefined;
    report: ReportType | null;
    setReport: React.Dispatch<React.SetStateAction<ReportType | null>>;
    setTokens?: React.Dispatch<React.SetStateAction<number | undefined>>;
    enrichedTrades?: Trades[] | null;
    openPositions?: OpenPositionPayload[] | null;
    portfolioSummary?: PortfolioRiskSummary | null;
}

export default function ReportPage({
    goBackButton,
    report,
    setReport,
    setTokens,
    enrichedTrades,
    openPositions,
    portfolioSummary,
}: ReportPageProps) {
    const [selectCategory, setSelectCategory] =
        useState<Category>("moneyManagement");

    const handleSaveReport = async () => {
        if (report) {
            const response = await saveReport(report);
            toast.success("The report has been saved successfully!");
            console.log(response);
        } else {
            toast.error("Try again later!");
        }
    };

    // Connect data pipeline: read from props or from report object (for archived reports)
    const checklist = report?.liveExposureChecklist;
    const summary = portfolioSummary ?? report?.portfolioSummary ?? null;
    const positions = openPositions ?? report?.openPositions ?? null;

    if (report) {
        return (
            <div className="flex flex-col justify-between h-full pb-2">
                <div className="relative flex max-md:flex-col md:items-center justify-between px-4 py-4 md:px-8">
                    <Link
                        href={`/private/${
                            goBackButton === "Archive"
                                ? "reports-history"
                                : "tradeAI"
                        }`}
                        className="relative group hidden md:inline-block cursor-pointer">
                        <div className="flex items-center gap-2 mb-2 text-[#3D3929]">
                            <ArrowUpLeft size={16} />
                            {goBackButton}
                        </div>
                        <span className="absolute left-0 bottom-0 block h-[0.3px] w-0 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>

                    <div className="flex gap-2 md:gap-6">
                        <Select
                            value={selectCategory}
                            onValueChange={(value: Category) =>
                                setSelectCategory(value)
                            }>
                            <SelectTrigger className="w-[200px] hover:bg-[#f1efe8] rounded-lg duration-300 text-zinc-700 font-medium">
                                <SelectValue placeholder="Choose category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="moneyManagement">
                                        Money management
                                    </SelectItem>
                                    <SelectItem value="instruments">
                                        Instruments
                                    </SelectItem>
                                    <SelectItem value="timeManagement">
                                        Time management
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <CustomButton
                            onClick={handleSaveReport}
                            isBlack={false}>
                            Save report
                        </CustomButton>
                    </div>
                </div>

                {/* Real-time Open Positions Risk & Safety Checklist */}
                <LiveExposureChecklist
                    checklist={checklist}
                    portfolioSummary={summary}
                    openPositions={positions}
                />

                {/* Info tip explaining the selected category */}
                <CategoryInfoTip category={selectCategory} />

                <GeneratedReport
                    report={report}
                    setReport={setReport}
                    setTokens={setTokens}
                    selectCategory={selectCategory}
                    enrichedTrades={enrichedTrades}
                    openPositions={positions}
                    portfolioSummary={summary}
                />
            </div>
        );
    } else {
        return (
            <div className="h-screen flex items-center justify-center">
                <GeneratedReport
                    report={report}
                    setReport={setReport}
                    setTokens={setTokens}
                    selectCategory={selectCategory}
                    enrichedTrades={enrichedTrades}
                    openPositions={positions}
                    portfolioSummary={summary}
                />
            </div>
        );
    }
}
