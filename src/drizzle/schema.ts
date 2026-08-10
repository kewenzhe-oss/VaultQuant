import { Rule, CloseEvent } from "@/types/dbSchema.types";
import { relations } from "drizzle-orm";
import {
    integer,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";

export const UserTable = sqliteTable("user", {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull().default(""),
    email: text("email").notNull().default(""),
    capital: text("capital"),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    tokens: integer("tokens").default(5),
    onboardingCompleted: integer("onboarding_completed", { mode: "boolean" })
        .notNull()
        .default(false),
    openCustomFieldNames: text("open_custom_field_names", { mode: "json" }).$type<string[]>().$defaultFn(() => []),
    closeCustomFieldNames: text("close_custom_field_names", { mode: "json" }).$type<string[]>().$defaultFn(() => []),
});

export const TradeTable = sqliteTable(
    "trades",
    {
        id: text("id").primaryKey().notNull(),
        userId: text("userId").notNull().references(() => UserTable.id),
        positionType: text("positionType").notNull(),
        openDate: text("openDate").notNull(),
        openTime: text("openTime").notNull(),
        closeDate: text("closeDate"),
        closeTime: text("closeTime"),
        isActiveTrade: integer("isActiveTrade", { mode: "boolean" }).default(true).notNull(),
        instrumentName: text("instrumentName"),
        symbolName: text("symbolName").notNull(),
        entryPrice: text("entryPrice"),
        deposit: text("deposit"),
        result: text("result"),
        totalCost: text("totalCost"),
        quantity: text("quantity"),
        sellPrice: text("sellPrice"),
        quantitySold: text("quantitySold"),
        notes: text("notes"),
        rating: integer("rating").default(0),
        strategyId: text("strategy_id").references(() => StrategyTable.id, {
            onDelete: "set null",
            onUpdate: "cascade",
        }),
        appliedOpenRules: text("applied_open_rules", { mode: "json" }).$type<Rule[]>(),
        appliedCloseRules: text("applied_close_rules", { mode: "json" }).$type<Rule[]>(),
        closeEvents: text("close_events", { mode: "json" }).$type<CloseEvent[]>(),
        openOtherDetails: text("open_other_details", { mode: "json" }).$type<Record<string, string>>(),
        closeOtherDetails: text("close_other_details", { mode: "json" }).$type<Record<string, string>>(),
    }
);

export const StrategyTable = sqliteTable(
    "strategies",
    {
        id: text("id").primaryKey().notNull(),
        userId: text("userId")
            .notNull()
            .references(() => UserTable.id),
        strategyName: text("strategyName").notNull(),
        description: text("description"),
        openPositionRules: text("open_position_rules", { mode: "json" }).$type<Rule[]>().$defaultFn(() => []),
        closePositionRules: text("close_position_rules", { mode: "json" }).$type<Rule[]>().$defaultFn(() => []),
        createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
        updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
    }
);

export const StrategyRelations = relations(StrategyTable, ({ many }) => ({
    trades: many(TradeTable),
}));

export const TradeRelations = relations(TradeTable, ({ one }) => ({
    strategy: one(StrategyTable, {
        fields: [TradeTable.strategyId],
        references: [StrategyTable.id],
    }),
}));

import { ReportType } from "@/types/tradeAI.types";

export const ReportsTable = sqliteTable("reports", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id").notNull(),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    reportData: text("report_data", { mode: "json" }).$type<ReportType>().notNull(),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false).notNull(),
});

export const JournalTable = sqliteTable(
    "journal",
    {
        id: text("id").primaryKey().notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        date: text("date").notNull(), // Stored as YYYY-MM-DD
        content: text("content", { mode: "json" }),
        createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
        updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
    }
);
