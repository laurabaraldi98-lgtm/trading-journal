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
            string | null,
            string | null
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
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
                entryDatetime=""
                exitDatetime=""
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
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
            screen.getByText("long")
        ).toBeInTheDocument();
    });

    test("shows dashes when trade dates are missing", () => {
        const trade: [
            number,
            string,
            string,
            number,
            number,
            number,
            number,
            string | null,
            string | null
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
                null,
                null
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
                entryDatetime=""
                exitDatetime=""
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onEdit={() => { }}
                onUpdate={() => { }}
                onDelete={() => { }}
            />
        );

        expect(
            screen.getAllByText("-")
        ).toHaveLength(2);
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
            string | null,
            string | null
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
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
                entryDatetime=""
                exitDatetime=""
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onEdit={mockEdit}
                onUpdate={() => { }}
                onDelete={() => { }}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Edit" })
        );

        expect(mockEdit).toHaveBeenCalledWith(trade);
    });

    const editFieldCases = [
        ["Edit symbol", "GBPUSD"],
        ["Edit direction", "short"],
        ["Edit entry", "1.20"],
        ["Edit stop", "1.18"],
        ["Edit exit", "1.25"],
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
                string | null,
                string | null
            ] = [
                    1,
                    "EURUSD",
                    "long",
                    1.15,
                    1.14,
                    1.17,
                    2,
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
                    entryDatetime="2026-08-12T10:00"
                    exitDatetime="2026-08-12T11:00"
                    setSymbol={mockSetSymbol}
                    setDirection={mockSetDirection}
                    setEntry={mockSetEntry}
                    setStop={mockSetStop}
                    setExit={mockSetExit}
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
            string | null,
            string | null
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
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
                entryDatetime="2026-08-12T10:00"
                exitDatetime="2026-08-12T11:00"
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onEdit={() => { }}
                onUpdate={mockUpdate}
                onDelete={() => { }}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Save" })
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
            string | null,
            string | null
        ] = [
                1,
                "EURUSD",
                "long",
                1.15,
                1.14,
                1.17,
                2,
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
                entryDatetime=""
                exitDatetime=""
                setSymbol={() => { }}
                setDirection={() => { }}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onEdit={() => { }}
                onUpdate={() => { }}
                onDelete={mockDelete}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Delete" })
        );

        expect(mockDelete).toHaveBeenCalledWith(1);
    });
});