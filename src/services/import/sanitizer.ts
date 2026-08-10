export interface RawTransaction {
    id?: string;
    symbol: string;
    type: "buy" | "sell" | "BUY" | "SELL" | "LONG" | "SHORT" | string;
    date: string; // YYYY-MM-DD or date-time string
    time?: string; // HH:mm:ss
    quantity: number | string;
    price: number | string;
    fee?: number | string;
    status?: string; // FILLED, CANCELLED, REJECTED, etc.
    actionType?: string; // TRADE, DIVIDEND, SPLIT, OPTION, etc.
    notes?: string;
    strategyId?: string;
}

export interface SanitizedTransaction {
    id: string;
    symbol: string;
    positionType: "buy" | "sell"; // normalized to lower case 'buy' or 'sell'
    date: string; // YYYY-MM-DD
    time: string; // HH:mm:ss
    quantity: number;
    price: number;
    fee: number;
    notes?: string;
    strategyId?: string;
}

/**
 * Robust helper to parse arbitrary broker date-time strings into { date: "YYYY-MM-DD", time: "HH:mm:ss" }
 */
export function parseDateAndTime(rawDateTimeStr: string, fallbackTime?: string): { date: string; time: string } {
    if (!rawDateTimeStr || !rawDateTimeStr.trim()) {
        const now = new Date();
        return {
            date: now.toISOString().split("T")[0],
            time: fallbackTime || "09:30:00",
        };
    }

    const str = rawDateTimeStr.trim();

    // Direct match for YYYY-MM-DD
    const isoDateMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (isoDateMatch) {
        const year = isoDateMatch[1];
        const month = isoDateMatch[2].padStart(2, "0");
        const day = isoDateMatch[3].padStart(2, "0");
        return {
            date: `${year}-${month}-${day}`,
            time: fallbackTime || "09:30:00",
        };
    }

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");

        return {
            date: `${year}-${month}-${day}`,
            time: fallbackTime && fallbackTime !== "09:30:00" ? fallbackTime : `${hours}:${minutes}:${seconds}`,
        };
    }

    return {
        date: new Date().toISOString().split("T")[0],
        time: fallbackTime || "09:30:00",
    };
}

/**
 * Clean up raw broker transaction records:
 * 1. Filter out invalid/cancelled/rejected orders.
 * 2. Filter out non-trading actions (dividends, splits, options exercises).
 * 3. Merge partial fills occurring within the exact same second for the same symbol & direction.
 * 4. Sort chronologically by date & time.
 */
export function sanitizeTransactions(rawRecords: RawTransaction[]): SanitizedTransaction[] {
    const validRecords: SanitizedTransaction[] = [];

    for (let i = 0; i < rawRecords.length; i++) {
        const raw = rawRecords[i];

        // 1. Check status
        if (raw.status) {
            const statusUpper = raw.status.trim().toUpperCase();
            if (
                statusUpper.includes("CANCEL") ||
                statusUpper.includes("REJECT") ||
                statusUpper.includes("FAIL") ||
                statusUpper.includes("EXPIRED")
            ) {
                continue;
            }
        }

        // 2. Check actionType
        if (raw.actionType) {
            const actionUpper = raw.actionType.trim().toUpperCase();
            if (
                actionUpper.includes("DIVIDEND") ||
                actionUpper.includes("SPLIT") ||
                actionUpper.includes("INTEREST") ||
                actionUpper.includes("FEE") ||
                actionUpper.includes("TRANSFER")
            ) {
                continue;
            }
        }

        // 3. Normalize Symbol
        const symbol = (raw.symbol || "").trim().toUpperCase();
        if (!symbol) continue;

        // 4. Normalize Position Type (buy vs sell)
        const rawType = (raw.type || "").trim().toLowerCase();
        let positionType: "buy" | "sell";
        if (rawType.includes("buy") || rawType.includes("long") || rawType.includes("cover")) {
            positionType = "buy";
        } else if (rawType.includes("sell") || rawType.includes("short")) {
            positionType = "sell";
        } else {
            continue;
        }

        // 5. Parse Quantity & Price (stripping commas)
        const cleanQtyStr = String(raw.quantity).replace(/,/g, "");
        const cleanPriceStr = String(raw.price).replace(/,/g, "");

        const quantity = Math.abs(parseFloat(cleanQtyStr));
        const price = parseFloat(cleanPriceStr);
        const fee = typeof raw.fee === "number" ? raw.fee : parseFloat(String(raw.fee || "0").replace(/,/g, "")) || 0;

        if (isNaN(quantity) || quantity <= 0 || isNaN(price) || price < 0) {
            continue;
        }

        // 6. Normalize Date & Time
        const { date, time } = parseDateAndTime(raw.date || "", raw.time);

        const id = raw.id || `raw-${i}-${Date.now()}`;

        validRecords.push({
            id,
            symbol,
            positionType,
            date,
            time,
            quantity,
            price,
            fee,
            notes: raw.notes,
            strategyId: raw.strategyId,
        });
    }

    // 7. Sort chronologically by date and time deterministically
    validRecords.sort((a, b) => {
        const timeA = `${a.date} ${a.time}`;
        const timeB = `${b.date} ${b.time}`;
        return timeA.localeCompare(timeB);
    });

    // 8. Merge partial fills in the exact same second (same symbol, same direction, same date & time)
    const mergedRecords: SanitizedTransaction[] = [];

    for (const record of validRecords) {
        if (mergedRecords.length === 0) {
            mergedRecords.push({ ...record });
            continue;
        }

        const last = mergedRecords[mergedRecords.length - 1];
        if (
            last.symbol === record.symbol &&
            last.positionType === record.positionType &&
            last.date === record.date &&
            last.time === record.time
        ) {
            // Same second split fill -> Combine quantity and compute weighted price
            const totalQty = last.quantity + record.quantity;
            const weightedPrice = (last.price * last.quantity + record.price * record.quantity) / totalQty;

            last.quantity = totalQty;
            last.price = Number(weightedPrice.toFixed(4));
            last.fee += record.fee;
            if (record.notes) {
                last.notes = last.notes ? `${last.notes}\n${record.notes}` : record.notes;
            }
        } else {
            mergedRecords.push({ ...record });
        }
    }

    return mergedRecords;
}
