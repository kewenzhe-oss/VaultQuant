import HomePage from "@/components/home-page/HomePage";
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {
    // Check if local-user exists
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

    return (
        <Suspense
            fallback={
                <div className="flex-center h-screen">
                    <div className="running-algorithm">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            }>
            <HomePage />
        </Suspense>
    );
}
