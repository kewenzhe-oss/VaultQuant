import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// In-memory price cache — simple Map, keyed by symbol, with 60s TTL.
// Perfect for a personal trading journal: no Redis, no extra deps.
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 60_000; // 60 seconds

interface CacheEntry {
    price: number | null;
    fetchedAt: number; // Date.now()
}

const priceCache = new Map<string, CacheEntry>();

/**
 * Normalise a user-entered symbol to a Yahoo Finance ticker.
 * - Crypto: "BTC", "ETH" → "BTC-USD", "ETH-USD"
 * - Already has "-USD" suffix or contains "." → pass through unchanged
 * - Everything else → pass through (US stocks work as-is: AAPL, TSLA …)
 */
function normaliseSymbol(raw: string): string {
    const upper = raw.trim().toUpperCase();
    // Common crypto suffixes — treat bare symbols as crypto vs. USD pairs
    const knownCrypto = ["BTC","ETH","SOL","BNB","XRP","DOGE","ADA","AVAX","MATIC","DOT","LINK","LTC","BCH","ATOM","UNI","NEAR","APT","ARB","OP","SUI"];
    if (knownCrypto.includes(upper)) return `${upper}-USD`;
    return upper;
}

/**
 * Fetch the latest price for a single symbol from Yahoo Finance.
 * Returns null if the symbol is unknown or the request fails.
 * Yahoo Finance v8 is free, no API key, ~15-20 min delayed for US stocks.
 */
async function fetchYahooPrice(symbol: string): Promise<number | null> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/json",
            },
            // 5-second server-side timeout
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;

        const json = await res.json();
        // Prefer regularMarketPrice from the meta object (most reliable)
        const meta = json?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice != null) {
            return Number(meta.regularMarketPrice);
        }
        return null;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// GET /api/market-price?symbols=AAPL,BTC-USD,TSLA
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
    const rawSymbols = req.nextUrl.searchParams.get("symbols") ?? "";
    if (!rawSymbols.trim()) {
        return NextResponse.json({});
    }

    const requestedSymbols = rawSymbols
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20); // guard: max 20 symbols per request

    const now = Date.now();
    const result: Record<string, number | null> = {};

    // Separate cached from stale/missing
    const toFetch: string[] = [];
    for (const rawSym of requestedSymbols) {
        const sym = normaliseSymbol(rawSym);
        const cached = priceCache.get(sym);
        if (cached && cached.price !== null && now - cached.fetchedAt < CACHE_TTL_MS) {
            result[rawSym] = cached.price;
        } else {
            toFetch.push(rawSym);
        }
    }

    // Fetch missing/stale symbols concurrently
    if (toFetch.length > 0) {
        await Promise.all(
            toFetch.map(async (rawSym) => {
                const sym = normaliseSymbol(rawSym);
                const price = await fetchYahooPrice(sym);
                if (price !== null) {
                    priceCache.set(sym, { price, fetchedAt: Date.now() });
                }
                result[rawSym] = price;
            })
        );
    }

    return NextResponse.json(result, {
        headers: {
            // Tell the browser to cache for 55 seconds so rapid re-renders don't re-hit us
            "Cache-Control": "public, max-age=55, stale-while-revalidate=10",
        },
    });
}
