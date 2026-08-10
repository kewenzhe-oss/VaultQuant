import Odometer from "@/features/odometer/Odometer";
import AddCapitalDialog from "./AddCapitalDialog";
import { Pencil } from "lucide-react";

interface OdometerConditionalRenderingProps {
    startingCapital: number;
    currentEquity: number;
    netRealizedPnL: number;
    unrealizedPnL: number;
    openPositionExposure: number;
    exposureMultiple: number;
    hasCapital: boolean;
}

export default function OdometerConditionalRendering({
    startingCapital,
    currentEquity,
    netRealizedPnL,
    unrealizedPnL,
    openPositionExposure,
    exposureMultiple,
    hasCapital,
}: OdometerConditionalRenderingProps) {
    if (!hasCapital) {
        return (
            <div className="flex justify-center items-center py-6 w-full">
                <AddCapitalDialog />
            </div>
        );
    }

    const isRealizedPositive = netRealizedPnL >= 0;
    const isUnrealizedPositive = unrealizedPnL >= 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 w-full">
            {/* 1. Starting Capital */}
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-colors flex flex-col justify-between min-w-0">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">Starting Capital</p>
                    <div className="flex items-start gap-1 mt-2 min-w-0">
                        <span className="text-xl xl:text-2xl font-bold text-zinc-900 tracking-tight leading-none font-mono tabular-nums truncate">
                            ${Math.round(startingCapital).toLocaleString()}
                        </span>
                        <AddCapitalDialog
                            trigger={
                                <button 
                                    className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-0.5 rounded transition-colors self-start shrink-0"
                                    title="Edit Starting Capital"
                                >
                                    <Pencil size={13} />
                                </button>
                            }
                        />
                    </div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 truncate">Initial allocated investment funds.</p>
            </div>

            {/* 2. Current Equity */}
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-colors flex flex-col justify-between min-w-0">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">Current Equity</p>
                    <div className="mt-2 min-h-[28px] flex items-start font-mono tabular-nums min-w-0 overflow-hidden">
                        {isNaN(currentEquity) || currentEquity < 0 ? (
                            <span className={`text-xl xl:text-2xl font-bold tracking-tight leading-none truncate ${currentEquity < 0 ? "text-rose-600" : "text-zinc-900"}`}>
                                {currentEquity < 0 ? "-" : ""}${Math.abs(Math.round(currentEquity)).toLocaleString()}
                            </span>
                        ) : (
                            <Odometer
                                start={Math.round(startingCapital)}
                                end={Math.round(currentEquity)}
                                width={14}
                                height={24}
                                labelText="$"
                                labelSize={24}
                            />
                        )}
                    </div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 truncate">Total value including floating P&L.</p>
            </div>

            {/* 3. Net Realized P&L */}
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-colors flex flex-col justify-between min-w-0">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">Net Realized P&L</p>
                    <span className={`text-xl xl:text-2xl font-bold font-mono tabular-nums tracking-tight mt-2 inline-flex items-baseline gap-1 leading-none truncate ${isRealizedPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        <span className="relative top-[1px] text-xs leading-none shrink-0">{isRealizedPositive ? "▲" : "▼"}</span>
                        <span className="truncate">{isRealizedPositive ? "+" : "-"}${Math.abs(Math.round(netRealizedPnL)).toLocaleString()}</span>
                    </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 truncate">Closed trade returns.</p>
            </div>

            {/* 4. Unrealized P&L */}
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-colors flex flex-col justify-between min-w-0">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">Unrealized P&L</p>
                    <span className={`text-xl xl:text-2xl font-bold font-mono tabular-nums tracking-tight mt-2 inline-flex items-baseline gap-1 leading-none truncate ${isUnrealizedPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        <span className="relative top-[1px] text-xs leading-none shrink-0">{isUnrealizedPositive ? "▲" : "▼"}</span>
                        <span className="truncate">{isUnrealizedPositive ? "+" : "-"}${Math.abs(Math.round(unrealizedPnL)).toLocaleString()}</span>
                    </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 truncate">Floating portfolio profit.</p>
            </div>

            {/* 5. Open Exposure */}
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-colors flex flex-col justify-between min-w-0">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">Open Exposure</p>
                    <span className="text-xl xl:text-2xl font-bold font-mono tabular-nums text-zinc-900 tracking-tight mt-2 block leading-none truncate">
                        ${Math.round(openPositionExposure).toLocaleString()}
                    </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 truncate">Total size under risk.</p>
            </div>

            {/* 6. Exposure Multiple */}
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-colors flex flex-col justify-between min-w-0">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">Exposure Multiple</p>
                    <span className="text-xl xl:text-2xl font-bold font-mono tabular-nums text-zinc-900 tracking-tight mt-2 block leading-none truncate">
                        {exposureMultiple.toFixed(2)}x
                    </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 truncate">Risk size vs Equity.</p>
            </div>
        </div>
    );
}
