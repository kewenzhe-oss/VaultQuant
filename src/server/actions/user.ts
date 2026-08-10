"use server";

import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function ensureLocalUser() {
    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, "local-user"),
        });

        if (user == null) {
            await db.insert(UserTable).values({
                id: "local-user",
                name: "Local User",
                email: "local@example.com",
                capital: "10000",
                tokens: 5,
                onboardingCompleted: false,
            });
        }
    } catch (err) {
        console.error("Error ensuring local user exists:", err);
    }
}

export async function addCapitalOrUpdate(
    capital: string
): Promise<{ error: boolean } | undefined> {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (user == null) {
            await db
                .insert(UserTable)
                .values({ capital, id: userId, tokens: 5 });
        } else {
            await db
                .update(UserTable)
                .set({ capital })
                .where(eq(UserTable.id, userId));
        }
    } catch (err) {
        console.error(err);
        return { error: true };
    }
}

export async function getCapital(): Promise<
    string | undefined | { error: boolean }
> {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        const data = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        return data?.capital ?? undefined;
    } catch (err) {
        console.error(err);
        return { error: true };
    }
}

export async function checkIfUserHasTokens(): Promise<
    | { success: true; tokens: number | null }
    | { success: false; message: string }
> {
    // Single user local version has unlimited tokens
    return { success: true, tokens: 9999 };
}

export async function updateCredits(): Promise<
    { success: true; message: string } | { success: false; message: string }
> {
    return { success: true, message: "Credits updated locally." };
}

export async function completeOnboarding() {
    const userId = "local-user";
    await ensureLocalUser();
    await db.update(UserTable).set({ onboardingCompleted: true }).where(eq(UserTable.id, userId));
}

// Custom Field Names Management
export async function getCustomFieldNames(): Promise<{
    openFields: string[];
    closeFields: string[];
} | { error: boolean }> {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        return {
            openFields: (user?.openCustomFieldNames as string[]) || [],
            closeFields: (user?.closeCustomFieldNames as string[]) || [],
        };
    } catch (err) {
        console.error("Error getting custom field names:", err);
        return { error: true };
    }
}

export async function addCustomFieldName(
    type: "open" | "close",
    fieldName: string
): Promise<{ success: boolean; error?: string }> {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const currentFields = type === "open"
            ? (user.openCustomFieldNames as string[]) || []
            : (user.closeCustomFieldNames as string[]) || [];

        // Check if field already exists
        if (currentFields.includes(fieldName)) {
            return { success: true }; // Already exists, no need to add
        }

        const updatedFields = [...currentFields, fieldName];

        if (type === "open") {
            await db.update(UserTable)
                .set({ openCustomFieldNames: updatedFields })
                .where(eq(UserTable.id, userId));
        } else {
            await db.update(UserTable)
                .set({ closeCustomFieldNames: updatedFields })
                .where(eq(UserTable.id, userId));
        }

        return { success: true };
    } catch (err) {
        console.error("Error adding custom field name:", err);
        return { success: false, error: "Failed to add field" };
    }
}

export async function removeCustomFieldName(
    type: "open" | "close",
    fieldName: string
): Promise<{ success: boolean; error?: string }> {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const currentFields = type === "open"
            ? (user.openCustomFieldNames as string[]) || []
            : (user.closeCustomFieldNames as string[]) || [];

        const updatedFields = currentFields.filter(f => f !== fieldName);

        if (type === "open") {
            await db.update(UserTable)
                .set({ openCustomFieldNames: updatedFields })
                .where(eq(UserTable.id, userId));
        } else {
            await db.update(UserTable)
                .set({ closeCustomFieldNames: updatedFields })
                .where(eq(UserTable.id, userId));
        }

        return { success: true };
    } catch (err) {
        console.error("Error removing custom field name:", err);
        return { success: false, error: "Failed to remove field" };
    }
}