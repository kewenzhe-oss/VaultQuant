"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps
    extends React.HTMLAttributes<HTMLDivElement> {
    setDateRangeForFiltering: React.Dispatch<
        React.SetStateAction<DateRange | null>
    >;
    dateRange: DateRange | null;
}

export function DatePickerWithRange({
    className,
    setDateRangeForFiltering,
    dateRange,
}: DatePickerWithRangeProps) {
    const [date, setDate] = React.useState<DateRange | undefined>(
        dateRange || { from: undefined, to: undefined }
    );

    React.useEffect(() => {
        setDate(dateRange || { from: undefined, to: undefined });
    }, [dateRange]);

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full md:w-[200px] h-8 text-xs bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 font-medium shadow-xs justify-start text-left",
                            !date && "text-zinc-500"
                        )}>
                        <CalendarIcon className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(newRange) => {
                            setDate(newRange);
                            setDateRangeForFiltering(newRange ?? null);
                        }}
                        numberOfMonths={1}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
