import { createClient } from "@libsql/client";
import * as crypto from "crypto";

const CORE_DATA_OFFSET = 978307200; // Jan 1, 2001 Unix Epoch offset

const SOURCE_DB_PATH = "/Users/jameswei/Library/Application Support/TradeMind/TradeMind.store";
const DEST_DB_PATH = "local.db";

function parseCoreDataTime(cdTime: number | null | undefined): Date | null {
    if (cdTime == null || cdTime === 0) return null;
    return new Date((cdTime + CORE_DATA_OFFSET) * 1000);
}

function toISOOffsetMidnight(date: Date | null): string {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T04:00:00.000Z`;
}

function toHHMM(date: Date | null): string {
    if (!date) return "";
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function compileNotes(
    tradeNotes: string | null,
    planSummary: string | null,
    psychNote: any | null,
    journalEntries: any[],
    averageEntryPrice: number,
    averageExitPrice: number,
    fees: number,
    status: string,
    tradePk: number
): string {
    const sections: string[] = [];

    if (tradeNotes && tradeNotes.trim()) {
        sections.push(tradeNotes.trim());
    }

    if (planSummary && planSummary.trim()) {
        sections.push(`### Plan Summary\n${planSummary.trim()}`);
    }

    if (psychNote) {
        const text = psychNote.ZREFLECTIONTEXT?.trim() || "";
        const mood = psychNote.ZMOODINTENSITY != null ? `Mood Intensity: ${psychNote.ZMOODINTENSITY}` : "";
        const bias = psychNote.ZBIASTAGRAW && psychNote.ZBIASTAGRAW !== "None" ? `Bias: ${psychNote.ZBIASTAGRAW}` : "";
        const meta = [mood, bias].filter(Boolean).join(", ");
        
        if (text || meta) {
            sections.push(`### Psychology Note${meta ? ` (${meta})` : ""}\n${text || "*No text reflection*"}`);
        }
    }

    if (journalEntries && journalEntries.length > 0) {
        sections.push(`### Journal Entries / Reviews`);
        const sortedEntries = [...journalEntries].sort((a, b) => (a.Z_PK || 0) - (b.Z_PK || 0));
        for (const entry of sortedEntries) {
            const type = entry.ZENTRYTYPERAW || "Note";
            const text = entry.ZREFLECTIONTEXT?.trim() || "";
            const bias = entry.ZBIASTAGRAW && entry.ZBIASTAGRAW !== "None" ? `Bias: ${entry.ZBIASTAGRAW}` : "";
            const confidence = entry.ZCONFIDENCE != null ? `Confidence: ${entry.ZCONFIDENCE}` : "";
            const reason = entry.ZREASONTAGRAW && entry.ZREASONTAGRAW !== "None" ? `Reason: ${entry.ZREASONTAGRAW}` : "";
            const date = parseCoreDataTime(entry.ZCREATEDAT);
            const dateStr = date ? date.toLocaleDateString() : "";
            const meta = [bias, confidence, reason, dateStr].filter(Boolean).join(", ");

            sections.push(`#### ${type}${meta ? ` (${meta})` : ""}\n${text || "*No text reflection*"}`);
        }
    }

    sections.push(
        `---\n` +
        `**Legacy Import Metadata (Trade ID: ${tradePk}):**\n` +
        `- Status: ${status}\n` +
        `- Original Fees: $${fees.toFixed(2)}\n` +
        `- Avg Entry Price: $${averageEntryPrice.toFixed(4)}\n` +
        `- Avg Exit Price: $${averageExitPrice > 0 ? averageExitPrice.toFixed(4) : "N/A"}`
    );

    return sections.join("\n\n");
}

