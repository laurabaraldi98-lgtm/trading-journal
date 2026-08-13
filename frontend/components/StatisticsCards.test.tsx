import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import StatisticsCards, { type Trade } from "./StatisticsCards";


afterEach(() => {
    cleanup();
});


describe("StatisticsCards", () => {
    test("shows zero statistics when there are no trades", () => {
        render(
            <StatisticsCards trades={[]} />
        );

        expect(
            screen.getAllByText("0.00R")
        ).toHaveLength(2);

        expect(
            screen.getByText("0.0%")
        ).toBeInTheDocument();

        expect(
            screen.getByText("0")
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
                null,
                null,
            ],
        ];

        render(
            <StatisticsCards trades={trades} />
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
    });
});