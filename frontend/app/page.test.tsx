import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from "vitest";

import Home from "./page";


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

type Account = {
    id: number;
    user_id: string;
    name: string;
    starting_balance: number;
    currency: string;
    broker: string | null;
    account_type: string | null;
};


const {
    mockGetSession,
    mockSignOut,
    mockOnAuthStateChange,
    mockUnsubscribe,
    mockPush,
    authCallback,
    formActions,
    tableActions,
} = vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockSignOut: vi.fn(),
    mockOnAuthStateChange: vi.fn(),
    mockUnsubscribe: vi.fn(),
    mockPush: vi.fn(),

    authCallback: {
        current: null as
            | ((
                event: string,
                session: unknown
            ) => void)
            | null,
    },

    formActions: {
        fillValidTrade: null as
            | (() => void)
            | null,

        clearDates: null as
            | (() => void)
            | null,

        reverseDates: null as
            | (() => void)
            | null,

        save: null as
            | (() => void)
            | null,
    },

    tableActions: {
        edit: null as
            | ((trade: Trade) => void)
            | null,

        update: null as
            | ((id: number) => void)
            | null,

        delete: null as
            | ((id: number) => void)
            | null,
    },
}));


vi.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            getSession:
                mockGetSession,

            signOut:
                mockSignOut,

            onAuthStateChange: (
                callback: (
                    event: string,
                    session: unknown
                ) => void
            ) => {
                authCallback.current =
                    callback;

                return mockOnAuthStateChange(
                    callback
                );
            },
        },
    },
}));


vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));


vi.mock("../components/Sidebar", () => ({
    default: ({
        userEmail,
        onLogout,
    }: {
        userEmail:
        | string
        | null;

        onLogout:
        () => void;
    }) => (
        <div>
            <span data-testid="email">
                {userEmail ??
                    "no-email"}
            </span>

            <button
                type="button"
                onClick={
                    onLogout
                }
            >
                Logout
            </button>
        </div>
    ),
}));


vi.mock("../components/TradeForm", () => ({
    default: ({
        setSymbol,
        setDirection,
        setEntry,
        setStop,
        setExit,
        setPnl,
        setEntryDatetime,
        setExitDatetime,
        onSave,
    }: {
        setSymbol:
        (value: string) => void;

        setDirection:
        (value: string) => void;

        setEntry:
        (value: string) => void;

        setStop:
        (value: string) => void;

        setExit:
        (value: string) => void;

        setPnl:
        (value: string) => void;

        setEntryDatetime:
        (value: string) => void;

        setExitDatetime:
        (value: string) => void;

        onSave:
        () => void;
    }) => {
        formActions.fillValidTrade =
            () => {
                const fields: Array<
                    [
                        (value: string) => void,
                        string,
                    ]
                > = [
                        [
                            setSymbol,
                            "GBPUSD",
                        ],
                        [
                            setDirection,
                            "short",
                        ],
                        [
                            setEntry,
                            "1.25",
                        ],
                        [
                            setStop,
                            "1.26",
                        ],
                        [
                            setExit,
                            "1.20",
                        ],
                        [
                            setPnl,
                            "300",
                        ],
                        [
                            setEntryDatetime,
                            "2026-08-17T10:00",
                        ],
                        [
                            setExitDatetime,
                            "2026-08-17T11:00",
                        ],
                    ];

                fields.forEach(
                    ([
                        setter,
                        value,
                    ]) => {
                        setter(value);
                    }
                );
            };

        formActions.clearDates =
            () => {
                setEntryDatetime("");
                setExitDatetime("");
            };

        formActions.reverseDates =
            () => {
                setEntryDatetime(
                    "2026-08-17T11:00"
                );
                setExitDatetime(
                    "2026-08-17T10:00"
                );
            };

        formActions.save =
            onSave;

        return (
            <div data-testid="trade-form">
                Trade form
            </div>
        );
    },
}));


vi.mock(
    "../components/StatisticsCards",
    () => ({
        default: ({
            trades,
            startingBalance,
            currency,
        }: {
            trades: Trade[];
            startingBalance: number;
            currency: string;
        }) => (
            <div data-testid="stats">
                {trades.length}
                {"-"}
                {startingBalance}
                {"-"}
                {currency}
            </div>
        ),
    })
);


