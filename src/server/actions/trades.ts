"use server";

import { db } from "@/drizzle/db";
import { TradeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { newTradeFormSchema, adjustPositionSchema } from "@/zodSchema/schema";
import { z } from "zod";
import { Trades } from "@/types";
import { ensureLocalUser } from "./user";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

function processTradeRow(trade: typeof TradeTable.$inferSelect): Trades {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...rest } = trade;
    return {
        ...rest,
        notes: rest.notes ?? undefined,
        result: rest.result ?? undefined,
        closeDate: rest.closeDate ?? undefined,
        closeTime: rest.closeTime ?? undefined,
        entryPrice: rest.entryPrice ?? undefined,
        totalCost: rest.totalCost ?? undefined,
        quantity: rest.quantity ?? undefined,
        sellPrice: rest.sellPrice ?? undefined,
        quantitySold: rest.quantitySold ?? undefined,
        strategyId: rest.strategyId ?? undefined,
        appliedOpenRules: rest.appliedOpenRules ?? undefined,
        appliedCloseRules: rest.appliedCloseRules ?? undefined,
        deposit: rest.deposit ?? undefined,
        instrumentName: rest.instrumentName ?? undefined,
        closeEvents: rest.closeEvents ?? undefined,
        openOtherDetails: rest.openOtherDetails ?? undefined,
        closeOtherDetails: rest.closeOtherDetails ?? undefined,
    };
}

export async function createNewTradeRecord(
    unsafeData: z.infer<typeof newTradeFormSchema>,
    id: string
): Promise<{ error: boolean } | undefined> {
    const userId = "local-user";
    await ensureLocalUser();

    const { success, data } = newTradeFormSchema.safeParse(unsafeData);
    if (!success) {
        return { error: true };
    }

    let notes = data.notes;
    if (notes && notes.trim() !== "") {
        try {
            JSON.parse(notes);
        } catch {
            notes = JSON.stringify([{
                id: uuidv4(),
                createdAt: new Date().toISOString(),
                text: notes,
                category: "general"
            }]);
        }
    }

    try {
        await db.insert(TradeTable).values({ ...data, notes, userId, id });
        revalidatePath("/private/history");
    } catch (err) {
        console.error("Error creating trade:", err);
        return { error: true };
    }
}

export async function updateTradeNotes(
    tradeId: string,
    notesJson: string
): Promise<{ success: boolean; error?: string }> {
    await ensureLocalUser();
    try {
        await db
            .update(TradeTable)
            .set({ notes: notesJson })
            .where(eq(TradeTable.id, tradeId));
        
        revalidatePath("/private/history");
        return { success: true };
    } catch (err) {
        console.error("Error updating trade notes:", err);
        return { success: false, error: "Failed to update notes" };
    }
}

export async function getAllTradeRecords(): Promise<Trades[]> {
    const userId = "local-user";
    await ensureLocalUser();

    const data = await db.query.TradeTable.findMany({
        where: eq(TradeTable.userId, userId),
    });

    const processedData = data.map((trade) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, ...rest } = trade;
        return {
            ...rest,
            notes: rest.notes ?? undefined,
            result: rest.result ?? undefined,
            closeDate: rest.closeDate ?? undefined,
            closeTime: rest.closeTime ?? undefined,
            entryPrice: rest.entryPrice ?? undefined,
            totalCost: rest.totalCost ?? undefined,
            quantity: rest.quantity ?? undefined,
            sellPrice: rest.sellPrice ?? undefined,
            quantitySold: rest.quantitySold ?? undefined,
            strategyId: rest.strategyId ?? undefined,
            appliedOpenRules: rest.appliedOpenRules ?? undefined,
            appliedCloseRules: rest.appliedCloseRules ?? undefined,
            deposit: rest.deposit ?? undefined,
            instrumentName: rest.instrumentName ?? undefined,
            closeEvents: rest.closeEvents ?? undefined,
            openOtherDetails: rest.openOtherDetails ?? undefined,
            closeOtherDetails: rest.closeOtherDetails ?? undefined,
        };
    });

    return [...processedData].reverse();
}

export async function updateTradeRecord(
    unsafeData: z.infer<typeof newTradeFormSchema>,
    tradeId: string
): Promise<{ error: boolean } | undefined> {
    await ensureLocalUser();

    const { success, data } = newTradeFormSchema.safeParse(unsafeData);
    if (!success) {
        return { error: true };
    }

    try {
        // Destructure notes out — notes are managed exclusively by updateTradeNotes()
        // to prevent stale form values overwriting note edits made in the Notes tab.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { notes: _notes, ...tradeFields } = data;
        await db
            .update(TradeTable)
            .set({ ...tradeFields })
            .where(eq(TradeTable.id, tradeId));
    } catch (err) {
        console.error(err);
        return { error: true };
    }
    return;
}

export async function deleteTradeRecord(
    recordId: string
): Promise<{ error: boolean } | undefined> {
    try {
        await db.delete(TradeTable).where(eq(TradeTable.id, recordId));
    } catch (err) {
        console.error(err);
        return { error: true };
    }
    return;
}


