export const dynamic = "force-dynamic";

import { getAllTradeRecords } from "@/server/actions/trades";
import { getAllStrategies } from "@/server/actions/strategies";
import PrivateLayoutClient from "@/components/private-layout/PrivateLayoutClient";
import { Strategy } from "@/types/strategies.types";
import { ensureLocalUser } from "@/server/actions/user";

export default async function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await ensureLocalUser();
    const tradeRecords = await getAllTradeRecords();

    // Load strategies alongside trades
    let strategies: Strategy[] = [];
    const strategiesResult = await getAllStrategies();
    if (strategiesResult && "strategies" in strategiesResult) {
        strategies = strategiesResult.strategies;
    }

    return (
        <PrivateLayoutClient
            initialTradeRecords={tradeRecords}
            initialStrategies={strategies}>
            {children}
        </PrivateLayoutClient>
    );
}