vi.mock(
    "../components/PerformanceChart",
    () => ({
        default: ({
            trades,
            currency,
        }: {
            trades: Trade[];
            currency: string;
        }) => (
            <div data-testid="chart">
                {trades.length}
                {"-"}
                {currency}
            </div>
        ),
    })
);


vi.mock("../components/TradesTable", () => ({
    default: ({
        trades,
        editingTradeId,
        selectedAccountId,
        onEdit,
        onUpdate,
        onDelete,
    }: {
        trades: Trade[];

        editingTradeId:
        | number
        | null;

        selectedAccountId?:
        | number
        | null;

        onEdit:
        (trade: Trade) => void;

        onUpdate:
        (id: number) => void;

        onDelete:
        (id: number) => void;
    }) => {
        tableActions.edit =
            onEdit;

        tableActions.update =
            onUpdate;

        tableActions.delete =
            onDelete;

        return (
            <div>
                <span data-testid="trade-count">
                    {trades.length}
                </span>

                <span data-testid="account-id">
                    {selectedAccountId ??
                        "none"}
                </span>

                {trades.map(
                    (trade) => (
                        <span
                            key={
                                trade[0]
                            }
                        >
                            {
                                trade[1]
                            }
                        </span>
                    )
                )}

                {editingTradeId !==
                    null && (
                        <span>
                            editing
                        </span>
                    )}
            </div>
        );
    },
}));


const session = {
    access_token:
        "fake-token",

    user: {
        email:
            "test@example.com",
    },
};


const account1: Account = {
    id: 7,
    user_id: "user-1",
    name: "FTMO",
    starting_balance:
        100000,
    currency: "USD",
    broker: null,
    account_type: null,
};


const account2: Account = {
    ...account1,
    id: 8,
    name: "Personal",
    starting_balance:
        20000,
    currency: "EUR",
};


function makeTrade(
    id = 1,
    symbol = "EURUSD"
): Trade {
    return [
        id,
        symbol,
        "long",
        1.15,
        1.14,
        1.17,
        2,
        250,
        "2026-08-17T10:00",
        "2026-08-17T11:00",
    ];
}


function apiResponse<T>(
    data: T,
    ok = true
) {
    return {
        ok,

        json:
            async () =>
                data,
    } as Response;
}


let fetchMock:
    ReturnType<
        typeof vi.fn
    >;


function queueDashboard(
    accounts:
        Account[] = [
            account1,
        ],

    trades:
        Trade[] = [
            makeTrade(),
        ]
) {
    fetchMock
        .mockResolvedValueOnce(
            apiResponse(
                accounts
            )
        );

    if (
        accounts.length >
        0
    ) {
        fetchMock
            .mockResolvedValueOnce(
                apiResponse(
                    trades
                )
            );
    }
}


async function renderDashboard(
    accounts:
        Account[] = [
            account1,
        ],

    trades:
        Trade[] = [
            makeTrade(),
        ]
) {
    queueDashboard(
        accounts,
        trades
    );

    render(<Home />);

    await screen.findByRole(
        "heading",
        {
            name:
                "Dashboard",
        }
    );

    if (
        accounts.length >
        0
    ) {
        await waitFor(
            () => {
                expect(
                    screen.getByTestId(
                        "trade-count"
                    )
                ).toHaveTextContent(
                    String(
                        Math.min(
                            trades.length,
                            5
                        )
                    )
                );
            }
        );
    } else {
        await screen.findByText(
            "Create a trading account before adding trades."
        );
    }
}


async function openForm() {
    fireEvent.click(
        screen.getByRole(
            "button",
            {
                name:
                    "+ Add Trade",
            }
        )
    );

    await screen.findByTestId(
        "trade-form"
    );
}


async function fillValidTrade() {
    await act(
        async () => {
            formActions
                .fillValidTrade!();
        }
    );
}


async function saveTrade() {
    await act(
        async () => {
            await formActions
                .save!();
        }
    );
}