export async function adjustTradePosition(
    tradeId: string,
    unsafeData: z.infer<typeof adjustPositionSchema>,
    extraFields?: Partial<Trades>
): Promise<{ error: boolean; updatedTrade?: Trades } | undefined> {
    await ensureLocalUser();

    const { success, data } = adjustPositionSchema.safeParse(unsafeData);
    if (!success) {
        return { error: true };
    }

    try {
        // 1. Retrieve the existing trade
        const [existingTrade] = await db
            .select()
            .from(TradeTable)
            .where(eq(TradeTable.id, tradeId));

        if (!existingTrade) {
            return { error: true };
        }

        // Merge extraFields (except closeEvents) into existingTrade to support updating other fields
        const mergedTrade = {
            ...existingTrade,
            ...extraFields,
        };

        // 2. Read or initialize initialQty and initialEntryPrice in openOtherDetails
        let openOtherDetails = mergedTrade.openOtherDetails || {};
        let initialQtyStr = openOtherDetails.initialQty;
        let initialEntryPriceStr = openOtherDetails.initialEntryPrice;

        if (initialQtyStr === undefined || initialEntryPriceStr === undefined) {
            initialQtyStr = mergedTrade.quantity || "0";
            initialEntryPriceStr = mergedTrade.entryPrice || "0";
            openOtherDetails = {
                ...openOtherDetails,
                initialQty: initialQtyStr,
                initialEntryPrice: initialEntryPriceStr,
            };
        }

        const initialQty = Number(initialQtyStr);
        const initialEntryPrice = Number(initialEntryPriceStr);

        // 3. Construct the new adjustment event
        const adjustQty = Number(data.adjustQty);
        const adjustPrice = Number(data.adjustPrice);
        const adjustDate = data.adjustDate;
        const adjustTime = data.adjustTime;

        // Calculate realized P/L (only for scale-out: adjustQty < 0)
        let realizedPnL = 0;
        if (adjustQty < 0) {
            const currentAvgEntry = Number(mergedTrade.entryPrice || 0);
            realizedPnL = (adjustPrice - currentAvgEntry) * Math.abs(adjustQty) * (mergedTrade.positionType === "buy" ? 1 : -1);
        }

        const newEvent = {
            id: uuidv4(),
            date: adjustDate,
            time: adjustTime,
            quantityChange: adjustQty,
            price: adjustPrice,
            result: adjustQty < 0 ? realizedPnL : 0, // Store 0 instead of undefined so it is parsed as number
            // compatibility fields:
            quantitySold: adjustQty < 0 ? Math.abs(adjustQty) : 0,
            sellPrice: adjustQty < 0 ? adjustPrice : 0,
        };

        const existingEvents = mergedTrade.closeEvents || [];
        const updatedEvents = [...existingEvents, newEvent];

        // 4. Sequentially recalculate the parent trade's live quantity and entry price
        let qty = initialQty;
        let price = initialEntryPrice;

        for (const event of updatedEvents) {
            const qChange = event.quantityChange !== undefined ? event.quantityChange : (event.quantitySold !== undefined ? -event.quantitySold : 0);
            const eventPrice = event.price !== undefined ? event.price : (event.sellPrice !== undefined ? event.sellPrice : 0);

            if (qChange > 0) {
                // scale-in: recalculate VWAP average entry price
                const newQty = qty + qChange;
                price = newQty > 0 ? (price * qty + eventPrice * qChange) / newQty : price;
                qty = newQty;
            } else if (qChange < 0) {
                // scale-out: reduces remaining qty, average entry price is unchanged
                qty = qty + qChange;
            }
        }

        const updatedDeposit = qty * price;
        const isClosed = qty <= 0;

        const updatedFields = {
            ...extraFields,
            quantity: qty.toString(),
            entryPrice: price.toString(),
            closeEvents: updatedEvents,
            isActiveTrade: !isClosed,
            openOtherDetails,
            deposit: updatedDeposit > 0 ? updatedDeposit.toString() : null,
            // If fully closed:
            closeDate: isClosed ? adjustDate : null,
            closeTime: isClosed ? adjustTime : null,
            sellPrice: isClosed ? adjustPrice.toString() : null,
            quantitySold: isClosed ? initialQty.toString() : null,
            result: isClosed ? updatedEvents.reduce((sum, e) => sum + (e.result || 0), 0).toString() : null,
        };

        await db
            .update(TradeTable)
            .set(updatedFields)
            .where(eq(TradeTable.id, tradeId));

        revalidatePath("/private/history");

        const [updatedRawTrade] = await db
            .select()
            .from(TradeTable)
            .where(eq(TradeTable.id, tradeId));

        const updatedTrade = processTradeRow(updatedRawTrade);
        return { error: false, updatedTrade };
    } catch (err) {
        console.error("Error adjusting position:", err);
        return { error: true };
    }
}

