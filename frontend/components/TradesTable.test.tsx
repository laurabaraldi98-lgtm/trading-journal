import {
    render,
    screen,
    cleanup,
    fireEvent
} from "@testing-library/react";

import {
    describe,
    expect,
    test,
    vi,
    afterEach
} from "vitest";

import TradesTable from "./TradesTable";


afterEach(() => {
    cleanup();
});


describe("TradesTable", () => {
    test("shows trade data", () => {
        const trade: [
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
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
                150,
                "2026-08-12T10:00",
                "2026-08-12T11:00"
            ];

        render(
            <TradesTable
                trades={[trade]}
                editingTradeId={null}
                symbol=""
                direction=""
                entry=""
                stop=""
                exit=""
                pnl=""
                entryDatetime=""
                exitDatetime=""
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setPnl={() => { }}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onEdit={() => { }}
                onUpdate={() => { }}
                onDelete={() => { }}
            />
        );

        expect(
            screen.getByText("EURUSD")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Long ↑")
        ).toBeInTheDocument();
    });

    test("calls onEdit with the trade when Edit is clicked", () => {
        const mockEdit = vi.fn();

        const trade: [
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
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
                150,
                "2026-08-12T10:00",
                "2026-08-12T11:00"
            ];

        render(
            <TradesTable
                trades={[trade]}
                editingTradeId={null}
                symbol=""
                direction=""
                entry=""
                stop=""
                exit=""
                pnl=""
                entryDatetime=""
                exitDatetime=""
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setPnl={() => { }}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onEdit={mockEdit}
                onUpdate={() => { }}
                onDelete={() => { }}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Edit trade" })
        );

        expect(mockEdit).toHaveBeenCalledWith(trade);
    });

    const editFieldCases = [
        ["Edit symbol", "GBPUSD"],
        ["Edit direction", "short"],
        ["Edit entry", "1.20"],
        ["Edit stop", "1.18"],
        ["Edit exit", "1.25"],
        ["Edit P/L", "200"],
        ["Edit entry datetime", "2026-08-12T12:00"],
        ["Edit exit datetime", "2026-08-12T13:00"],
    ] as const;

    editFieldCases.forEach(([caseName, value]) => {
        test(`updates ${caseName}`, () => {
            const mockSetSymbol = vi.fn();
            const mockSetDirection = vi.fn();
            const mockSetEntry = vi.fn();
            const mockSetStop = vi.fn();
            const mockSetExit = vi.fn();
            const mockSetPnl = vi.fn();
            const mockSetEntryDatetime = vi.fn();
            const mockSetExitDatetime = vi.fn();

            const trade: [
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
            ] = [
                    1,
                    "EURUSD",
                    "long",
                    1.15,
                    1.14,
                    1.17,
                    2,
                    150,
                    "2026-08-12T10:00",
                    "2026-08-12T11:00"
                ];

            render(
                <TradesTable
                    trades={[trade]}
                    editingTradeId={1}
                    symbol="EURUSD"
                    direction="long"
                    entry="1.15"
                    stop="1.14"
                    exit="1.17"
                    pnl="150"
                    entryDatetime="2026-08-12T10:00"
                    exitDatetime="2026-08-12T11:00"
                    setSymbol={mockSetSymbol}
                    setDirection={mockSetDirection}
                    setEntry={mockSetEntry}
                    setStop={mockSetStop}
                    setExit={mockSetExit}
                    setPnl={mockSetPnl}
                    setEntryDatetime={mockSetEntryDatetime}
                    setExitDatetime={mockSetExitDatetime}
                    onEdit={() => { }}
                    onUpdate={() => { }}
                    onDelete={() => { }}
                />
            );

            const setterMap = {
                "Edit symbol": mockSetSymbol,
                "Edit direction": mockSetDirection,
                "Edit entry": mockSetEntry,
                "Edit stop": mockSetStop,
                "Edit exit": mockSetExit,
                "Edit P/L": mockSetPnl,
                "Edit entry datetime": mockSetEntryDatetime,
                "Edit exit datetime": mockSetExitDatetime,
            };

            const field = screen.getByLabelText(caseName);

            fireEvent.change(field, {
                target: { value }
            });

            expect(
                setterMap[caseName]
            ).toHaveBeenCalledWith(value);
        });
    });

    test("calls onUpdate with the trade id when Save is clicked", () => {
        const mockUpdate = vi.fn();

        const trade: [
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
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
                150,
                "2026-08-12T10:00",
                "2026-08-12T11:00"
            ];

        render(
            <TradesTable
                trades={[trade]}
                editingTradeId={1}
                symbol="EURUSD"
                direction="long"
                entry="1.15"
                stop="1.14"
                exit="1.17"
                pnl="150"
                entryDatetime="2026-08-12T10:00"
                exitDatetime="2026-08-12T11:00"
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setPnl={() => { }}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onEdit={() => { }}
                onUpdate={mockUpdate}
                onDelete={() => { }}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Save trade" })
        );

        expect(mockUpdate).toHaveBeenCalledWith(1);
    });

    test("calls onDelete with the trade id when Delete is clicked", () => {
        const mockDelete = vi.fn();

        const trade: [
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
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
                150,
                "2026-08-12T10:00",
                "2026-08-12T11:00"
            ];

        render(
            <TradesTable
                trades={[trade]}
                editingTradeId={null}
                symbol=""
                direction=""
                entry=""
                stop=""
                exit=""
                pnl=""
                entryDatetime=""
                exitDatetime=""
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setPnl={() => { }}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onEdit={() => { }}
                onUpdate={() => { }}
                onDelete={mockDelete}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Delete trade" })
        );

        expect(mockDelete).toHaveBeenCalledWith(1);
    });
});


