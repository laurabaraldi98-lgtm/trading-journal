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

afterEach(() => {
    cleanup();
});

describe("TradesTable", () => {
    test(
        "shows trade data",
        () => {
            renderTable();

            expect(
                screen.getAllByText(
                    "EURUSD"
                )[0]
            ).toBeInTheDocument();

            expect(
                screen.getAllByText(
                    "Long ↑"
                )[0]
            ).toBeInTheDocument();

            expect(
                screen.getAllByText(
                    "2R"
                )[0]
            ).toBeInTheDocument();
        }
    );

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
                )[0]
            ).toBeInTheDocument();

            expect(
                screen.getAllByText(
                    expectedResult
                )[0]
            ).toBeInTheDocument();
        }
    );

    test(
        "calls onEdit with the trade",
        () => {
            const trade =
                makeTrade();

            const props =
                renderTable({
                    trades: [trade],
                });

            fireEvent.click(
                screen.getAllByRole(
                    "button",
                    {
                        name:
                            "Edit trade",
                    }
                )[0]
            );

            expect(
                props.onEdit
            ).toHaveBeenCalledWith(
                trade
            );
        }
    );

    test(
        "calls onDelete with trade id",
        () => {
            const props =
                renderTable();

            fireEvent.click(
                screen.getAllByRole(
                    "button",
                    {
                        name:
                            "Delete trade",
                    }
                )[0]
            );

            expect(
                props.onDelete
            ).toHaveBeenCalledWith(1);
        }
    );

    test(
        "calls onUpdate while editing",
        () => {
            const props =
                renderTable({
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
                });

            fireEvent.click(
                screen.getAllByRole(
                    "button",
                    {
                        name:
                            "Save trade",
                    }
                )[0]
            );

            expect(
                props.onUpdate
            ).toHaveBeenCalledWith(1);
        }
    );

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
        "updates %s",
        (
            label,
            value,
            setterName
        ) => {
            const props =
                renderTable({
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
                });

            fireEvent.change(
                screen.getAllByLabelText(
                    label
                )[0],
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
                trades: [
                    makeTrade({
                        result,
                    }),
                ],
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
            });

            expect(
                screen.getAllByText(
                    expectedText
                )[0]
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

    test(
        "links to trades when no account is selected",
        () => {
            renderTable({
                trades: [],
                showViewAll: true,
                selectedAccountId: null,
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
                "/trades"
            );
        }
    );

    test(
        "includes account id in View all trades link",
        () => {
            renderTable({
                trades: [],
                showViewAll: true,
                selectedAccountId: 7,
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
                "/trades?account_id=7"
            );
        }
    );
});