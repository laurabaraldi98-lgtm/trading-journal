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

import TradesTable from "./TradesTable";

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

function makeTrade({
    direction = "long",
    result = 2,
    pnl = 150,
}: {
    direction?: string;
    result?: number;
    pnl?: number;
} = {}): Trade {
    return [
        1,
        "EURUSD",
        direction,
        1.15,
        1.14,
        1.17,
        result,
        pnl,
        "2026-08-12T10:00",
        "2026-08-12T11:00",
    ];
}

function renderTable(
    overrides: Partial<
        React.ComponentProps<
            typeof TradesTable
        >
    > = {}
) {
    const props = {
        trades: [makeTrade()],
        editingTradeId: null,

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

        onEdit: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),

        ...overrides,
    };

    render(
        <TradesTable {...props} />
    );

    return props;
}

function editingProps() {
    return {
        editingTradeId: 1,
        symbol: "EURUSD",
        direction: "long",
        entry: "1.15",
        stop: "1.14",
        exit: "1.17",
        pnl: "150",
        entryDatetime:
            "2026-08-12T10:00",
        exitDatetime:
            "2026-08-12T11:00",
    };
}

afterEach(() => {
    cleanup();
});

describe("TradesTable", () => {
    test("shows trade data in both layouts", () => {
        renderTable();

        expect(
            screen.getAllByText("EURUSD")
        ).toHaveLength(2);

        expect(
            screen.getAllByText("Long ↑")
        ).toHaveLength(2);

        expect(
            screen.getAllByText("2R")
        ).toHaveLength(2);
    });

    test.each([
        [
            "short",
            -1,
            -100,
            "Short ↓",
            "-1R",
        ],
        [
            "long",
            0,
            0,
            "Long ↑",
            "0R",
        ],
    ])(
        "shows %s trade with result %s",
        (
            direction,
            result,
            pnl,
            expectedDirection,
            expectedResult
        ) => {
            renderTable({
                trades: [
                    makeTrade({
                        direction,
                        result,
                        pnl,
                    }),
                ],
            });

            expect(
                screen.getAllByText(
                    expectedDirection
                )
            ).toHaveLength(2);

            expect(
                screen.getAllByText(
                    expectedResult
                )
            ).toHaveLength(2);
        }
    );

    test("calls onEdit from both layouts", () => {
        const trade = makeTrade();

        const props = renderTable({
            trades: [trade],
        });

        screen
            .getAllByRole("button", {
                name: "Edit trade",
            })
            .forEach((button) => {
                fireEvent.click(button);
            });

        expect(
            props.onEdit
        ).toHaveBeenCalledTimes(2);

        expect(
            props.onEdit
        ).toHaveBeenNthCalledWith(
            1,
            trade
        );

        expect(
            props.onEdit
        ).toHaveBeenNthCalledWith(
            2,
            trade
        );
    });

    test("confirms delete from both layouts", () => {
        const props = renderTable();

        fireEvent.click(
            screen.getAllByRole(
                "button",
                {
                    name: "Delete trade",
                }
            )[0]
        );

        expect(
            props.onDelete
        ).not.toHaveBeenCalled();

        fireEvent.click(
            screen.getByRole(
                "button",
                {
                    name: "Cancel",
                }
            )
        );

        expect(
            props.onDelete
        ).not.toHaveBeenCalled();

        fireEvent.click(
            screen.getAllByRole(
                "button",
                {
                    name: "Delete trade",
                }
            )[1]
        );

        fireEvent.click(
            screen.getByRole(
                "button",
                {
                    name: "Delete permanently",
                }
            )
        );

        expect(
            props.onDelete
        ).toHaveBeenCalledOnce();

        expect(
            props.onDelete
        ).toHaveBeenCalledWith(
            1
        );
    });

    test("calls onUpdate from both layouts", () => {
        const props = renderTable(
            editingProps()
        );

        screen
            .getAllByRole("button", {
                name: "Save trade",
            })
            .forEach((button) => {
                fireEvent.click(button);
            });

        expect(
            props.onUpdate
        ).toHaveBeenCalledTimes(2);

        expect(
            props.onUpdate
        ).toHaveBeenNthCalledWith(
            1,
            1
        );

        expect(
            props.onUpdate
        ).toHaveBeenNthCalledWith(
            2,
            1
        );
    });

    test.each([
        [
            "Edit symbol",
            "GBPUSD",
            "setSymbol",
        ],
        [
            "Edit direction",
            "short",
            "setDirection",
        ],
        [
            "Edit entry",
            "1.20",
            "setEntry",
        ],
        [
            "Edit stop",
            "1.18",
            "setStop",
        ],
        [
            "Edit exit",
            "1.25",
            "setExit",
        ],
        [
            "Edit P/L",
            "200",
            "setPnl",
        ],
        [
            "Edit entry datetime",
            "2026-08-12T12:00",
            "setEntryDatetime",
        ],
        [
            "Edit exit datetime",
            "2026-08-12T13:00",
            "setExitDatetime",
        ],
    ] as const)(
        "updates %s in both layouts",
        (
            label,
            value,
            setterName
        ) => {
            const props =
                renderTable(
                    editingProps()
                );

            screen
                .getAllByLabelText(label)
                .forEach((input) => {
                    fireEvent.change(
                        input,
                        {
                            target: {
                                value,
                            },
                        }
                    );
                });

            expect(
                props[setterName]
            ).toHaveBeenCalledTimes(2);

            expect(
                props[setterName]
            ).toHaveBeenNthCalledWith(
                1,
                value
            );

            expect(
                props[setterName]
            ).toHaveBeenNthCalledWith(
                2,
                value
            );
        }
    );

    test.each([
        [-1, "-1R"],
        [0, "0R"],
    ])(
        "shows result %s while editing",
        (
            result,
            expectedText
        ) => {
            renderTable({
                ...editingProps(),
                trades: [
                    makeTrade({
                        result,
                    }),
                ],
            });

            expect(
                screen.getByText(
                    expectedText
                )
            ).toBeInTheDocument();
        }
    );

    test(
        "does not show View all trades by default",
        () => {
            renderTable({
                trades: [],
            });

            expect(
                screen.queryByRole(
                    "link",
                    {
                        name:
                            "View all trades →",
                    }
                )
            ).not.toBeInTheDocument();
        }
    );

    test.each([
        [null, "/trades"],
        [
            7,
            "/trades?account_id=7",
        ],
    ])(
        "uses the correct View all trades link",
        (
            selectedAccountId,
            expectedHref
        ) => {
            renderTable({
                trades: [],
                showViewAll: true,
                selectedAccountId,
            });

            expect(
                screen.getByRole(
                    "link",
                    {
                        name:
                            "View all trades →",
                    }
                )
            ).toHaveAttribute(
                "href",
                expectedHref
            );
        }
    );
});