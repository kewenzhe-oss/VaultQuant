import { Trades } from "@/types";
import { CloseEvent } from "@/types/dbSchema.types";
import { SanitizedTransaction } from "./sanitizer";

interface InternalCampaign {
    id: string;
    symbolName: string;
    positionType: "buy" | "sell";
    openDate: string;
    openTime: string;
    isActiveTrade: boolean;
    initialQty: number;
    initialEntryPrice: number;
    totalScaledInQty: number;
    currentQty: number;
    vwapPrice: number;
    totalFees: number;
    closeEvents: CloseEvent[];
    notes: string[];
    strategyId?: string;
}

/**
 * Campaign Clustering Engine
 * Processes sanitized order stream and groups transactions into continuous trade campaigns.
 * Calculates dynamic VWAP for scale-ins and aggregates scale-outs into closeEvents.
 */
export function clusterTransactionsIntoCampaigns(
    transactions: SanitizedTransaction[]
): Trades[] {
    const symbolGroups = new Map<string, SanitizedTransaction[]>();

    // Group transactions by symbol
    for (const tx of transactions) {
        const symbol = tx.symbol.toUpperCase();
        if (!symbolGroups.has(symbol)) {
            symbolGroups.set(symbol, []);
        }
        symbolGroups.get(symbol)!.push(tx);
    }

    const compiledTrades: Trades[] = [];

    // Process each symbol's transactions sequentially
    for (const [symbol, txList] of symbolGroups.entries()) {
        let activeCampaign: InternalCampaign | null = null;

        for (const tx of txList) {
            let remainingTxQty = tx.quantity;

            while (remainingTxQty > 0) {
                if (!activeCampaign) {
                    // Generate deterministic campaign ID based on symbol, type, openDate, openTime
                    const cleanTime = (tx.time || "093000").replace(/[^0-9]/g, "");
                    const deterministicId = `cmp-${symbol.toLowerCase()}-${tx.positionType}-${tx.date}-${cleanTime}`;

                    // Start a new Campaign (0 -> >0)
                    activeCampaign = {
                        id: deterministicId,
                        symbolName: symbol,
                        positionType: tx.positionType,
                        openDate: tx.date,
                        openTime: tx.time,
                        isActiveTrade: true,
                        initialQty: remainingTxQty,
                        initialEntryPrice: tx.price,
                        totalScaledInQty: remainingTxQty,
                        currentQty: remainingTxQty,
                        vwapPrice: tx.price,
                        totalFees: tx.fee || 0,
                        closeEvents: [],
                        notes: tx.notes ? [tx.notes] : [],
                        strategyId: tx.strategyId,
                    };
                    remainingTxQty = 0;
                } else if (activeCampaign.positionType === tx.positionType) {
                    // Scale-in: Same direction as active campaign -> Recalculate VWAP with full precision
                    const newTotalQty = activeCampaign.currentQty + remainingTxQty;
                    const newVwap =
                        (activeCampaign.vwapPrice * activeCampaign.currentQty +
                            tx.price * remainingTxQty) /
                        newTotalQty;

                    activeCampaign.currentQty = newTotalQty;
                    activeCampaign.totalScaledInQty += remainingTxQty;
                    activeCampaign.vwapPrice = newVwap;
                    activeCampaign.totalFees += tx.fee || 0;

                    if (tx.notes) {
                        activeCampaign.notes.push(tx.notes);
                    }
                    remainingTxQty = 0;
                } else {
                    // Scale-out / Close: Opposite direction
                    const closedQty = Math.min(activeCampaign.currentQty, remainingTxQty);

                    // Compute PnL for this scale-out
                    let pnl = 0;
                    if (activeCampaign.positionType === "buy") {
                        pnl = (tx.price - activeCampaign.vwapPrice) * closedQty;
                    } else {
                        pnl = (activeCampaign.vwapPrice - tx.price) * closedQty;
                    }

                    const cleanCloseTime = (tx.time || "160000").replace(/[^0-9]/g, "");
                    const eventId = `evt-${symbol.toLowerCase()}-${tx.date}-${cleanCloseTime}-${closedQty}`;

                    const closeEvent: CloseEvent = {
                        id: eventId,
                        date: tx.date,
                        time: tx.time,
                        quantitySold: closedQty,
                        sellPrice: tx.price,
                        result: Number(pnl.toFixed(2)),
                        quantityChange: -closedQty,
                        price: tx.price,
                    };

                    activeCampaign.closeEvents.push(closeEvent);
                    activeCampaign.currentQty -= closedQty;
                    activeCampaign.totalFees += tx.fee || 0;
                    remainingTxQty -= closedQty;

                    if (tx.notes) {
                        activeCampaign.notes.push(tx.notes);
                    }

                    // Check if campaign is now fully closed
                    if (activeCampaign.currentQty <= 0) {
                        const totalResult = activeCampaign.closeEvents.reduce(
                            (sum, e) => sum + (e.result || 0),
                            0
                        );

                        const totalCost = activeCampaign.totalScaledInQty * activeCampaign.vwapPrice;

                        const tradeRecord: Trades = {
                            id: activeCampaign.id,
                            symbolName: activeCampaign.symbolName,
                            instrumentName: activeCampaign.symbolName,
                            positionType: activeCampaign.positionType,
                            openDate: activeCampaign.openDate,
                            openTime: activeCampaign.openTime,
                            closeDate: tx.date,
                            closeTime: tx.time,
                            isActiveTrade: false,
                            entryPrice: activeCampaign.vwapPrice.toFixed(4),
                            quantity: activeCampaign.totalScaledInQty.toString(),
                            deposit: totalCost.toFixed(2),
                            totalCost: totalCost.toFixed(2),
                            sellPrice: tx.price.toString(),
                            quantitySold: activeCampaign.totalScaledInQty.toString(),
                            result: Number(totalResult.toFixed(2)).toString(),
                            rating: 0,
                            strategyId: activeCampaign.strategyId || null,
                            closeEvents: activeCampaign.closeEvents,
                            notes: activeCampaign.notes.length > 0 ? activeCampaign.notes.join("\n") : undefined,
                            openOtherDetails: {
                                initialQty: activeCampaign.initialQty.toString(),
                                initialEntryPrice: activeCampaign.initialEntryPrice.toString(),
                            },
                        };

                        compiledTrades.push(tradeRecord);
                        activeCampaign = null; // Position is back to 0
                    }
                }
            }
        }

        // If an active campaign remains open at the end of the transaction stream
        if (activeCampaign && activeCampaign.currentQty > 0) {
            const totalCost = activeCampaign.totalScaledInQty * activeCampaign.vwapPrice;

            const openTradeRecord: Trades = {
                id: activeCampaign.id,
                symbolName: activeCampaign.symbolName,
                instrumentName: activeCampaign.symbolName,
                positionType: activeCampaign.positionType,
                openDate: activeCampaign.openDate,
                openTime: activeCampaign.openTime,
                isActiveTrade: true,
                entryPrice: activeCampaign.vwapPrice.toFixed(4),
                quantity: activeCampaign.currentQty.toString(),
                deposit: totalCost.toFixed(2),
                totalCost: totalCost.toFixed(2),
                rating: 0,
                strategyId: activeCampaign.strategyId || null,
                notes: activeCampaign.notes.length > 0 ? activeCampaign.notes.join("\n") : undefined,
                openOtherDetails: {
                    initialQty: activeCampaign.initialQty.toString(),
                    initialEntryPrice: activeCampaign.initialEntryPrice.toString(),
                },
            };

            compiledTrades.push(openTradeRecord);
        }
    }

    return compiledTrades;
}
