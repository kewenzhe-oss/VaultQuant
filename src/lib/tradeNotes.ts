import { v4 as uuidv4 } from "uuid";

export interface TradeNote {
    id: string;
    createdAt: string;
    updatedAt?: string;
    text: string;
    category: "thesis" | "management" | "execution" | "review" | "general";
}

export function parseTradeNotes(
    notes: string | undefined | null,
    fallbackDate?: string,
    tradeId?: string
): TradeNote[] {
    if (!notes || notes.trim() === "") {
        return [];
    }
    const legacyId = tradeId ? `legacy-${tradeId}` : "legacy";
    const legacyDate = fallbackDate || new Date().toISOString();
    try {
        const parsed = JSON.parse(notes);
        if (Array.isArray(parsed)) {
            return (parsed as (Partial<TradeNote> & { updatedAt?: string })[]).map((item, index) => ({
                id: item.id || (tradeId ? `note-${tradeId}-${index}` : uuidv4()),
                createdAt: item.createdAt || fallbackDate || new Date().toISOString(),
                updatedAt: item.updatedAt,
                text: item.text || "",
                category: item.category || "general",
            }));
        }
        return [
            {
                id: legacyId,
                createdAt: legacyDate,
                text: typeof parsed === "object" ? JSON.stringify(parsed) : String(parsed),
                category: "general",
            },
        ];
    } catch {
        return [
            {
                id: legacyId,
                createdAt: legacyDate,
                text: notes,
                category: "general",
            },
        ];
    }
}

export function serializeTradeNotes(notes: TradeNote[]): string {
    return JSON.stringify(notes);
}
