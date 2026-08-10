import { BarChart, PieChart } from "@mui/x-charts";
import { Box, useMediaQuery } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { daysOfTheWeek } from "@/data/data";

const theme = createTheme({
    typography: {
        body1: {
            fontSize: ".75rem",
        },
        body2: {
            fontSize: ".75rem",
        },
    },
});

export function StatsGridPageTwo({
    oterData,
}: {
    start?: string | undefined;
    end?: string | undefined;
    oterData: {
        chartTwo: {
            topTrades: {
                id: number;
                value: number;
                label: string;
            }[];
        };
        chartThree: {
            results: number[];
            dates: string[];
        };
        chartFour: {
            data: number[];
            color: string;
            label: string;
        }[];
    };
}) {
    console.log("StatsGridPageTwo oterData:", JSON.stringify(oterData, null, 2));
    const isMobile = useMediaQuery("(max-width:768px)");
    return (
        <ThemeProvider theme={theme}>
            <div className="grid grid-rows-3 md:grid-rows-2 grid-cols-1 md:grid-cols-12 gap-4 max-md:py-4 md:p-4 md:h-[78vh] 2xl:h-[80vh] bg-transparent w-full">
                {/* 1. Instruments Popularity */}
                <div className="max-md:h-[350px] col-span-1 md:col-span-4 row-span-1 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-start shadow-md">
                    <div className="font-semibold border-[0.5px] border-gray-200 w-full p-2">
                        <p>Your Most Popular Trading Instruments:</p>
                    </div>
                    <div className="flex gap-6 p-2">
                        <div className="flex gap-2 items-center">
                            <div className="w-[12px] h-[12px] bg-customBlue rounded-sm" />
                            <p>
                                {oterData.chartTwo.topTrades[0]?.label ??
                                    "No data"}{" "}
                                <span className="text-gray-400 text-[0.7rem]">
                                    {oterData.chartTwo.topTrades[0]?.value ?? 0}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-[12px] h-[12px] bg-customYellow rounded-sm" />
                            <p>
                                {oterData.chartTwo.topTrades[1]?.label ??
                                    "No data"}{" "}
                                <span className="text-gray-400 text-[0.7rem]">
                                    {oterData.chartTwo.topTrades[1]?.value ?? 0}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-[12px] h-[12px] bg-customOrange rounded-sm" />
                            <p>
                                {oterData.chartTwo.topTrades[2]?.label ??
                                    "No data"}{" "}
                                <span className="text-gray-400 text-[0.7rem]">
                                    {oterData.chartTwo.topTrades[2]?.value ?? 0}
                                </span>
                            </p>
                        </div>
                    </div>
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            "&::after": isMobile
                                ? {
                                      content: '""',
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      zIndex: 10,
                                      pointerEvents: "auto",
                                      cursor: "default",
                                  }
                                : {},
                        }}>
                        <PieChart
                            colors={[
                                "#9999ff",
                                "#fac666",
                                "#e16540",
                                "#E3E0DE",
                            ]}
                            series={[
                                {
                                    data: oterData.chartTwo.topTrades ?? [],
                                    innerRadius: 80,
                                    paddingAngle: 2,
                                    cornerRadius: 5,
                                    highlightScope: {
                                        fade: "global",
                                        highlight: "item",
                                    },
                                },
                            ]}
                            margin={{
                                top: 25,
                                bottom: 25,
                                left: 25,
                                right: 25,
                            }}
                            slotProps={{
                                popper: {
                                    sx: {
                                        fontSize: "0.75rem",
                                    },
                                },
                                legend: {
                                    hidden: true,
                                },
                            }}
                        />
                    </Box>
                </div>

                {/* 2. Top Profitable Trades */}
                <div className="max-md:h-[350px] col-span-1 md:col-span-8 row-span-1 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-start relative shadow-md">
                    <div className="font-semibold border-[0.5px] border-gray-200 w-full p-2">
                        <p>Top Profitable Trades</p>
                    </div>
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            "&::after": isMobile
                                ? {
                                      content: '""',
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      zIndex: 10,
                                      pointerEvents: "auto",
                                      cursor: "default",
                                  }
                                : {},
                        }}>
                        <BarChart
                            xAxis={[
                                {
                                    scaleType: "band",
                                    data: oterData.chartThree.dates ?? [],
                                },
                            ]}
                            borderRadius={5}
                            series={[
                                {
                                    data: oterData.chartThree.results ?? [],
                                    color: "#76b562",
                                    label: "Earned on This Day",
                                    valueFormatter: (value) => `${value} $`,
                                },
                            ]}
                            slotProps={{ legend: { hidden: true } }}
                        />
                    </Box>
                </div>

                {/* 3. Trading Volume by Day of the Week */}
                <div className="max-md:h-[350px] col-span-1 md:col-span-12 row-span-1 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-start shadow-md">
                    <div className="font-semibold border-[0.5px] border-gray-200 w-full p-2">
                        <p>Trading Volume by Day of the Week:</p>
                    </div>
                    <div className="flex gap-6 p-2">
                        <div className="flex gap-2 items-center">
                            <div className="w-[12px] h-[12px] bg-customBlue rounded-sm" />
                            <p>
                                {oterData.chartFour.length !== 0
                                    ? oterData.chartFour[0]?.label ?? "No data"
                                    : "No data"}
                            </p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-[12px] h-[12px] bg-customYellow rounded-sm" />
                            <p>
                                {oterData.chartFour.length !== 0
                                    ? oterData.chartFour[1]?.label ?? "No data"
                                    : "No data"}
                            </p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-[12px] h-[12px] bg-customOrange rounded-sm" />
                            <p>
                                {oterData.chartFour.length !== 0
                                    ? oterData.chartFour[2]?.label ?? "No data"
                                    : "No data"}
                            </p>
                        </div>
                    </div>
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            position: "relative",
                            "&::after": isMobile
                                ? {
                                      content: '""',
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      zIndex: 10,
                                      pointerEvents: "auto",
                                      cursor: "default",
                                  }
                                : {},
                        }}>
                        <BarChart
                            xAxis={[
                                {
                                    scaleType: "band",
                                    data: daysOfTheWeek,
                                },
                            ]}
                            borderRadius={5}
                            series={oterData.chartFour ?? []}
                            slotProps={{
                                legend: {
                                    hidden: true,
                                },
                            }}
                        />
                    </Box>
                </div>
            </div>
        </ThemeProvider>
    );
}
