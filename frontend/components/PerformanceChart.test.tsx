import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import PerformanceChart, {
    buildCumulativeRData,
} from "./PerformanceChart";

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

afterEach(() => {
    cleanup();
});

describe("PerformanceChart", () => {
    test("shows a message when there are no trades", () => {
        render(
            <PerformanceChart
                trades={[]}
                currency="USD"
            />
        );

        expect(
            screen.getByText("No trades yet.")
        ).toBeInTheDocument();
    });

    test("renders the chart when trades are present", () => {
        const trades: Trade[] = [
            [
                1,
                "EURUSD",
                "long",
                10,
                8,
                14,
                2,
                200,
                null,
                null,
            ],
            [
                2,
                "EURUSD",
                "long",
                10,
                8,
                8,
                -1,
                -100,
                null,
                null,
            ],
            [
                3,
                "EURUSD",
                "long",
                10,
                8,
                11,
                0.5,
                50,
                null,
                null,
            ],
        ];

        render(
            <PerformanceChart
                trades={trades}
                currency="USD"
            />
        );

        expect(
            screen.getByText("Cumulative R")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("No trades yet.")
        ).not.toBeInTheDocument();
    });

    test("calculates cumulative R correctly", () => {
        const trades: Trade[] = [
            [
                1,
                "EURUSD",
                "long",
                10,
                8,
                14,
                2,
                200,
                null,
                null,
            ],
            [
                2,
                "EURUSD",
                "long",
                10,
                8,
                8,
                -1,
                -100,
                null,
                null,
            ],
            [
                3,
                "EURUSD",
                "long",
                10,
                8,
                11,
                0.5,
                50,
                null,
                null,
            ],
        ];

        expect(buildCumulativeRData(trades)).toEqual([
            { tradeNumber: 1, equity: 2 },
            { tradeNumber: 2, equity: 1 },
            { tradeNumber: 3, equity: 1.5 },
        ]);
    });
});