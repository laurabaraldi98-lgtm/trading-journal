"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

type Trade = [
    number,
    string,
    string,
    number,
    number,
    number,
    number,
    number,
    string | null,
    string | null
];

type Props = {
    trades: Trade[];
    currency: string;
};

type Metric = "r" | "pnl";

export function buildCumulativeRData(trades: Trade[]) {
    let cumulativeR = 0;

    return trades.map((trade, index) => {
        cumulativeR += trade[6];

        return {
            tradeNumber: index + 1,
            equity: cumulativeR,
        };
    });
}

export function buildCumulativePnlData(trades: Trade[]) {
    let cumulativePnl = 0;

    return trades.map((trade, index) => {
        cumulativePnl += trade[7];

        return {
            tradeNumber: index + 1,
            pnl: cumulativePnl,
        };
    });
}

export default function PerformanceChart({
    trades,
    currency,
}: Props) {
    const [metric, setMetric] = useState<Metric>("r");

    const chartConfig = {
        r: {
            title: "Cumulative R",
            subtitle: "Trading performance by closed trade",
            unit: "R",
            data: buildCumulativeRData(trades).map(
                ({ tradeNumber, equity }) => ({
                    tradeNumber,
                    value: equity,
                })
            ),
        },

        pnl: {
            title: "Cumulative P/L",
            subtitle: "Profit and loss by closed trade",
            unit: currency,
            data: buildCumulativePnlData(trades).map(
                ({ tradeNumber, pnl }) => ({
                    tradeNumber,
                    value: pnl,
                })
            ),
        },
    };

    const currentChart = chartConfig[metric];

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

            {trades.length === 0 ? (
                <p className="text-zinc-500">
                    No trades yet.
                </p>
            ) : (
                <div className="relative h-80 w-full">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-slate-500">
                        {currentChart.unit}
                    </div>

                    <div className="h-full pl-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={currentChart.data}>
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="tradeNumber"
                                    label={{
                                        value: "Trade",
                                        position: "insideBottom",
                                        offset: -5,
                                    }}
                                />

                                <YAxis
                                    width={70}
                                    tickMargin={8}
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