import { Quote } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function HomePageMobileAiPage() {
    return (
        <div className="md:hidden flex flex-col items-center justify-center py-8">
            <span className="border border-zinc-200 py-1 px-2 rounded-md text-[.7rem] md:text-[.9rem] shadow-md">
                Trade AI
            </span>
            <h1 className="text-[2rem] text-center mt-6 font-semibold">
                VaultQuant AI Intelligence Engine
            </h1>
            <p className="px-4 md:px-2 text-[.9rem] mt-4 text-center text-zinc-500">
                Stop guessing why some trades succeed while others fail. VaultQuant&apos;s advanced multi-model AI pattern recognition identifies hidden factors affecting your performance.
            </p>
            <div className="mt-8 flex gap-6 items-center px-4">
                <Quote size={42} className="shrink-0 text-amber-500" />
                <h1 className="text-xl font-bold text-zinc-800">
                    IMPROVE YOUR TRADING RESULTS IN 3 EASY STEPS
                </h1>
            </div>
            <ul className="w-full px-8 mt-8 flex flex-col gap-4">
                <li>
                    <h1 className="mb-1 font-semibold text-zinc-900">
                        <span className="text-amber-500 mr-4 font-mono">01.</span>Import Broker CSV or Log Trades.
                    </h1>
                    <p className="text-zinc-500 ml-[2.2rem] text-xs">
                        Use our automated broker CSV sanitizer or calendar view to log all your trades seamlessly.
                    </p>
                </li>
                <li>
                    <h1 className="mb-1 font-semibold text-zinc-900">
                        <span className="text-amber-500 mr-4 font-mono">02.</span>Select AI Model & Get Report.
                    </h1>
                    <p className="text-zinc-500 ml-[2.2rem] text-xs">
                        Configure your preferred AI model (Claude, Gemini, OpenAI) to deliver deep reports tailored for you.
                    </p>
                </li>
                <li>
                    <h1 className="mb-1 font-semibold text-zinc-900">
                        <span className="text-amber-500 mr-4 font-mono">03.</span>Follow Up & Audit Execution.
                    </h1>
                    <p className="text-zinc-500 ml-[2.2rem] text-xs">
                        Audit strategy discipline, emotion rules, and follow up with custom questions.
                    </p>
                </li>
            </ul>
            <Image src="/mobile-ai.png" width={400} height={600} alt="mobile ai preview" className="mt-6" />
        </div>
    );
}
