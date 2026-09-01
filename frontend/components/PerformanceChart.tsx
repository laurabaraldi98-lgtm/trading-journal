"use client";

import { useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type Trade = [
    number,
    string,
    string,
    number,
    number | null,
    number,
    number | null,
    number,
    string,
    string
];

type Props = {
    trades: Trade[];
    currency: string;
};

type Metric = "r" | "pnl";

function sortTradesChronologically(trades: Trade[]) {
    return [...trades].sort(
        (a, b) => new Date(a[8]).getTime() - new Date(b[8]).getTime()
    );
}

export function buildCumulativeRData(trades: Trade[]) {
    let cumulativeR = 0;

    return sortTradesChronologically(trades).reduce<
        Array<{ tradeNumber: number; equity: number }>
    >((data, trade) => {
        const result = trade[6];

        if (result === null) {
            return data;
        }

        cumulativeR += result;
        data.push({
            tradeNumber: data.length + 1,
            equity: cumulativeR,
        });

        return data;
    }, []);
}

export function buildCumulativePnlData(trades: Trade[]) {
    let cumulativePnl = 0;

    return sortTradesChronologically(trades).map((trade, index) => {
        cumulativePnl += trade[7];

        return {
            tradeNumber: index + 1,
            pnl: cumulativePnl,
        };
    });
}

export default function PerformanceChart({ trades, currency }: Props) {
    const [metric, setMetric] = useState<Metric>("r");
    const tradesWithRCount = trades.filter((trade) => trade[6] !== null).length;

    let rSubtitle = "Trading performance by closed trade";

    if (tradesWithRCount === 0) {
        rSubtitle = "No risk data available";
    } else if (tradesWithRCount < trades.length) {
        rSubtitle = `Based on ${tradesWithRCount} of ${trades.length} trades`;
    }

    const chartConfig = {
        r: {
            title: "Cumulative R",
            subtitle: rSubtitle,
            unit: "R",
            data: buildCumulativeRData(trades).map(({ tradeNumber, equity }) => ({
                tradeNumber,
                value: equity,
            })),
        },
        pnl: {
            title: "Cumulative P/L",
            subtitle: "Profit and loss by closed trade",
            unit: currency,
            data: buildCumulativePnlData(trades).map(({ tradeNumber, pnl }) => ({
                tradeNumber,
                value: pnl,
            })),
        },
    };

    const currentChart = chartConfig[metric];
    const hasChartData = currentChart.data.length > 0;
    const emptyMessage =
        metric === "r" && trades.length > 0
            ? "No risk data available."
            : "No trades yet.";

    return (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                        {currentChart.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {currentChart.subtitle}
                    </p>
                </div>

                <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => setMetric("r")}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition ${metric === "r"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                    >
                        R
                    </button>

                    <button
                        type="button"
                        onClick={() => setMetric("pnl")}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition ${metric === "pnl"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                    >
                        P/L
                    </button>
                </div>
            </div>

            {!hasChartData ? (
                <p className="text-zinc-500">{emptyMessage}</p>
            ) : (
                <div className="relative h-80 w-full">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-slate-500">
                        {currentChart.unit}
                    </div>

                    <div className="h-full pl-2 sm:pl-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={currentChart.data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="tradeNumber"
                                    minTickGap={20}
                                    label={{
                                        value: "Trade",
                                        position: "insideBottom",
                                        offset: -5,
                                    }}
                                />
                                <YAxis
                                    width={50}
                                    tickMargin={4}
                                    tickFormatter={(value) =>
                                        metric === "pnl"
                                            ? Intl.NumberFormat("en-US", {
                                                notation: "compact",
                                                maximumFractionDigits: 1,
                                            }).format(Number(value))
                                            : Number(value).toFixed(1)
                                    }
                                />
                                <Tooltip
                                    formatter={(value) => [
                                        metric === "pnl"
                                            ? `${currency} ${Number(value).toLocaleString("en-US")}`
                                            : `${Number(value).toFixed(2)}R`,
                                        metric === "pnl" ? "P/L" : "R",
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