async function main() {
    console.log("Starting TradeMind data import...");
    console.log(`Source DB: ${SOURCE_DB_PATH}`);
    console.log(`Dest DB: ${DEST_DB_PATH}`);

    const sourceClient = createClient({ url: `file:${SOURCE_DB_PATH}` });
    const destClient = createClient({ url: `file:${DEST_DB_PATH}` });

    try {
        // 1. Ensure local-user exists in dest
        const userCheck = await destClient.execute({
            sql: "SELECT id FROM user WHERE id = ?",
            args: ["local-user"]
        });
        if (userCheck.rows.length === 0) {
            console.log("Creating default local-user in user table...");
            await destClient.execute({
                sql: `INSERT INTO user (id, name, email, capital, created_at, tokens, onboarding_completed, open_custom_field_names, close_custom_field_names)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: ["local-user", "Local User", "local@example.com", "10000", new Date().toISOString(), 5, 1, "[]", "[]"]
            });
        }

        // 2. Fetch existing strategies in dest to avoid duplicates
        const strategiesCheck = await destClient.execute("SELECT id, strategyName FROM strategies WHERE userId = 'local-user'");
        const destStrategies = new Map<string, string>(); // name -> id
        for (const row of strategiesCheck.rows) {
            destStrategies.set(String(row.strategyName), String(row.id));
        }

        // 3. Fetch existing trades in dest to avoid duplicates
        const tradesCheck = await destClient.execute("SELECT symbolName, openDate FROM trades WHERE userId = 'local-user'");
        const destTradesSet = new Set<string>(); // "symbolName_openDate"
        for (const row of tradesCheck.rows) {
            const key = `${String(row.symbolName).toLowerCase()}_${String(row.openDate)}`;
            destTradesSet.add(key);
        }
        console.log(`Found ${destTradesSet.size} existing trades in destination database.`);

        // 4. Fetch all raw data from TradeMind source DB
        const rawTrades = await sourceClient.execute("SELECT * FROM ZTRADE");
        const rawExecutions = await sourceClient.execute("SELECT * FROM ZEXECUTION");
        const rawPsychNotes = await sourceClient.execute("SELECT * FROM ZPSYCHOLOGYNOTE");
        const rawJournalEntries = await sourceClient.execute("SELECT * FROM ZJOURNALENTRY");

        console.log(`Fetched from source:`);
        console.log(`  - Trades: ${rawTrades.rows.length}`);
        console.log(`  - Executions: ${rawExecutions.rows.length}`);
        console.log(`  - Psychology Notes: ${rawPsychNotes.rows.length}`);
        console.log(`  - Journal Entries: ${rawJournalEntries.rows.length}`);

        // Group related data by Trade ID (ZTRADE)
        const executionsByTrade = new Map<number, any[]>();
        for (const exec of rawExecutions.rows) {
            const tradeId = Number(exec.ZTRADE);
            if (!executionsByTrade.has(tradeId)) {
                executionsByTrade.set(tradeId, []);
            }
            executionsByTrade.get(tradeId)!.push(exec);
        }

        const psychNotesByTrade = new Map<number, any>();
        for (const note of rawPsychNotes.rows) {
            const tradeId = Number(note.ZTRADE);
            psychNotesByTrade.set(tradeId, note);
        }

        const journalEntriesByTrade = new Map<number, any[]>();
        for (const entry of rawJournalEntries.rows) {
            const tradeId = Number(entry.ZTRADE);
            if (!journalEntriesByTrade.has(tradeId)) {
                journalEntriesByTrade.set(tradeId, []);
            }
            journalEntriesByTrade.get(tradeId)!.push(entry);
        }

        let importCount = 0;
        let skipCount = 0;

        for (const trade of rawTrades.rows) {
            const pk = Number(trade.Z_PK);
            const symbol = String(trade.ZSYMBOL || "").trim();
            const directionRaw = String(trade.ZDIRECTIONRAW || "").toLowerCase();
            const statusRaw = String(trade.ZSTATUSRAW || "").toLowerCase();
            const originalNotes = trade.ZNOTES ? String(trade.ZNOTES) : null;
            const planSummary = trade.ZPLANSUMMARY ? String(trade.ZPLANSUMMARY) : null;
            const strategyName = trade.ZSTRATEGY ? String(trade.ZSTRATEGY).trim() : null;

            if (!symbol) {
                console.log(`Skipping trade (PK ${pk}) due to empty symbol.`);
                continue;
            }

            // Convert timestamps
            const openDateObj = parseCoreDataTime(Number(trade.ZCREATEDAT));
            const closeDateObj = parseCoreDataTime(Number(trade.ZCLOSEDAT));

            const openDate = toISOOffsetMidnight(openDateObj);
            const openTime = toHHMM(openDateObj);
            const closeDate = toISOOffsetMidnight(closeDateObj);
            const closeTime = toHHMM(closeDateObj);

            // Check if already imported
            const duplicateKey = `${symbol.toLowerCase()}_${openDate}`;
            if (destTradesSet.has(duplicateKey)) {
                console.log(`Skipping duplicate trade: ${symbol} opened on ${openDate}`);
                skipCount++;
                continue;
            }

            // Process executions
            const tradeExecs = executionsByTrade.get(pk) || [];
            const entries = tradeExecs.filter(e => String(e.ZKINDRAW).toLowerCase() === 'entry');
            const exits = tradeExecs.filter(e => String(e.ZKINDRAW).toLowerCase() === 'exit');

            let totalEntryQty = 0;
            let totalEntryCost = 0;
            let totalExitQty = 0;
            let totalExitProceeds = 0;
            let totalFees = 0;

            for (const exec of tradeExecs) {
                totalFees += Number(exec.ZFEES || 0);
            }

            for (const ent of entries) {
                const qty = Number(ent.ZQTY || 0);
                const price = Number(ent.ZPRICE || 0);
                totalEntryQty += qty;
                totalEntryCost += qty * price;
            }

            for (const ex of exits) {
                const qty = Number(ex.ZQTY || 0);
                const price = Number(ex.ZPRICE || 0);
                totalExitQty += qty;
                totalExitProceeds += qty * price;
            }

            const averageEntryPrice = totalEntryQty > 0 ? (totalEntryCost / totalEntryQty) : 0;
            const averageExitPrice = totalExitQty > 0 ? (totalExitProceeds / totalExitQty) : 0;

            // Strategy resolution
            let strategyId: string | null = null;
            if (strategyName) {
                if (destStrategies.has(strategyName)) {
                    strategyId = destStrategies.get(strategyName)!;
                } else {
                    const newStrategyId = crypto.randomUUID();
                    console.log(`Creating new strategy: "${strategyName}"`);
                    await destClient.execute({
                        sql: `INSERT INTO strategies (id, userId, strategyName, description, open_position_rules, close_position_rules, created_at, updated_at)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        args: [newStrategyId, "local-user", strategyName, "", "[]", "[]", new Date().toISOString(), new Date().toISOString()]
                    });
                    destStrategies.set(strategyName, newStrategyId);
                    strategyId = newStrategyId;
                }
            }

            // Map positionType
            const positionType = directionRaw === "short" ? "sell" : "buy";

            // Map isActiveTrade
            const isActiveTrade = statusRaw === "open" ? 1 : 0;

            // Map CloseEvents
            const closeEvents: any[] = [];
            if (totalExitQty > 0) {
                const multiplier = positionType === "buy" ? 1 : -1;
                for (const ex of exits) {
                    const execTimeObj = parseCoreDataTime(Number(ex.ZTIMESTAMP));
                    const qty = Number(ex.ZQTY || 0);
                    const price = Number(ex.ZPRICE || 0);
                    const res = (price - averageEntryPrice) * qty * multiplier - Number(ex.ZFEES || 0);
                    
                    closeEvents.push({
                        id: crypto.randomUUID(),
                        date: toISOOffsetMidnight(execTimeObj),
                        time: toHHMM(execTimeObj),
                        quantitySold: qty,
                        sellPrice: price,
                        result: Number(res.toFixed(2))
                    });
                }
            }

            // Map overall Trade Result
            let result = "";
            if (totalExitQty > 0) {
                const multiplier = positionType === "buy" ? 1 : -1;
                const netResult = (averageExitPrice - averageEntryPrice) * totalExitQty * multiplier - totalFees;
                result = netResult.toFixed(2);
            }

            // Compile Notes
            const psychNote = psychNotesByTrade.get(pk) || null;
            const journalEntries = journalEntriesByTrade.get(pk) || [];
            const compiledNotesStr = compileNotes(
                originalNotes,
                planSummary,
                psychNote,
                journalEntries,
                averageEntryPrice,
                averageExitPrice,
                totalFees,
                statusRaw,
                pk
            );

            // Insert Trade
            const tradeId = crypto.randomUUID();
            await destClient.execute({
                sql: `INSERT INTO trades (
                        id, userId, positionType, openDate, openTime, closeDate, closeTime,
                        isActiveTrade, instrumentName, symbolName, entryPrice, deposit, result,
                        totalCost, quantity, sellPrice, quantitySold, notes, rating, strategy_id,
                        applied_open_rules, applied_close_rules, close_events, open_other_details, close_other_details
                      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    tradeId,
                    "local-user",
                    positionType,
                    openDate,
                    openTime,
                    isActiveTrade === 0 && closeDate ? closeDate : null,
                    isActiveTrade === 0 && closeTime ? closeTime : null,
                    isActiveTrade,
                    "",
                    symbol,
                    totalEntryQty > 0 ? averageEntryPrice.toFixed(4) : null,
                    null,
                    result || null,
                    totalEntryQty > 0 ? totalEntryCost.toFixed(4) : null,
                    totalEntryQty > 0 ? totalEntryQty.toString() : null,
                    totalExitQty > 0 ? averageExitPrice.toFixed(4) : null,
                    totalExitQty > 0 ? totalExitQty.toString() : null,
                    compiledNotesStr,
                    0, // Default rating
                    strategyId,
                    "[]",
                    "[]",
                    JSON.stringify(closeEvents),
                    "{}",
                    "{}"
                ]
            });

            importCount++;
            console.log(`Imported trade: ${symbol} (${positionType}) - Entries: ${entries.length}, Exits: ${exits.length}, Status: ${statusRaw}`);
        }

        console.log(`Import completed successfully!`);
        console.log(`  - Imported: ${importCount}`);
        console.log(`  - Skipped: ${skipCount}`);

    } catch (error) {
        console.error("Migration failed with error:", error);
    } finally {
        sourceClient.close();
        destClient.close();
    }
}

main();
