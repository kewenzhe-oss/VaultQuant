"use client";

import * as React from "react";
import { CalendarIcon, ChevronDown, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { months } from "@/data/data";
import { newTradeFormSchema } from "@/zodSchema/schema";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useAppSelector } from "@/redux/store";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { CustomFieldsSection } from "./CustomFieldsSection";

interface OpenDetailsTabProps {
    form: UseFormReturn<z.infer<typeof newTradeFormSchema>>;
    openDate: Date | undefined;
    setOpenDate: (date: Date | undefined) => void;
    symbolLabels: string[];
    day?: dayjs.Dayjs | undefined;
    userFieldNames: string[];
    onFieldNamesChange?: () => void;
    editMode?: boolean;

    validationState: "idle" | "validating" | "valid" | "invalid";
    validationPrice?: number;
    setValidationState: React.Dispatch<React.SetStateAction<"idle" | "validating" | "valid" | "invalid">>;
    setValidationPrice: React.Dispatch<React.SetStateAction<number | undefined>>;
    bypassValidation: boolean;
    setBypassValidation: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OpenDetailsTab = ({
    form,
    openDate,
    setOpenDate,
    symbolLabels,
    day,
    userFieldNames,
    onFieldNamesChange,
    editMode = false,
    validationState,
    validationPrice,
    setValidationState,
    setValidationPrice,
    bypassValidation,
    setBypassValidation,
}: OpenDetailsTabProps) => {
    const { register, control, setValue, formState: { errors } } = form;

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);

    const POPULAR_SYMBOLS = React.useMemo(() => [
        { symbol: "BTC-USD", label: "Bitcoin" },
        { symbol: "ETH-USD", label: "Ethereum" },
        { symbol: "SPY",     label: "S&P 500 ETF" },
        { symbol: "QQQ",     label: "Nasdaq ETF" },
        { symbol: "AAPL",    label: "Apple" },
        { symbol: "TSLA",    label: "Tesla" },
        { symbol: "NVDA",    label: "NVIDIA" },
        { symbol: "MSFT",    label: "Microsoft" },
    ], []);

    const SYMBOL_NAMES: Record<string, string> = React.useMemo(() => ({
        "BTC-USD": "Bitcoin",
        "ETH-USD": "Ethereum",
        "SPY": "S&P 500 ETF",
        "QQQ": "Nasdaq ETF",
        "AAPL": "Apple",
        "TSLA": "Tesla",
        "NVDA": "NVIDIA",
        "MSFT": "Microsoft",
        "DOGE-USD": "Dogecoin",
        "SOL-USD": "Solana",
        "ADA-USD": "Cardano",
        "XRP-USD": "XRP",
        "LINK-USD": "Chainlink",
        "LTC-USD": "Litecoin",
    }), []);

    const uniqueHistoricalSymbols = React.useMemo(() => {
        if (!trades) return [];
        return [...new Set(
            trades
                .map(t => t.symbolName?.trim())
                .filter((s): s is string => typeof s === "string" && s.trim() !== "")
        )].sort();
    }, [trades]);

    const allSymbolsToFetch = React.useMemo(() => {
        const popular = POPULAR_SYMBOLS.map(p => p.symbol);
        return [...new Set([...uniqueHistoricalSymbols, ...popular])];
    }, [uniqueHistoricalSymbols, POPULAR_SYMBOLS]);

    const { prices } = useMarketPrices(allSymbolsToFetch);

