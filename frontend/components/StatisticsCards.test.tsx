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

import StatisticsCards, {
    type Trade,
} from "./StatisticsCards";


afterEach(() => {
    cleanup();
});


function makeTrade(
    id: number,
    result: number,
    pnl: number
): Trade {
    return [
        id,
        "EURUSD",
        "long",
        100,
        90,
        120,
        result,
        pnl,
        null,
        null,
    ];
}


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
            screen.getByText("0.00R")
        ).toBeInTheDocument();

        expect(
            screen.getByText("—")
        ).toBeInTheDocument();

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

        expect(
            screen.getByText("1.00R")
        ).toBeInTheDocument();

        expect(
            screen.getByText("66.7%")
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

        expect(
            screen.getByText("-3.00R")
        ).toBeInTheDocument();

        expect(
            screen.getByText("0.0%")
        ).toBeInTheDocument();

        expect(
            screen.getByText("-1.50R")
        ).toBeInTheDocument();

        expect(
            screen.getByText("2")
        ).toBeInTheDocument();

        expect(
            screen.getByText("EUR -750")
        ).toBeInTheDocument();

        expect(
            screen.getByText("EUR 9,250")
        ).toBeInTheDocument();
    });
});