import {
    cleanup,
    fireEvent,
    render,
    screen,
} from "@testing-library/react";

import {
    afterEach,
    describe,
    expect,
    test,
    vi,
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


vi.mock("recharts", () => ({
    ResponsiveContainer: ({
        children,
    }: {
        children: React.ReactNode;
    }) => (
        <div data-testid="responsive-container">
            {children}
        </div>
    ),

    LineChart: ({
        children,
    }: {
        children: React.ReactNode;
    }) => (
        <div data-testid="line-chart">
            {children}
        </div>
    ),

    CartesianGrid: () => (
        <div data-testid="cartesian-grid" />
    ),

    XAxis: () => (
        <div data-testid="x-axis" />
    ),

    YAxis: ({
        tickFormatter,
    }: {
        tickFormatter: (
            value: number
        ) => string;
    }) => (
        <div data-testid="y-axis-value">
            {tickFormatter(1500)}
        </div>
    ),

    Tooltip: ({
        formatter,
    }: {
        formatter: (
            value: number
        ) => [string, string];
    }) => {
        const [value, label] =
            formatter(1500);

        return (
            <div>
                <div data-testid="tooltip-value">
                    {value}
                </div>

                <div data-testid="tooltip-label">
                    {label}
                </div>
            </div>
        );
    },

    Line: () => (
        <div data-testid="line" />
    ),
}));


function makeTrade(
    id: number,
    result: number,
    pnl: number,
    entryDatetime: string
): Trade {
    return [
        id,
        "EURUSD",
        "long",
        10,
        8,
        14,
        result,
        pnl,
        entryDatetime,
        "2026-08-12T11:00",
    ];
}


const unsortedTrades: Trade[] = [
    makeTrade(
        3,
        0.5,
        50,
        "2026-08-12T10:00"
    ),
    makeTrade(
        1,
        2,
        200,
        "2026-08-10T10:00"
    ),
    makeTrade(
        2,
        -1,
        -100,
        "2026-08-11T10:00"
    ),
];


afterEach(() => {
    cleanup();
});


describe(
    "PerformanceChart data builders",
    () => {
        test(
            "calculates cumulative R in chronological order",
            () => {
                expect(
                    buildCumulativeRData(
                        unsortedTrades
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
            "calculates cumulative P/L in chronological order",
            () => {
                expect(
                    buildCumulativePnlData(
                        unsortedTrades
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


        test.each([
            [
                "R",
                buildCumulativeRData,
            ],
            [
                "P/L",
                buildCumulativePnlData,
            ],
        ])(
            "does not mutate the original trades array when building %s data",
            (
                _metric,
                builder
            ) => {
                const trades =
                    [...unsortedTrades];

                const originalIds =
                    trades.map(
                        (trade) =>
                            trade[0]
                    );

                builder(trades);

                expect(
                    trades.map(
                        (trade) =>
                            trade[0]
                    )
                ).toEqual(
                    originalIds
                );
            }
        );
    }
);


describe(
    "PerformanceChart",
    () => {
        test(
            "shows an empty state when there are no trades",
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

                expect(
                    screen.getByText(
                        "Cumulative R"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.queryByTestId(
                        "line-chart"
                    )
                ).not.toBeInTheDocument();
            }
        );


        test(
            "renders cumulative R by default",
            () => {
                render(
                    <PerformanceChart
                        trades={
                            unsortedTrades
                        }
                        currency="USD"
                    />
                );

                expect(
                    screen.getByText(
                        "Cumulative R"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.getByText(
                        "Trading performance by closed trade"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.getByTestId(
                        "line-chart"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.getByTestId(
                        "y-axis-value"
                    )
                ).toHaveTextContent(
                    "1500.0"
                );

                expect(
                    screen.getByTestId(
                        "tooltip-value"
                    )
                ).toHaveTextContent(
                    "1500.00R"
                );

                expect(
                    screen.getByTestId(
                        "tooltip-label"
                    )
                ).toHaveTextContent(
                    "R"
                );
            }
        );


        test(
            "switches to cumulative P/L",
            () => {
                render(
                    <PerformanceChart
                        trades={
                            unsortedTrades
                        }
                        currency="USD"
                    />
                );

                fireEvent.click(
                    screen.getByRole(
                        "button",
                        {
                            name: "P/L",
                        }
                    )
                );

                expect(
                    screen.getByText(
                        "Cumulative P/L"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.getByText(
                        "Profit and loss by closed trade"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.getByText(
                        "USD"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.getByTestId(
                        "y-axis-value"
                    )
                ).toHaveTextContent(
                    "1.5K"
                );

                expect(
                    screen.getByTestId(
                        "tooltip-value"
                    )
                ).toHaveTextContent(
                    "USD 1,500"
                );

                expect(
                    screen.getByTestId(
                        "tooltip-label"
                    )
                ).toHaveTextContent(
                    "P/L"
                );
            }
        );


        test(
            "can switch from P/L back to R",
            () => {
                render(
                    <PerformanceChart
                        trades={
                            unsortedTrades
                        }
                        currency="EUR"
                    />
                );

                const pnlButton =
                    screen.getByRole(
                        "button",
                        {
                            name: "P/L",
                        }
                    );

                const rButton =
                    screen.getByRole(
                        "button",
                        {
                            name: "R",
                        }
                    );

                fireEvent.click(
                    pnlButton
                );

                expect(
                    screen.getByText(
                        "Cumulative P/L"
                    )
                ).toBeInTheDocument();

                fireEvent.click(
                    rButton
                );

                expect(
                    screen.getByText(
                        "Cumulative R"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.getByTestId(
                        "tooltip-label"
                    )
                ).toHaveTextContent(
                    "R"
                );
            }
        );
    }
);