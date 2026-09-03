import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import PerformanceChart, { type DashboardPerformance } from "./PerformanceChart";

vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children, data }: { children: React.ReactNode; data: unknown }) => (
        <div data-testid="line-chart" data-chart={JSON.stringify(data)}>{children}</div>
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: ({ tickFormatter }: { tickFormatter: (value: number) => string }) => (
        <div data-testid="y-axis-value">{tickFormatter(1500)}</div>
    ),
    Tooltip: ({ formatter }: { formatter: (value: number) => [string, string] }) => {
        const [value, label] = formatter(1500);
        return (
            <div>
                <div data-testid="tooltip-value">{value}</div>
                <div data-testid="tooltip-label">{label}</div>
            </div>
        );
    },
    Line: () => <div data-testid="line" />,
}));

const performance: DashboardPerformance = {
    r: [
        { trade_number: 1, value: 2 },
        { trade_number: 2, value: 1 },
        { trade_number: 3, value: 1.5 },
    ],
    pnl: [
        { trade_number: 1, value: 200 },
        { trade_number: 2, value: 100 },
        { trade_number: 3, value: 150 },
    ],
};

afterEach(() => {
    cleanup();
});

describe("PerformanceChart", () => {
    test("shows an empty state when there are no trades", () => {
        render(
            <PerformanceChart
                performance={{ r: [], pnl: [] }}
                totalTrades={0}
                tradesWithR={0}
                currency="USD"
            />
        );

        expect(screen.getByText("No trades yet.")).toBeInTheDocument();
        expect(screen.getByText("Cumulative R")).toBeInTheDocument();
        expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
    });

    test("renders backend R performance by default", () => {
        render(
            <PerformanceChart
                performance={performance}
                totalTrades={3}
                tradesWithR={3}
                currency="USD"
            />
        );

        expect(screen.getByText("Cumulative R")).toBeInTheDocument();
        expect(screen.getByText("Trading performance by closed trade")).toBeInTheDocument();
        expect(screen.getByTestId("line-chart")).toHaveAttribute(
            "data-chart",
            JSON.stringify(performance.r)
        );
        expect(screen.getByTestId("y-axis-value")).toHaveTextContent("1500.0");
        expect(screen.getByTestId("tooltip-value")).toHaveTextContent("1500.00R");
        expect(screen.getByTestId("tooltip-label")).toHaveTextContent("R");
    });

    test("shows partial R coverage", () => {
        render(
            <PerformanceChart
                performance={performance}
                totalTrades={4}
                tradesWithR={3}
                currency="USD"
            />
        );

        expect(screen.getByText("Based on 3 of 4 trades")).toBeInTheDocument();
    });

    test("shows no-risk state and still allows the P/L chart", () => {
        render(
            <PerformanceChart
                performance={{ r: [], pnl: performance.pnl }}
                totalTrades={3}
                tradesWithR={0}
                currency="USD"
            />
        );

        expect(screen.getByText("No risk data available")).toBeInTheDocument();
        expect(screen.getByText("No risk data available.")).toBeInTheDocument();
        expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "P/L" }));
        expect(screen.getByText("Cumulative P/L")).toBeInTheDocument();
        expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    test("switches to backend P/L performance", () => {
        render(
            <PerformanceChart
                performance={performance}
                totalTrades={3}
                tradesWithR={3}
                currency="USD"
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "P/L" }));

        expect(screen.getByText("Cumulative P/L")).toBeInTheDocument();
        expect(screen.getByText("Profit and loss by closed trade")).toBeInTheDocument();
        expect(screen.getByText("USD")).toBeInTheDocument();
        expect(screen.getByTestId("line-chart")).toHaveAttribute(
            "data-chart",
            JSON.stringify(performance.pnl)
        );
        expect(screen.getByTestId("y-axis-value")).toHaveTextContent("1.5K");
        expect(screen.getByTestId("tooltip-value")).toHaveTextContent("USD 1,500");
        expect(screen.getByTestId("tooltip-label")).toHaveTextContent("P/L");
    });

    test("can switch from P/L back to R", () => {
        render(
            <PerformanceChart
                performance={performance}
                totalTrades={3}
                tradesWithR={3}
                currency="EUR"
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "P/L" }));
        expect(screen.getByText("Cumulative P/L")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "R" }));
        expect(screen.getByText("Cumulative R")).toBeInTheDocument();
        expect(screen.getByTestId("tooltip-label")).toHaveTextContent("R");
    });
});
