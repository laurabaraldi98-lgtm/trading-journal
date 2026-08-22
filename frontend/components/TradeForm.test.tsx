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

import TradeForm from "./TradeForm";


afterEach(() => {
    cleanup();
});


function renderTradeForm(
    overrides: Partial<
        React.ComponentProps<
            typeof TradeForm
        >
    > = {}
) {
    const props = {
        symbol: "",
        direction: "",
        entry: "",
        stop: "",
        exit: "",
        pnl: "",
        entryDatetime: "",
        exitDatetime: "",

        setSymbol: vi.fn(),
        setDirection: vi.fn(),
        setEntry: vi.fn(),
        setStop: vi.fn(),
        setExit: vi.fn(),
        setPnl: vi.fn(),
        setEntryDatetime: vi.fn(),
        setExitDatetime: vi.fn(),

        onSave: vi.fn(),

        ...overrides,
    };

    render(
        <TradeForm {...props} />
    );

    return props;
}


describe("TradeForm", () => {
    test(
        "calls onSave when Save Trade is clicked",
        () => {
            const props =
                renderTradeForm();

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name: "Save Trade",
                    }
                )
            );

            expect(
                props.onSave
            ).toHaveBeenCalledOnce();
        }
    );


    test.each([
        [
            "Symbol",
            "EURUSD",
            "setSymbol",
        ],
        [
            "Entry",
            "1.1500",
            "setEntry",
        ],
        [
            "Stop",
            "1.1400",
            "setStop",
        ],
        [
            "Exit price",
            "1.1700",
            "setExit",
        ],
        [
            "P/L",
            "250",
            "setPnl",
        ],
    ] as const)(
        "updates %s",
        (
            placeholder,
            value,
            setterName
        ) => {
            const props =
                renderTradeForm();

            fireEvent.change(
                screen.getByPlaceholderText(
                    placeholder
                ),
                {
                    target: {
                        value,
                    },
                }
            );

            expect(
                props[setterName]
            ).toHaveBeenCalledWith(
                value
            );
        }
    );


    test(
        "updates Direction",
        () => {
            const props =
                renderTradeForm();

            fireEvent.change(
                screen.getByRole(
                    "combobox"
                ),
                {
                    target: {
                        value: "long",
                    },
                }
            );

            expect(
                props.setDirection
            ).toHaveBeenCalledWith(
                "long"
            );
        }
    );


    test.each([
        [
            "Entry datetime",
            "2026-08-12T10:00",
            "setEntryDatetime",
        ],
        [
            "Exit datetime",
            "2026-08-12T11:00",
            "setExitDatetime",
        ],
    ] as const)(
        "updates %s",
        (
            label,
            value,
            setterName
        ) => {
            const props =
                renderTradeForm();

            fireEvent.change(
                screen.getByLabelText(
                    label
                ),
                {
                    target: {
                        value,
                    },
                }
            );

            expect(
                props[setterName]
            ).toHaveBeenCalledWith(
                value
            );
        }
    );
});