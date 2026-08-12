import {
    render,
    screen,
    fireEvent,
    cleanup
} from "@testing-library/react";

import {
    describe,
    expect,
    test,
    vi,
    afterEach
} from "vitest";

import TradeForm from "./TradeForm";


afterEach(() => {
    cleanup();
});


describe("TradeForm", () => {
    test("calls onSave when Save Trade is clicked", () => {
        const mockSave = vi.fn();

        render(
            <TradeForm
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
                onSave={mockSave}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Save Trade" })
        );

        expect(mockSave).toHaveBeenCalledOnce();
    });
});


const textFieldCases = [
    ["Symbol", "Symbol", "EURUSD"],
    ["Entry", "Entry", "1.1500"],
    ["Stop", "Stop", "1.1400"],
    ["Exit price", "Exit price", "1.1700"],
] as const;

textFieldCases.forEach(([caseName, placeholder, value]) => {
    test(`updates ${caseName}`, () => {
        const mockSetSymbol = vi.fn();
        const mockSetEntry = vi.fn();
        const mockSetStop = vi.fn();
        const mockSetExit = vi.fn();

        render(
            <TradeForm
                symbol=""
                direction=""
                entry=""
                stop=""
                exit=""
                entryDatetime=""
                exitDatetime=""
                setSymbol={mockSetSymbol}
                setDirection={() => { }}
                setEntry={mockSetEntry}
                setStop={mockSetStop}
                setExit={mockSetExit}
                setEntryDatetime={() => { }}
                setExitDatetime={() => { }}
                onSave={() => { }}
            />
        );

        const setterMap = {
            Symbol: mockSetSymbol,
            Entry: mockSetEntry,
            Stop: mockSetStop,
            "Exit price": mockSetExit,
        };

        fireEvent.change(
            screen.getByPlaceholderText(placeholder),
            { target: { value } }
        );

        expect(
            setterMap[caseName]
        ).toHaveBeenCalledWith(value);
    });
});

const specialFieldCases = [
    ["Direction", "long"],
    ["Entry datetime", "2026-08-12T10:00"],
    ["Exit datetime", "2026-08-12T11:00"],
] as const;

specialFieldCases.forEach(([caseName, value]) => {
    test(`updates ${caseName}`, () => {
        const mockSetDirection = vi.fn();
        const mockSetEntryDatetime = vi.fn();
        const mockSetExitDatetime = vi.fn();

        render(
            <TradeForm
                symbol=""
                direction=""
                entry=""
                stop=""
                exit=""
                entryDatetime=""
                exitDatetime=""
                setSymbol={() => { }}
                setDirection={mockSetDirection}
                setEntry={() => { }}
                setStop={() => { }}
                setExit={() => { }}
                setEntryDatetime={mockSetEntryDatetime}
                setExitDatetime={mockSetExitDatetime}
                onSave={() => { }}
            />
        );

        const setterMap = {
            Direction: mockSetDirection,
            "Entry datetime": mockSetEntryDatetime,
            "Exit datetime": mockSetExitDatetime,
        };

        const field =
            caseName === "Direction"
                ? screen.getByRole("combobox")
                : screen.getByLabelText(caseName);

        fireEvent.change(field, {
            target: { value }
        });

        expect(
            setterMap[caseName]
        ).toHaveBeenCalledWith(value);
    });
});