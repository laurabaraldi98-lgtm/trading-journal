import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import StatisticsCards, { type Trade } from "./StatisticsCards";

afterEach(() => {
    cleanup();
});

function makeTrade(id: number, result: number | null, pnl: number): Trade {
    return [
        id,
        "EURUSD",
        "long",
        100,
        result === null ? null : 90,
        120,
        result,
        pnl,
        null,
        null,
    ];
}

describe("StatisticsCards", () => {
    test("shows unavailable R statistics when there are no trades", () => {
        render(
            <StatisticsCards trades={[]} startingBalance={0} currency="" />
        );

        expect(screen.getAllByText("—")).toHaveLength(2);
        expect(screen.getAllByText("No risk data")).toHaveLength(2);
        expect(screen.getByText("0.0%")).toBeInTheDocument();
        expect(screen.getAllByText("0")).toHaveLength(3);
        expect(screen.getByText("P/L")).toBeInTheDocument();
        expect(screen.getByText("Balance")).toBeInTheDocument();
    });

    test("calculates complete statistics from trades", () => {
        const trades: Trade[] = [
            makeTrade(1, 2, 500),
            makeTrade(2, -1, -200),
            makeTrade(3, 0, 100),
        ];

        render(
            <StatisticsCards
                trades={trades}
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
        const trades: Trade[] = [
            makeTrade(1, 2, 500),
            makeTrade(2, null, -200),
        ];

        render(
            <StatisticsCards
                trades={trades}
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
        const trades: Trade[] = [
            makeTrade(1, -2, -500),
            makeTrade(2, -1, -250),
        ];

        render(
            <StatisticsCards
                trades={trades}
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

