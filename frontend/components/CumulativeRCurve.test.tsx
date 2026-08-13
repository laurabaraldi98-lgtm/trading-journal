import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import CumulativeRCurve, {
    buildCumulativeRData,
} from "./CumulativeRCurve";

type Trade = [
    number,
    string,
    string,
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

describe("CumulativeRCurve", () => {
    test("shows a message when there are no trades", () => {
        render(<CumulativeRCurve trades={[]} />);

        expect(screen.getByText("No trades yet.")).toBeInTheDocument();
    });

    test("renders the chart when trades are present", () => {
        const trades: Trade[] = [
            [1, "EURUSD", "long", 10, 8, 14, 2, null, null],
            [2, "EURUSD", "long", 10, 8, 8, -1, null, null],
            [3, "EURUSD", "long", 10, 8, 11, 0.5, null, null],
        ];

        render(<CumulativeRCurve trades={trades} />);

        expect(screen.getByText("Cumulative R")).toBeInTheDocument();
        expect(screen.queryByText("No trades yet.")).not.toBeInTheDocument();
    });

    test("calculates cumulative R correctly", () => {
        const trades: Trade[] = [
            [1, "EURUSD", "long", 10, 8, 14, 2, null, null],
            [2, "EURUSD", "long", 10, 8, 8, -1, null, null],
            [3, "EURUSD", "long", 10, 8, 11, 0.5, null, null],
        ];

        expect(buildCumulativeRData(trades)).toEqual([
            { tradeNumber: 1, equity: 2 },
            { tradeNumber: 2, equity: 1 },
            { tradeNumber: 3, equity: 1.5 },
        ]);
    });
});