import {
    cleanup,
    render,
    screen,
} from "@testing-library/react";

import {
    afterEach,
    describe,
    expect,
    test,
} from "vitest";

import PerformanceChart, {
    buildCumulativePnlData,
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
    string,
    string
];


afterEach(() => {
    cleanup();
});


describe("PerformanceChart", () => {
    test(
        "shows a message when there are no trades",
        () => {
            render(
                <PerformanceChart
                    trades={[]}
                    currency="USD"
                />
            );

            expect(
                screen.getByText(
                    "No trades yet."
                )
            ).toBeInTheDocument();
        }
    );


    test(
        "renders the chart when trades are present",
        () => {
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
                    "2026-08-10T10:00",
                    "2026-08-10T11:00",
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
                    "2026-08-11T10:00",
                    "2026-08-11T11:00",
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
                    "2026-08-12T10:00",
                    "2026-08-12T11:00",
                ],
            ];

            render(
                <PerformanceChart
                    trades={trades}
                    currency="USD"
                />
            );

            expect(
                screen.getByText(
                    "Cumulative R"
                )
            ).toBeInTheDocument();

            expect(
                screen.queryByText(
                    "No trades yet."
                )
            ).not.toBeInTheDocument();
        }
    );


    test(
        "calculates cumulative R in chronological entry order",
        () => {
            const trades: Trade[] = [
                [
                    3,
                    "EURUSD",
                    "long",
                    10,
                    8,
                    11,
                    0.5,
                    50,
                    "2026-08-12T10:00",
                    "2026-08-12T11:00",
                ],
                [
                    1,
                    "EURUSD",
                    "long",
                    10,
                    8,
                    14,
                    2,
                    200,
                    "2026-08-10T10:00",
                    "2026-08-10T11:00",
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
                    "2026-08-11T10:00",
                    "2026-08-11T11:00",
                ],
            ];

            expect(
                buildCumulativeRData(
                    trades
                )
            ).toEqual([
                {
                    tradeNumber: 1,
                    equity: 2,
                },
                {
                    tradeNumber: 2,
                    equity: 1,
                },
                {
                    tradeNumber: 3,
                    equity: 1.5,
                },
            ]);
        }
    );


    test(
        "calculates cumulative P/L in chronological entry order",
        () => {
            const trades: Trade[] = [
                [
                    3,
                    "EURUSD",
                    "long",
                    10,
                    8,
                    11,
                    0.5,
                    50,
                    "2026-08-12T10:00",
                    "2026-08-12T11:00",
                ],
                [
                    1,
                    "EURUSD",
                    "long",
                    10,
                    8,
                    14,
                    2,
                    200,
                    "2026-08-10T10:00",
                    "2026-08-10T11:00",
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
                    "2026-08-11T10:00",
                    "2026-08-11T11:00",
                ],
            ];

            expect(
                buildCumulativePnlData(
                    trades
                )
            ).toEqual([
                {
                    tradeNumber: 1,
                    pnl: 200,
                },
                {
                    tradeNumber: 2,
                    pnl: 100,
                },
                {
                    tradeNumber: 3,
                    pnl: 150,
                },
            ]);
        }
    );


    test(
        "does not mutate the original trades array while sorting",
        () => {
            const trades: Trade[] = [
                [
                    2,
                    "EURUSD",
                    "long",
                    10,
                    8,
                    8,
                    -1,
                    -100,
                    "2026-08-11T10:00",
                    "2026-08-11T11:00",
                ],
                [
                    1,
                    "EURUSD",
                    "long",
                    10,
                    8,
                    14,
                    2,
                    200,
                    "2026-08-10T10:00",
                    "2026-08-10T11:00",
                ],
            ];

            const originalOrder =
                trades.map(
                    (trade) =>
                        trade[0]
                );

            buildCumulativeRData(
                trades
            );

            expect(
                trades.map(
                    (trade) =>
                        trade[0]
                )
            ).toEqual(
                originalOrder
            );
        }
    );
});