    return (
        <div className="flex flex-col gap-4">
            {/* Date and Time Section */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-700 mb-3">When did you open?</h3>
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="open-date" className="text-sm text-zinc-600">
                                Date
                            </Label>
                            {errors.openDate && (
                                <span className="text-xs text-red-500">
                                    {errors.openDate.message}
                                </span>
                            )}
                        </div>

                        {day == undefined ? (
                            <Controller
                                name="openDate"
                                control={control}
                                render={({ field }) => (
                                    <Popover modal={true}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="justify-start text-left font-normal text-sm">
                                                <CalendarIcon className="h-4 w-4" />
                                                {openDate ? (
                                                    format(openDate, "dd MMM yyyy")
                                                ) : (
                                                    <span className="text-zinc-400">Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar
                                                mode="single"
                                                selected={openDate}
                                                onSelect={(date) => {
                                                    setOpenDate(date);
                                                    field.onChange(date?.toISOString());
                                                }}
                                                defaultMonth={new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        ) : (
                            <Input
                                disabled
                                className="text-sm"
                                placeholder={`${day.date()} ${months[day.month()].slice(0, 3)} ${day.year()}`}
                            />
                        )}
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="open-time" className="text-sm text-zinc-600">
                                Time
                            </Label>
                            <span className="text-xs text-zinc-400">
                                (optional)
                            </span>
                        </div>
                        <Input
                            type="time"
                            id="open-time"
                            className="w-full text-sm"
                            {...register("openTime")}
                        />
                    </div>
                </div>
            </div>

            {/* Trade Info Section */}
            <div className="border border-zinc-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-700 mb-3">Trade details</h3>
                
                {/* Symbol Name */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="symbolName" className="text-sm text-zinc-600">
                            Symbol
                        </Label>
                        {errors.symbolName ? (
                            <span className="text-xs text-red-500">
                                {errors.symbolName.message}
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-400">
                                e.g. BTC, AAPL
                            </span>
                        )}
                    </div>
                    <Controller
                        name="symbolName"
                        control={control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setBypassValidation(false);
                                        }}
                                        placeholder="Type symbol"
                                        type="text"
                                        className="w-2/3 text-sm font-semibold"
                                    />

                                    {/* RADIX POPOVER GROUPED DROPDOWN */}
                                    <Popover modal={true}>
                                        <PopoverTrigger asChild>
                                            <button 
                                                type="button"
                                                className="w-1/3 h-9 px-3 text-xs text-zinc-500 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors flex items-center justify-between font-medium bg-white"
                                            >
                                                <span>Or select</span>
                                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[280px] p-0 bg-white shadow-lg border border-zinc-200 rounded-md overflow-hidden" align="end">
                                            <div className="max-h-64 overflow-y-auto flex flex-col py-1">
                                                {uniqueHistoricalSymbols.length > 0 && (
                                                    <>
                                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-1.5 bg-zinc-50 border-b border-zinc-100">
                                                            Your positions
                                                        </div>
                                                        <div className="flex flex-col">
                                                            {uniqueHistoricalSymbols.map((sym) => {
                                                                const label = SYMBOL_NAMES[sym] || "Historical Position";
                                                                const price = prices[sym] ?? null;
                                                                return (
                                                                    <button
                                                                        key={sym}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setValue("symbolName", sym);
                                                                            setBypassValidation(false);
                                                                            if (price !== null) {
                                                                                setValidationState("valid");
                                                                                setValidationPrice(price);
                                                                            }
                                                                        }}
                                                                        className="flex items-center justify-between px-3 py-2 hover:bg-zinc-50 text-left transition-colors"
                                                                    >
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="text-xs font-semibold text-zinc-800">{sym}</span>
                                                                            <span className="text-[10px] text-zinc-400 truncate">{label}</span>
                                                                        </div>
                                                                        {price !== null && (
                                                                            <span className="text-xs font-semibold text-zinc-600">
                                                                                ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}

                                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-1.5 bg-zinc-50 border-y border-zinc-100">
                                                    Popular
                                                </div>
                                                <div className="flex flex-col">
                                                    {POPULAR_SYMBOLS.map(({ symbol: sym, label }) => {
                                                        const price = prices[sym] ?? null;
                                                        return (
                                                            <button
                                                                    key={sym}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setValue("symbolName", sym);
                                                                        setBypassValidation(false);
                                                                        if (price !== null) {
                                                                            setValidationState("valid");
                                                                            setValidationPrice(price);
                                                                        }
                                                                    }}
                                                                    className="flex items-center justify-between px-3 py-2 hover:bg-zinc-50 text-left transition-colors"
                                                                >
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="text-xs font-semibold text-zinc-800">{sym}</span>
                                                                        <span className="text-[10px] text-zinc-400 truncate">{label}</span>
                                                                    </div>
                                                                    {price !== null && (
                                                                        <span className="text-xs font-semibold text-zinc-600">
                                                                            ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* REAL-TIME VALIDATION STATUS LABELS */}
                                {validationState !== "idle" && (
                                    <div className="flex items-center gap-1.5 text-xs mt-0.5">
                                        {validationState === "validating" && (
                                            <>
                                                <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                                                <span className="text-zinc-500">Checking market data...</span>
                                            </>
                                        )}
                                        {validationState === "valid" && (
                                            <>
                                                <span className="text-green-600 font-bold">✓</span>
                                                <span className="text-green-600 font-medium">
                                                    Valid symbol • Live Price: ${validationPrice?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                            </>
                                        )}
                                        {validationState === "invalid" && (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-red-500 font-bold">✗</span>
                                                <span className="text-red-500 font-medium mr-1">Symbol not found on Yahoo Finance</span>
                                                {!bypassValidation && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setBypassValidation(true)}
                                                        className="text-zinc-500 hover:text-zinc-800 underline font-semibold transition-colors text-xs"
                                                    >
                                                        Add anyway
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {validationState === "invalid" && bypassValidation && (
                                            <>
                                                <span className="text-amber-600 font-bold">⚠</span>
                                                <span className="text-amber-600 font-medium">Bypassed check (market data unavailable)</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                </div>

                {/* Position Type */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <Label className="text-sm text-zinc-600">Position</Label>
                        {errors.positionType ? (
                            <span className="text-xs text-red-500">
                                {errors.positionType.message}
                            </span>
                        ) : (
                            <span className="text-xs text-zinc-400">
                                Click to toggle
                            </span>
                        )}
                    </div>
                    <Controller
                        name="positionType"
                        control={control}
                        render={({ field }) => (
                            <div
                                className={`h-[40px] ${field.value === "buy" ? "bg-buy" : "bg-sell"
                                    } rounded-md cursor-pointer flex items-center justify-center transition-colors`}
                                onClick={() =>
                                    field.value === "buy"
                                        ? setValue("positionType", "sell")
                                        : setValue("positionType", "buy")
                                }>
                                <p className="text-white font-medium text-sm">
                                    {field.value === "buy" ? "Buy (Long)" : "Sell (Short)"}
                                </p>
                            </div>
                        )}
                    />
                </div>

                {/* Entry Price and Quantity */}
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="entryPrice" className="text-sm text-zinc-600">
                                Entry price
                            </Label>
                            {errors.entryPrice && (
                                <span className="text-xs text-red-500">
                                    {errors.entryPrice.message}
                                </span>
                            )}
                        </div>
                        <Input
                            type="number"
                            id="entryPrice"
                            step="any"
                            placeholder="0.00"
                            className="w-full text-sm"
                            {...register("entryPrice")}
                        />
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="quantity" className="text-sm text-zinc-600">
                                Quantity
                            </Label>
                            {errors.quantity && (
                                <span className="text-xs text-red-500">
                                    {errors.quantity.message}
                                </span>
                            )}
                        </div>
                        <Input
                            type="number"
                            id="quantity"
                            step="any"
                            placeholder="0"
                            className="w-full text-sm"
                            {...register("quantity")}
                        />
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            {!editMode ? (
                <div className="border border-zinc-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="notes" className="text-sm font-medium text-zinc-700">
                            Notes
                        </Label>
                        <span className="text-xs text-zinc-400">
                            optional
                        </span>
                    </div>
                    <textarea
                        id="notes"
                        rows={2}
                        placeholder="Add any notes about this trade..."
                        className="w-full outline-none rounded-md border border-zinc-200 px-3 py-2 resize-none text-sm focus:border-zinc-400 transition-colors"
                        {...register("notes")}
                    />
                </div>
            ) : (
                <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50">
                    Trade updates, execution logs, and thesis notes are managed in the dedicated <strong className="text-zinc-700 font-semibold">Notes tab</strong> at the top of this panel.
                </div>
            )}

            {/* Custom Fields Section */}
            <CustomFieldsSection 
                form={form} 
                fieldKey="openOtherDetails"
                userFieldNames={userFieldNames}
                onFieldNamesChange={onFieldNamesChange}
            />
        </div>
    );
};