test("shows a short losing trade", () => {
    const trade: [
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
    ] = [
            1,
            "GBPUSD",
            "short",
            1.25,
            1.26,
            1.23,
            -1,
            -100,
            "2026-08-12T10:00",
            "2026-08-12T11:00"
        ];

    render(
        <TradesTable
            trades={[trade]}
            editingTradeId={null}
            symbol=""
            direction=""
            entry=""
            stop=""
            exit=""
            pnl=""
            entryDatetime=""
            exitDatetime=""
            setSymbol={() => { }}
            setDirection={() => { }}
            setEntry={() => { }}
            setStop={() => { }}
            setExit={() => { }}
            setPnl={() => { }}
            setEntryDatetime={() => { }}
            setExitDatetime={() => { }}
            onEdit={() => { }}
            onUpdate={() => { }}
            onDelete={() => { }}
        />
    );

    expect(
        screen.getByText("Short ↓")
    ).toBeInTheDocument();

    expect(
        screen.getByText("-1R")
    ).toBeInTheDocument();
});


test("shows a breakeven trade", () => {
    const trade: [
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
    ] = [
            1,
            "EURUSD",
            "long",
            1.15,
            1.14,
            1.15,
            0,
            0,
            "2026-08-12T10:00",
            "2026-08-12T11:00"
        ];

    render(
        <TradesTable
            trades={[trade]}
            editingTradeId={null}
            symbol=""
            direction=""
            entry=""
            stop=""
            exit=""
            pnl=""
            entryDatetime=""
            exitDatetime=""
            setSymbol={() => { }}
            setDirection={() => { }}
            setEntry={() => { }}
            setStop={() => { }}
            setExit={() => { }}
            setPnl={() => { }}
            setEntryDatetime={() => { }}
            setExitDatetime={() => { }}
            onEdit={() => { }}
            onUpdate={() => { }}
            onDelete={() => { }}
        />
    );

    expect(
        screen.getByText("0R")
    ).toBeInTheDocument();
});


test.each([
    [-1, "-1R"],
    [0, "0R"],
])("shows result %s while editing", (result, expectedText) => {
    const trade: [
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
    ] = [
            1,
            "EURUSD",
            "long",
            1.15,
            1.14,
            1.17,
            result,
            150,
            "2026-08-12T10:00",
            "2026-08-12T11:00"
        ];

    render(
        <TradesTable
            trades={[trade]}
            editingTradeId={1}
            symbol="EURUSD"
            direction="long"
            entry="1.15"
            stop="1.14"
            exit="1.17"
            pnl="150"
            entryDatetime=""
            exitDatetime=""
            setSymbol={() => { }}
            setDirection={() => { }}
            setEntry={() => { }}
            setStop={() => { }}
            setExit={() => { }}
            setPnl={() => { }}
            setEntryDatetime={() => { }}
            setExitDatetime={() => { }}
            onEdit={() => { }}
            onUpdate={() => { }}
            onDelete={() => { }}
        />
    );

    expect(
        screen.getByText(expectedText)
    ).toBeInTheDocument();
});


test("shows View all trades when showViewAll is true", () => {
    render(
        <TradesTable
            trades={[]}
            editingTradeId={null}
            symbol=""
            direction=""
            entry=""
            stop=""
            exit=""
            pnl=""
            entryDatetime=""
            exitDatetime=""
            setSymbol={() => { }}
            setDirection={() => { }}
            setEntry={() => { }}
            setStop={() => { }}
            setExit={() => { }}
            setPnl={() => { }}
            setEntryDatetime={() => { }}
            setExitDatetime={() => { }}
            onEdit={() => { }}
            onUpdate={() => { }}
            onDelete={() => { }}
            showViewAll={true}
        />
    );

    expect(
        screen.getByRole("link", { name: "View all trades →" })
    ).toBeInTheDocument();
});