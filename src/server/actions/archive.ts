"use server";
import { db } from "@/drizzle/db";
import { ReportsTable } from "@/drizzle/schema";
import { ReportsEntry, ReportType } from "@/types/tradeAI.types";
import { desc, eq } from "drizzle-orm";
import { ensureLocalUser } from "./user";
import { v4 as uuidv4 } from "uuid";

type ReportsSuccess = {
    success: true;
    reports: ReportsEntry[];
    reportId?: string;
};

type GetReportByIdSuccess = {
    success: true;
    report: ReportType;
};

type ReportError = {
    success: false;
    error: string;
};

type DeleteAddFavoriteReportSuccess = {
    success: true;
};

type ReportsResult = ReportsSuccess | ReportError;
type GetReportByIdResult = GetReportByIdSuccess | ReportError;
type DeleteAddFAvoriteReportResult =
    | DeleteAddFavoriteReportSuccess
    | ReportError;

export async function saveReport(report: ReportType) {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        const id = uuidv4();
        await db
            .insert(ReportsTable)
            .values({
                id,
                userId,
                reportData: report, // Store the complete report structure as JSON
            });

        return {
            success: true,
            reportId: id,
        };
    } catch (error) {
        console.error("Failed to save report:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        } else {
            return { success: false, error: "Unknown error occurred!" };
        }
    }
}

export async function getReports(): Promise<ReportsResult | null> {
    const userId = "local-user";
    await ensureLocalUser();

    try {
        const reports = await db
            .select()
            .from(ReportsTable)
            .where(eq(ReportsTable.userId, userId))
            .orderBy(desc(ReportsTable.createdAt));

        if (!reports.length) return null;

        const reportEntries: ReportsEntry[] = reports.map(
            (report) => ({
                reportId: report.id,
                createdAt: new Date(report.createdAt).toLocaleDateString(),
                isFavorite: report.isFavorite,
                numberOfMessages:
                    report.reportData.instruments.length +
                    report.reportData.moneyManagement.length +
                    (report.reportData.timeManagement?.length ?? 0),
            })
        );

        return {
            success: true,
            reports: reportEntries,
        };
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Unknown error occurred!" };
    }
}

export async function getReportById(
    reportId: string | undefined
): Promise<GetReportByIdResult | null> {
    if (!reportId) return null;

    try {
        const report = await db.query.ReportsTable.findFirst({
            where: eq(ReportsTable.id, reportId),
        });

        return {
            success: true,
            report: report?.reportData as ReportType,
        };
    } catch (error) {
        console.error("Failed to fetch report by id:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Unknown error occurred!" };
    }
}

export async function addRemoveFavorite(
    reportId: string | undefined
): Promise<DeleteAddFAvoriteReportResult | null> {
    if (!reportId) return null;

    try {
        const report = await db.query.ReportsTable.findFirst({
            where: eq(ReportsTable.id, reportId),
        });

        if (!report) return null;

        await db
            .update(ReportsTable)
            .set({
                isFavorite: !report.isFavorite,
            })
            .where(eq(ReportsTable.id, reportId));

        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to toggle favorite status:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Unknown error occurred!" };
    }
}

export async function deleteReportFromDB(
    reportId: string | undefined
): Promise<DeleteAddFAvoriteReportResult | null> {
    if (!reportId) return null;

    try {
        await db.delete(ReportsTable).where(eq(ReportsTable.id, reportId));

        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to delete report:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Unknown error occurred!" };
    }
}
