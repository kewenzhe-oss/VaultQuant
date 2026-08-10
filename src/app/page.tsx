import HomePage from "@/components/home-page/HomePage";
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { ensureLocalUser } from "@/server/actions/user";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home({
    searchParams,
}: {
    searchParams?: Promise<{ preview?: string }>;
}) {
    const params = searchParams ? await searchParams : {};
    const isPreview = params.preview === "true";

    if (!isPreview) {
        // Ensure database tables and local-user exist
        await ensureLocalUser();
        const user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, "local-user"),
        });

        if (user) {
            if (!user.onboardingCompleted) {
                redirect("/private/intro");
            } else {
                redirect("/private/calendar");
            }
        }
    }

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
