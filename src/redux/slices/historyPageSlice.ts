import { SortByType, TimeframeType, Trades } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

type documentState = {
    filteredTrades: Trades[] | undefined;
    sortBy: SortByType | undefined;
    timeframe: TimeframeType | undefined;
    activeTab: "openTrades" | "closedTrades";
};

const initialState: documentState = {
    filteredTrades: undefined,
    sortBy: undefined,
    timeframe: undefined,
    activeTab: "openTrades",
};

const historyPageSlice = createSlice({
    name: "historyPage",
    initialState,
    reducers: {
        setFilteredTrades: (state, action) => {
            state.filteredTrades = action.payload;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setTimeframe: (state, action) => {
            state.timeframe = action.payload;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        updateTradeInFilteredList: (state, action) => {
            if (state.filteredTrades !== undefined) {
                const index = state.filteredTrades.findIndex(
                    (trade) => trade.id === action.payload.id
                );
                if (index !== -1) {
                    state.filteredTrades[index] = action.payload;
                }
            }
        },
        removeTradeFromFilteredList: (state, action) => {
            if (state.filteredTrades !== undefined) {
                state.filteredTrades = state.filteredTrades.filter(
                    (trade) => trade.id !== action.payload
                );
            }
        },
    },
});

export const {
    setFilteredTrades,
    setSortBy,
    setTimeframe,
    setActiveTab,
    updateTradeInFilteredList,
    removeTradeFromFilteredList,
} = historyPageSlice.actions;

export default historyPageSlice.reducer;
