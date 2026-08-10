import { useAppDispatch } from "@/redux/store";
import { deleteTradeRecord } from "@/server/actions/trades";
import { removeRecordFromListOfTrades } from "@/redux/slices/tradeRecordsSlice";
import { removeTradeFromFilteredList } from "@/redux/slices/historyPageSlice";
import { toast } from "sonner";

export const useDeleteOpenTrade = () => {
    const dispatch = useAppDispatch();

    const handleDeleteOpenTrade = async (tradeId: string) => {
        try {
            await deleteTradeRecord(tradeId);
            dispatch(removeRecordFromListOfTrades(tradeId));
            dispatch(removeTradeFromFilteredList(tradeId));
            toast.success("Open trade position deleted successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete open trade. Please try again.");
        }
    };

    return { handleDeleteOpenTrade };
};
