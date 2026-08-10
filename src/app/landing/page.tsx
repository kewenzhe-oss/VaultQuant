import HomePage from "@/components/home-page/HomePage";
import { Suspense } from "react";

export default function LandingPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen bg-zinc-950 text-white font-mono">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Loading VaultQuant...
                    </div>
                </div>
            }>
            <HomePage />
        </Suspense>
    );
}
