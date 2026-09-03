import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import StatisticsCards, {
    type DashboardStatistics,
} from "./StatisticsCards";

afterEach(() => {
    cleanup();
});

function makeStatistics(
    overrides: Partial<DashboardStatistics> = {}
): DashboardStatistics {
    return {
        total_trades: 0,
        winning_trades: 0,
        total_pnl: 0,
        total_r: null,
        trades_with_r: 0,
        win_rate: 0,
        average_r: null,
        ...overrides,
    };
}

describe("StatisticsCards", () => {
    test("shows unavailable R statistics when there are no trades", () => {
        render(
            <StatisticsCards
                statistics={makeStatistics()}
                startingBalance={0}
                currency=""
            />
        );

        expect(screen.getAllByText("—")).toHaveLength(2);
        expect(screen.getAllByText("No risk data")).toHaveLength(2);
        expect(screen.getByText("0.0%")).toBeInTheDocument();
        expect(screen.getAllByText("0")).toHaveLength(3);
        expect(screen.getByText("P/L")).toBeInTheDocument();
        expect(screen.getByText("Balance")).toBeInTheDocument();
    });

    test("shows complete statistics from backend", () => {
        render(
            <StatisticsCards
                statistics={makeStatistics({
                    total_trades: 3,
                    winning_trades: 2,
                    total_pnl: 400,
                    total_r: 1,
                    trades_with_r: 3,
                    win_rate: 66.6666666667,
                    average_r: 0.3333333333,
                })}
                startingBalance={100000}
                currency="USD"
            />
        );

        expect(screen.getByText("1.00R")).toBeInTheDocument();
        expect(screen.getByText("66.7%")).toBeInTheDocument();
        expect(screen.getByText("0.33R")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("USD 400")).toBeInTheDocument();
        expect(screen.getByText("USD 100,400")).toBeInTheDocument();
        expect(screen.queryByText(/Based on/)).not.toBeInTheDocument();
    });

    test("shows R coverage while keeping money statistics complete", () => {
        render(
            <StatisticsCards
                statistics={makeStatistics({
                    total_trades: 2,
                    winning_trades: 1,
                    total_pnl: 300,
                    total_r: 2,
                    trades_with_r: 1,
                    win_rate: 50,
                    average_r: 2,
                })}
                startingBalance={100000}
                currency="USD"
            />
        );

        expect(screen.getAllByText("2.00R")).toHaveLength(2);
        expect(screen.getAllByText("Based on 1 of 2 trades")).toHaveLength(2);
        expect(screen.getByText("50.0%")).toBeInTheDocument();
        expect(screen.getByText("USD 300")).toBeInTheDocument();
        expect(screen.getByText("USD 100,300")).toBeInTheDocument();
    });

    test("shows negative R and P/L values correctly", () => {
        render(
            <StatisticsCards
                statistics={makeStatistics({
                    total_trades: 2,
                    total_pnl: -750,
                    total_r: -3,
                    trades_with_r: 2,
                    average_r: -1.5,
                })}
                startingBalance={10000}
                currency="EUR"
            />
        );

        expect(screen.getByText("-3.00R")).toBeInTheDocument();
        expect(screen.getByText("0.0%")).toBeInTheDocument();
        expect(screen.getByText("-1.50R")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("EUR -750")).toBeInTheDocument();
        expect(screen.getByText("EUR 9,250")).toBeInTheDocument();
    });
});
