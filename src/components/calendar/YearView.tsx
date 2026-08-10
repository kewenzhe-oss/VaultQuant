import { getYear } from "@/features/calendar/getTime";
import { setCalendarType, setMonthView } from "@/redux/slices/calendarSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import dayjs from "dayjs";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

export default function YearView() {
    const currentYear =
        useAppSelector((state) => state.calendar.yearView) ?? dayjs().year();
    const yearTradeSummary = useAppSelector(
        (state) => state.tradeRecords.yearViewSummary
    );
    const dispatch = useAppDispatch();
    const yearData = getYear(currentYear);

    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const handlePickMonth = ({ i }: { i: number }) => {
        dispatch(setCalendarType("Month"));
        dispatch(setMonthView({ month: i, year: currentYear }));
    };

    return (
        <div className="md:h-full grid grid-cols-1 md:grid-cols-4 grid-rows-12 md:grid-rows-3 p-4">
            {yearData.map((month, i) => {
                const monthName = dayjs(new Date(currentYear, i, 1)).format(
                    "MMM"
                );
                const rawSum = yearTradeSummary[`${i + 1}-${currentYear}`];
                const currentMonthSum = rawSum ?? 0;
                const isMonthSummaryAvailable = rawSum !== undefined && rawSum !== 0;

                return (
                    <div
                        key={i}
                        onClick={() => handlePickMonth({ i })}
                        className={`p-3 w-full flex flex-col gap-2 cursor-pointer rounded-xl ${
                            isMonthSummaryAvailable
                                ? currentMonthSum >= 0
                                    ? "bg-buyWithOpacity"
                                    : "bg-sellWithOpacity"
                                : ""
                        } ${
                            isMonthSummaryAvailable ? "border border-white" : ""
                        }`}>
                        <div className="flex items-center justify-between mb-2 px-3">
                            <div
                                className={`flex items-center gap-2 ${
                                    isMonthSummaryAvailable
                                        ? currentMonthSum >= 0
                                            ? "text-buy"
                                            : "text-sell"
                                        : "text-zinc-400"
                                }`}>
                                {isMonthSummaryAvailable && (
                                    currentMonthSum >= 0 ? (
                                        <FaArrowTrendUp />
                                    ) : (
                                        <FaArrowTrendDown />
                                    )
                                )}
                                <p className="text-[1.1rem]">
                                    {isMonthSummaryAvailable
                                        ? (currentMonthSum >= 0 ? "+" : "") + currentMonthSum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        : "0.00"}
                                </p>
                            </div>
                            <div className="font-bold text-zinc-800">
                                {monthName} {currentYear}
                            </div>
                        </div>

                        <div className="grid grid-cols-7 text-center font-semibold border-b border-gray-300 pb-1 mb-1 text-sm">
                            {weekdayLabels.map((dow) => (
                                <div key={dow}>{dow}</div>
                            ))}
                        </div>
                        <div
                            className="grid"
                            style={{
                                gridTemplateColumns: "repeat(7, 1fr)",
                            }}>
                            {month.map((week) =>
                                week.map((day, dayIndex) => {
                                    const isToday =
                                        day &&
                                        day.format("DD-MM-YYYY") ===
                                            dayjs().format("DD-MM-YYYY");
                                    return (
                                        <div
                                            key={dayIndex}
                                            className={`flex-center p-1 text-sm ${
                                                isToday
                                                    ? "w-8 h-8 rounded-full bg-[var(--customBlue)] place-self-center"
                                                    : ""
                                            }`}>
                                            {day ? day.date() : ""}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
