import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import StatisticsCards, { type Trade } from "./StatisticsCards";


afterEach(() => {
    cleanup();
});


describe("StatisticsCards", () => {
    test("shows zero statistics when there are no trades", () => {
        render(
            <StatisticsCards
                trades={[]}
                startingBalance={0}
                currency=""
            />
        );

        expect(
            screen.getAllByText("0.00R")
        ).toHaveLength(2);

        expect(
            screen.getByText("0.0%")
        ).toBeInTheDocument();

        expect(
            screen.getAllByText("0")
        ).toHaveLength(3);

        expect(
            screen.getByText("P/L")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Balance")
        ).toBeInTheDocument();
    });


    test("calculates statistics from trades", () => {
        const trades: Trade[] = [
            [
                1,
                "EURUSD",
                "long",
                100,
                90,
                120,
                2,
                500,
                null,
                null,
            ],
            [
                2,
                "GBPUSD",
                "long",
                100,
                90,
                90,
                -1,
                -200,
                null,
                null,
            ],
            [
                3,
                "XAUUSD",
                "long",
                100,
                90,
                100,
                0,
                100,
                null,
                null,
            ],
        ];
        render(
            <StatisticsCards
                trades={trades}
                startingBalance={100000}
                currency="USD"
            />
        );

        expect(
            screen.getByText("1.00R")
        ).toBeInTheDocument();

        expect(
            screen.getByText("33.3%")
        ).toBeInTheDocument();

        expect(
            screen.getByText("0.33R")
        ).toBeInTheDocument();

        expect(
            screen.getByText("3")
        ).toBeInTheDocument();

        expect(
            screen.getByText("USD 400")
        ).toBeInTheDocument();

        expect(
            screen.getByText("USD 100,400")
        ).toBeInTheDocument();
    });
});