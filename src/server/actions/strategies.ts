"use server";

import { db } from "@/drizzle/db";
import { StrategyTable, UserTable } from "@/drizzle/schema";
import { Rule } from "@/types/dbSchema.types";
import {
    DeleteStrategyFromDBResult,
    GetStrategiesResult,
} from "@/types/strategies.types";
import { desc, eq } from "drizzle-orm";
import { ensureLocalUser } from "./user";

export async function saveStrategy({
    openPositionRules,
    closePositionRules,
    id,
    strategyName,
    description,
}: {
    openPositionRules: Rule[];
    closePositionRules: Rule[];
    userId?: string;
    id: string;
    strategyName: string;
    description?: string;
}) {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        // Check if user exists in UserTable
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (!user) {
            return {
                success: false,
                error: "Please complete your profile first.",
            };
        }

        await db.insert(StrategyTable).values({
            userId,
            id,
            openPositionRules,
            closePositionRules,
            strategyName,
            description,
        });

        return {
            success: true,
            message: "Strategy saved successfully.",
        };
    } catch (error) {
        console.error("Failed to save strategy:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        } else {
            return { success: false, error: "Unknown error occurred!" };
        }
    }
}

export async function getAllStrategies(): Promise<GetStrategiesResult | null> {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        // Check if user exists in UserTable
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (!user) {
            return {
                success: false,
                error: "Please complete your profile first.",
            };
        }

        const strategies = await db
            .select({
                id: StrategyTable.id,
                strategyName: StrategyTable.strategyName,
                description: StrategyTable.description,
                openPositionRules: StrategyTable.openPositionRules,
                closePositionRules: StrategyTable.closePositionRules,
            })
            .from(StrategyTable)
            .where(eq(StrategyTable.userId, userId))
            .orderBy(desc(StrategyTable.createdAt));

        const mappedStrategies = strategies.map((s) => ({
            id: s.id,
            strategyName: s.strategyName,
            description: s.description,
            openPositionRules: s.openPositionRules ?? [],
            closePositionRules: s.closePositionRules ?? [],
        }));

        return {
            success: true,
            strategies: mappedStrategies,
        };
    } catch (error) {
        console.error("Failed to fetch strategies:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Unknown error occurred!" };
    }
}

export async function deleteStrategyFromDB(
    strategyId: string | undefined
): Promise<DeleteStrategyFromDBResult | null> {
    if (!strategyId) return null;

    try {
        await db.delete(StrategyTable).where(eq(StrategyTable.id, strategyId));

        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to delete strategy:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Unknown error occurred!" };
    }
}

export async function editStrategy({
    openPositionRules,
    closePositionRules,
    id,
    strategyName,
    description,
}: {
    openPositionRules: Rule[];
    closePositionRules: Rule[];
    userId?: string;
    id: string;
    strategyName: string;
    description?: string;
}) {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (!user) {
            return {
                success: false,
                error: "Please complete your profile first.",
            };
        }

        await db.update(StrategyTable).set({
            openPositionRules,
            closePositionRules,
            strategyName,
            description,
        }).where(eq(StrategyTable.id, id));

        return {
            success: true,
            message: "Strategy edited successfully.",
        };
    } catch (error) {
        console.error("Failed to edit strategy:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Unknown error occurred!" };
    }
}