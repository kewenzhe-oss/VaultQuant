"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface MarketPricesState {
    prices: Record<string, number | null>;
    loading: boolean;
    lastUpdated: Date | null;
    error: boolean;
}

const REFRESH_INTERVAL_MS = 60_000; // match server cache TTL

/**
 * Custom hook that fetches live market prices for a set of symbols via
 * the /api/market-price internal API route and refreshes every 60 seconds.
 *
 * @param symbols - Array of raw symbol strings (e.g. ["AAPL", "BTC", "TSLA"])
 *
 * Usage:
 *   const { prices, loading, lastUpdated } = useMarketPrices(["AAPL", "TSLA"]);
 *   prices["AAPL"] → 189.50 | null
 */
export function useMarketPrices(symbols: string[]): MarketPricesState {
    const [prices, setPrices] = useState<Record<string, number | null>>({});
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState(false);

    // Stable key so useEffect doesn't re-fire on every render
    const symbolsKey = symbols.slice().sort().join(",");
    const prevKeyRef = useRef<string>("");

    const fetchPrices = useCallback(async (symbolList: string[]) => {
        if (symbolList.length === 0) return;
        setLoading(true);
        setError(false);
        try {
            const query = symbolList.join(",");
            const res = await fetch(`/api/market-price?symbols=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Failed to fetch prices");
            const data: Record<string, number | null> = await res.json();
            setPrices(data);
            setLastUpdated(new Date());
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (symbolsKey === "") return;

        // Immediate fetch on mount or symbols change
        const syms = symbolsKey.split(",");
        prevKeyRef.current = symbolsKey;
        fetchPrices(syms);

        // Auto-refresh
        const interval = setInterval(() => {
            fetchPrices(syms);
        }, REFRESH_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [symbolsKey, fetchPrices]);

    return { prices, loading, lastUpdated, error };
}
