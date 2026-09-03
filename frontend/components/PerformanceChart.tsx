"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type PerformancePoint = {
    trade_number: number;
    value: number;
};

export type DashboardPerformance = {
    r: PerformancePoint[];
    pnl: PerformancePoint[];
};

type Props = {
    performance: DashboardPerformance;
    totalTrades: number;
    tradesWithR: number;
    currency: string;
};

type Metric = "r" | "pnl";

export default function PerformanceChart({ performance, totalTrades, tradesWithR, currency }: Props) {
    const [metric, setMetric] = useState<Metric>("r");
    let rSubtitle = "Trading performance by closed trade";

    if (tradesWithR === 0) {
        rSubtitle = "No risk data available";
    } else if (tradesWithR < totalTrades) {
        rSubtitle = `Based on ${tradesWithR} of ${totalTrades} trades`;
    }

    const chartConfig = {
        r: {
            title: "Cumulative R",
            subtitle: rSubtitle,
            unit: "R",
            data: performance.r,
        },
        pnl: {
            title: "Cumulative P/L",
            subtitle: "Profit and loss by closed trade",
            unit: currency,
            data: performance.pnl,
        },
    };

    const currentChart = chartConfig[metric];
    const hasChartData = currentChart.data.length > 0;
    const emptyMessage = metric === "r" && totalTrades > 0
        ? "No risk data available."
        : "No trades yet.";

    return (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">{currentChart.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{currentChart.subtitle}</p>
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
                                    dataKey="trade_number"
                                    minTickGap={20}
                                    label={{ value: "Trade", position: "insideBottom", offset: -5 }}
                                />
                                <YAxis
                                    width={50}
                                    tickMargin={4}
                                    tickFormatter={(value) => metric === "pnl"
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
                                <Line type="monotone" dataKey="value" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