async function editTrade(
    value:
        Trade = makeTrade()
) {
    await act(
        async () => {
            tableActions.edit!(
                value
            );
        }
    );
}


async function updateTrade(
    id = 1
) {
    await act(
        async () => {
            await tableActions
                .update!(id);
        }
    );
}


async function deleteTrade(
    id = 1
) {
    await act(
        async () => {
            await tableActions
                .delete!(id);
        }
    );
}


describe(
    "dashboard page",
    () => {
        beforeEach(() => {
            fetchMock =
                vi.fn();

            /*
             * Important:
             * individual tests use mockResolvedValueOnce().
             * If React causes an additional fetch because an effect
             * reruns, this fallback prevents fetch() from returning
             * undefined and creating an unhandled rejection.
             */
            fetchMock
                .mockResolvedValue(
                    apiResponse([])
                );

            vi.stubGlobal(
                "fetch",
                fetchMock
            );

            [
                mockGetSession,
                mockSignOut,
                mockOnAuthStateChange,
                mockUnsubscribe,
                mockPush,
            ].forEach(
                (mock) => {
                    mock.mockReset();
                }
            );

            mockGetSession
                .mockResolvedValue({
                    data: {
                        session,
                    },
                });

            mockSignOut
                .mockResolvedValue(
                    undefined
                );

            mockOnAuthStateChange
                .mockReturnValue({
                    data: {
                        subscription: {
                            unsubscribe:
                                mockUnsubscribe,
                        },
                    },
                });

            authCallback.current =
                null;

            formActions.fillValidTrade =
                null;

            formActions.clearDates =
                null;

            formActions.reverseDates =
                null;

            formActions.save =
                null;

            tableActions.edit =
                null;

            tableActions.update =
                null;

            tableActions.delete =
                null;
        });


        afterEach(() => {
            cleanup();

            vi.restoreAllMocks();

            vi.unstubAllGlobals();
        });


        test(
            "loads user, accounts and trades",
            async () => {
                await renderDashboard();

                expect(
                    screen.getByTestId(
                        "email"
                    )
                ).toHaveTextContent(
                    "test@example.com"
                );

                expect(
                    screen.getByTestId(
                        "stats"
                    )
                ).toHaveTextContent(
                    "1-100000-USD"
                );

                expect(
                    screen.getByTestId(
                        "chart"
                    )
                ).toHaveTextContent(
                    "1-USD"
                );

                expect(
                    fetchMock
                ).toHaveBeenCalledWith(
                    "http://127.0.0.1:8000/accounts",
                    expect.anything()
                );

                expect(
                    fetchMock
                ).toHaveBeenCalledWith(
                    "http://127.0.0.1:8000/trades?account_id=7",
                    expect.anything()
                );
            }
        );


        test(
            "redirects when initial session is missing",
            async () => {
                mockGetSession
                    .mockResolvedValueOnce({
                        data: {
                            session:
                                null,
                        },
                    });

                render(<Home />);

                await waitFor(
                    () => {
                        expect(
                            mockPush
                        ).toHaveBeenCalledWith(
                            "/login"
                        );
                    }
                );
            }
        );


        test(
            "uses null email when initial session has no email",
            async () => {
                mockGetSession
                    .mockResolvedValue({
                        data: {
                            session: {
                                ...session,
                                user: {},
                            },
                        },
                    });

                await renderDashboard();

                expect(
                    screen.getByTestId(
                        "email"
                    )
                ).toHaveTextContent(
                    "no-email"
                );
            }
        );


        test.each([
            {
                authSession: {
                    ...session,

                    user: {
                        email:
                            "new@example.com",
                    },
                },
            },

            {
                authSession: {
                    ...session,
                    user: {},
                },
            },
        ])(
            "handles authenticated auth state change",
            async ({
                authSession,
            }) => {
                await renderDashboard();

                expect(
                    authCallback.current
                ).not.toBeNull();

                await act(
                    async () => {
                        authCallback.current!(
                            "SIGNED_IN",
                            authSession
                        );
                    }
                );

                /*
                 * We test the page orchestration here,
                 * not Sidebar rendering. The important branch
                 * is that a valid session does NOT redirect.
                 */
                expect(
                    mockPush
                ).not.toHaveBeenCalledWith(
                    "/login"
                );
            }
        );


        test(
            "redirects when auth state loses session",
            async () => {
                await renderDashboard();

                expect(
                    authCallback.current
                ).not.toBeNull();

                await act(
                    async () => {
                        authCallback.current!(
                            "SIGNED_OUT",
                            null
                        );
                    }
                );

                expect(
                    mockPush
                ).toHaveBeenCalledWith(
                    "/login"
                );
            }
        );


        test(
            "unsubscribes auth listener",
            async () => {
                queueDashboard();

                const {
                    unmount,
                } = render(
                    <Home />
                );

                await waitFor(
                    () => {
                        expect(
                            authCallback.current
                        ).not.toBeNull();
                    }
                );

                unmount();

                expect(
                    mockUnsubscribe
                ).toHaveBeenCalled();
            }
        );


        test(
            "handles empty accounts",
            async () => {
                await renderDashboard(
                    [],
                    []
                );

                expect(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "+ Add Trade",
                        }
                    )
                ).toBeDisabled();

                expect(
                    screen.getByTestId(
                        "stats"
                    )
                ).toHaveTextContent(
                    "0-0-"
                );
            }
        );


        test.each([
            "accounts",
            "trades",
        ])(
            "handles failed %s request",
            async (
                request
            ) => {
                if (
                    request ===
                    "accounts"
                ) {
                    fetchMock
                        .mockResolvedValueOnce(
                            apiResponse(
                                [],
                                false
                            )
                        );
                } else {
                    fetchMock
                        .mockResolvedValueOnce(
                            apiResponse([
                                account1,
                            ])
                        )
                        .mockResolvedValueOnce(
                            apiResponse(
                                [],
                                false
                            )
                        );
                }

                render(
                    <Home />
                );

                await screen.findByRole(
                    "heading",
                    {
                        name:
                            "Dashboard",
                    }
                );

                await waitFor(
                    () => {
                        expect(
                            fetchMock
                        ).toHaveBeenCalledTimes(
                            request ===
                                "accounts"
                                ? 1
                                : 2
                        );
                    }
                );

                expect(
                    screen.getByTestId(
                        "trade-count"
                    )
                ).toHaveTextContent(
                    "0"
                );
            }
        );


        test(
            "changes selected account",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        apiResponse([
                            account1,
                            account2,
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse([
                            makeTrade(),
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse([
                            makeTrade(
                                2,
                                "GBPUSD"
                            ),
                        ])
                    );

                render(
                    <Home />
                );

                await screen.findByText(
                    "EURUSD"
                );

                fireEvent.change(
                    screen.getByRole(
                        "combobox"
                    ),
                    {
                        target: {
                            value:
                                "8",
                        },
                    }
                );

                expect(
                    await screen.findByText(
                        "GBPUSD"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.getByTestId(
                        "stats"
                    )
                ).toHaveTextContent(
                    "1-20000-EUR"
                );
            }
        );


        test(
            "keeps selected account when session refreshes",
            async () => {
                fetchMock.mockImplementation(
                    async (input) => {
                        const url =
                            String(input);

                        if (
                            url.endsWith(
                                "/accounts"
                            )
                        ) {
                            return apiResponse([
                                account1,
                                account2,
                            ]);
                        }

                        if (
                            url.includes(
                                "account_id=8"
                            )
                        ) {
                            return apiResponse([
                                makeTrade(
                                    2,
                                    "GBPUSD"
                                ),
                            ]);
                        }

                        return apiResponse([
                            makeTrade(),
                        ]);
                    }
                );

                render(
                    <Home />
                );

                await screen.findByText(
                    "EURUSD"
                );

                fireEvent.change(
                    screen.getByRole(
                        "combobox"
                    ),
                    {
                        target: {
                            value:
                                "8",
                        },
                    }
                );

                await screen.findByText(
                    "GBPUSD"
                );

                await act(
                    async () => {
                        authCallback.current!(
                            "TOKEN_REFRESHED",
                            {
                                ...session,
                                access_token:
                                    "refreshed-token",
                            }
                        );
                    }
                );

                await waitFor(
                    () => {
                        expect(
                            screen.getByRole(
                                "combobox"
                            )
                        ).toHaveValue(
                            "8"
                        );
                    }
                );
            }
        );


        test(
            "opens and closes trade form",
            async () => {
                await renderDashboard();

                await openForm();

                expect(
                    screen.getByTestId(
                        "trade-form"
                    )
                ).toBeInTheDocument();

                fireEvent.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "+ Add Trade",
                        }
                    )
                );

                expect(
                    screen.queryByTestId(
                        "trade-form"
                    )
                ).not.toBeInTheDocument();
            }
        );


        test(
            "creates trade",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        apiResponse([
                            account1,
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse([])
                    )
                    .mockResolvedValueOnce(
                        apiResponse({})
                    )
                    .mockResolvedValueOnce(
                        apiResponse([
                            makeTrade(
                                1,
                                "GBPUSD"
                            ),
                        ])
                    );

                render(
                    <Home />
                );

                await screen.findByRole(
                    "heading",
                    {
                        name:
                            "Dashboard",
                    }
                );

                await waitFor(
                    () => {
                        expect(
                            fetchMock
                        ).toHaveBeenCalledTimes(
                            2
                        );
                    }
                );

                await openForm();

                await fillValidTrade();

                await saveTrade();

                expect(
                    fetchMock
                ).toHaveBeenCalledWith(
                    "http://127.0.0.1:8000/trades",
                    expect.objectContaining({
                        method:
                            "POST",
                    })
                );

                await waitFor(
                    () => {
                        expect(
                            screen.queryByTestId(
                                "trade-form"
                            )
                        ).not.toBeInTheDocument();
                    }
                );
            }
        );


        test(
            "does not create trade without dates",
            async () => {
                await renderDashboard();

                await openForm();

                await act(
                    async () => {
                        formActions
                            .clearDates!();
                    }
                );

                await saveTrade();

                expect(
                    fetchMock
                ).toHaveBeenCalledTimes(
                    2
                );

                expect(
                    screen.getByText(
                        "Please fill in all required fields."
                    )
                ).toBeInTheDocument();
            }
        );

        test(
            "does not create trade when exit date is before entry date",
            async () => {
                await renderDashboard();

                await openForm();

                await fillValidTrade();

                await act(
                    async () => {
                        formActions
                            .reverseDates!();
                    }
                );

                await saveTrade();

                expect(
                    fetchMock
                ).toHaveBeenCalledTimes(
                    2
                );

                expect(
                    screen.getByText(
                        "Exit date cannot be before entry date."
                    )
                ).toBeInTheDocument();

                fireEvent.click(
                    screen.getByRole(
                        "button",
                        {
                            name: "OK",
                        }
                    )
                );

                expect(
                    screen.queryByText(
                        "Exit date cannot be before entry date."
                    )
                ).not.toBeInTheDocument();
            }
        );


        test(
            "redirects when create session disappears",
            async () => {
                await renderDashboard();

                await openForm();

                await fillValidTrade();

                mockGetSession
                    .mockResolvedValueOnce({
                        data: {
                            session:
                                null,
                        },
                    });

                await saveTrade();

                expect(
                    mockPush
                ).toHaveBeenCalledWith(
                    "/login"
                );
            }
        );


        test(
            "keeps form open when create fails",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        apiResponse([
                            account1,
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse([])
                    )
                    .mockResolvedValueOnce(
                        apiResponse(
                            {},
                            false
                        )
                    );

                render(
                    <Home />
                );

                await waitFor(
                    () => {
                        expect(
                            fetchMock
                        ).toHaveBeenCalledTimes(
                            2
                        );
                    }
                );

                await openForm();

                await fillValidTrade();

                await saveTrade();

                expect(
                    screen.getByTestId(
                        "trade-form"
                    )
                ).toBeInTheDocument();
            }
        );


        test(
            "edits and updates trade",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        apiResponse([
                            account1,
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse([
                            makeTrade(),
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse({})
                    )
                    .mockResolvedValueOnce(
                        apiResponse([
                            makeTrade(),
                        ])
                    );

                render(
                    <Home />
                );

                await screen.findByText(
                    "EURUSD"
                );

                await editTrade();

                expect(
                    screen.getByText(
                        "editing"
                    )
                ).toBeInTheDocument();

                await updateTrade();

                expect(
                    fetchMock
                ).toHaveBeenCalledWith(
                    "http://127.0.0.1:8000/trades/1",
                    expect.objectContaining({
                        method:
                            "PATCH",
                    })
                );
            }
        );


        test(
            "does not update without dates",
            async () => {
                const invalidTrade:
                    Trade = [
                        1,
                        "EURUSD",
                        "long",
                        1,
                        1,
                        1,
                        1,
                        1,
                        "",
                        "",
                    ];

                await renderDashboard(
                    [
                        account1,
                    ],
                    [
                        invalidTrade,
                    ]
                );

                await editTrade(
                    invalidTrade
                );

                await updateTrade();

                expect(
                    fetchMock
                ).toHaveBeenCalledTimes(
                    2
                );
            }
        );


        test(
            "redirects when update session disappears",
            async () => {
                await renderDashboard();

                await editTrade();

                mockGetSession
                    .mockResolvedValueOnce({
                        data: {
                            session:
                                null,
                        },
                    });

                await updateTrade();

                expect(
                    mockPush
                ).toHaveBeenCalledWith(
                    "/login"
                );
            }
        );


        test(
            "handles failed update",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        apiResponse([
                            account1,
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse([
                            makeTrade(),
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse(
                            {},
                            false
                        )
                    );

                render(
                    <Home />
                );

                await screen.findByText(
                    "EURUSD"
                );

                await editTrade();

                await updateTrade();

                expect(
                    fetchMock
                ).toHaveBeenCalledTimes(
                    3
                );
            }
        );

        test(
            "deletes trade",
            async () => {
                vi.spyOn(
                    window,
                    "confirm"
                ).mockReturnValue(
                    true
                );

                fetchMock
                    .mockResolvedValueOnce(
                        apiResponse([
                            account1,
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse([
                            makeTrade(),
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse({})
                    );

                render(
                    <Home />
                );

                await screen.findByText(
                    "EURUSD"
                );

                await deleteTrade();

                expect(
                    fetchMock
                ).toHaveBeenCalledWith(
                    "http://127.0.0.1:8000/trades/1",
                    expect.objectContaining({
                        method:
                            "DELETE",
                    })
                );

                await waitFor(
                    () => {
                        expect(
                            screen.queryByText(
                                "EURUSD"
                            )
                        ).not.toBeInTheDocument();
                    }
                );
            }
        );


        test(
            "redirects when delete session disappears",
            async () => {
                vi.spyOn(
                    window,
                    "confirm"
                ).mockReturnValue(
                    true
                );

                await renderDashboard();

                mockGetSession
                    .mockResolvedValueOnce({
                        data: {
                            session:
                                null,
                        },
                    });

                await deleteTrade();

                expect(
                    mockPush
                ).toHaveBeenCalledWith(
                    "/login"
                );
            }
        );


        test(
            "handles failed delete",
            async () => {
                vi.spyOn(
                    window,
                    "confirm"
                ).mockReturnValue(
                    true
                );

                fetchMock
                    .mockResolvedValueOnce(
                        apiResponse([
                            account1,
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse([
                            makeTrade(),
                        ])
                    )
                    .mockResolvedValueOnce(
                        apiResponse(
                            {},
                            false
                        )
                    );

                render(
                    <Home />
                );

                await screen.findByText(
                    "EURUSD"
                );

                await deleteTrade();

                expect(
                    screen.getByText(
                        "EURUSD"
                    )
                ).toBeInTheDocument();
            }
        );


        test(
            "logs out",
            async () => {
                await renderDashboard();

                fireEvent.click(
                    screen.getByRole(
                        "button",
                        {
                            name:
                                "Logout",
                        }
                    )
                );

                await waitFor(
                    () => {
                        expect(
                            mockSignOut
                        ).toHaveBeenCalled();

                        expect(
                            mockPush
                        ).toHaveBeenCalledWith(
                            "/login"
                        );
                    }
                );
            }
        );
    }
);