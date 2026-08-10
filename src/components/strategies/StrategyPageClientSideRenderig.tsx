"use client";

import { Strategy } from "@/types/strategies.types";
import React, { useEffect } from "react";
import StrategyCard from "./Strategy";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setStrategyState } from "@/redux/slices/strategySlice";
import StrategyInfoBanner from "./StrategyInfoBanner";

export default function StrategyPageClientSideRenderig({
    strategies,
    hideAll = false,
}: {
    strategies: Strategy[];
    hideAll?: boolean;
}) {
    const dispatch = useAppDispatch();

    const { strategies: localStrategies, searchQuery } = useAppSelector(
        (state) => state.strategies
    );

    // Filter strategies based on search query
    const filteredStrategies = localStrategies.filter((strategy) =>
        strategy.strategyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        dispatch(setStrategyState(strategies));
    }, [dispatch, strategies]);

    return (
        <div className="px-2 md:px-8 py-2 md:py-4 space-y-4 overflow-scroll flex-1 min-h-0">
            <StrategyInfoBanner />
            {filteredStrategies.length > 0 ? (
                filteredStrategies.map((strategy) => (
                    <StrategyCard key={strategy.id} strategy={strategy} hideAll={hideAll} />
                ))
            ) : (
                <div className="text-center py-12 text-zinc-500">
                    {searchQuery ?
                        `No strategies found matching "${searchQuery}"` :
                        "No strategies found. Create your first strategy!"
                    }
                </div>
            )}
        </div>
    );
}
