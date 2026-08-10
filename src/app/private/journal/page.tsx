"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield } from "lucide-react";
import dayjs from "dayjs";

export default function JournalPage() {
    const today = dayjs().format("YYYY/MM/DD");

    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-xs mb-6 shrink-0">
                <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-800 mb-2">
                Daily Journal
            </h1>
            <p className="text-zinc-500 max-w-md mb-8">
                Record broader daily context: market conditions, emotions, lessons, and end-of-day reflections. Use trade notes on individual trades for trade-specific reasoning.
            </p>
            <Button asChild>
                <Link href={`/private/journal/${today}`}>
                    Write Today&apos;s Daily Journal
                </Link>
            </Button>
        </div>
    );
}
