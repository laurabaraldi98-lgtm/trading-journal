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

import AccountForm from "./AccountForm";


function makeProps() {
    return {
        name: "FTMO",
        startingBalance: "100000",
        currency: "EUR",
        broker: "Broker X",
        accountType: "Funded",
        setName: vi.fn(),
        setStartingBalance: vi.fn(),
        setCurrency: vi.fn(),
        setBroker: vi.fn(),
        setAccountType: vi.fn(),
        onSave: vi.fn(),
    };
}

afterEach(() => {
    cleanup();
});

describe("AccountForm", () => {
    test("renders account values", () => {
        const props = makeProps();

        render(<AccountForm {...props} />);

        [
            ["e.g. Main account", "FTMO"],
            ["e.g. 10000", 100000],
            ["e.g. Interactive Brokers", "Broker X"],
            ["e.g. Personal account", "Funded"],
        ].forEach(([placeholder, value]) => {
            expect(
                screen.getByPlaceholderText(
                    placeholder
                )
            ).toHaveValue(value);
        });

        expect(
            screen.getByRole("combobox")
        ).toHaveValue("EUR");
    });


    test("updates fields and saves", () => {
        const props = makeProps();

        render(<AccountForm {...props} />);

        const changes = [
            [
                screen.getByPlaceholderText(
                    "e.g. Main account"
                ),
                "Personal",
                props.setName,
            ],
            [
                screen.getByPlaceholderText(
                    "e.g. 10000"
                ),
                "50000",
                props.setStartingBalance,
            ],
            [
                screen.getByRole("combobox"),
                "GBP",
                props.setCurrency,
            ],
            [
                screen.getByPlaceholderText(
                    "e.g. Interactive Brokers"
                ),
                "IBKR",
                props.setBroker,
            ],
            [
                screen.getByPlaceholderText(
                    "e.g. Personal account"
                ),
                "Personal",
                props.setAccountType,
            ],
        ] as const;

        changes.forEach(
            ([element, value, setter]) => {
                fireEvent.change(element, {
                    target: { value },
                });

                expect(setter)
                    .toHaveBeenCalledWith(value);
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Save account",
            })
        );

        expect(props.onSave)
            .toHaveBeenCalledOnce();
    });
});