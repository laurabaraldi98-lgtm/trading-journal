import {
    render,
    screen,
    waitFor,
    fireEvent,
    cleanup,
} from "@testing-library/react";

import {
    describe,
    test,
    expect,
    vi,
    beforeEach,
    afterEach,
} from "vitest";

import TradesPage from "./page";


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

const {
    mockGetSession,
    mockSignOut,
    mockUseSearchParams,
    mockPush,
    mockRouter,
} = vi.hoisted(() => {
    const mockPush = vi.fn();

    return {
        mockGetSession: vi.fn(),
        mockSignOut: vi.fn(),
        mockUseSearchParams: vi.fn(),
        mockPush,
        mockRouter: {
            push: mockPush,
        },
    };
});


vi.mock("../../lib/supabase", () => ({
    supabase: {
        auth: {
            getSession: mockGetSession,
            signOut: mockSignOut,
        },
    },
}));

vi.mock("next/navigation", () => ({
    useSearchParams: mockUseSearchParams,
    useRouter: () => mockRouter,
}));


vi.mock("../../components/Sidebar", () => ({
    default: ({
        userEmail,
        onLogout,
    }: {
        userEmail: string | null;
        onLogout: () => void;
    }) => (
        <div>
            <span data-testid="user-email">
                {userEmail ?? "no-email"}
            </span>

            <button
                type="button"
                onClick={onLogout}
            >
                Fake logout
            </button>
        </div>
    ),
}));


vi.mock("../../components/TradesTable", () => ({
    default: ({
        trades,
        onEdit,
        onUpdate,
        onDelete,
        editingTradeId,
        symbol,
        direction,
        entry,
        stop,
        exit,
        entryDatetime,
        exitDatetime,
    }: {
        trades: Trade[];
        onEdit: (trade: Trade) => void;
        onUpdate: (tradeId: number) => void;
        onDelete: (tradeId: number) => void;
        editingTradeId: number | null;
        symbol: string;
        direction: string;
        entry: string;
        stop: string;
        exit: string;
        entryDatetime: string;
        exitDatetime: string;
    }) => (
        <div>
            <span data-testid="trade-count">
                {trades.length}
            </span>

            <div data-testid="edit-state">
                {symbol}
                {" | "}
                {direction}
                {" | "}
                {entry}
                {" | "}
                {stop}
                {" | "}
                {exit}
                {" | "}
                {entryDatetime}
                {" | "}
                {exitDatetime}
            </div>

            {trades.map((trade) => (
                <div key={trade[0]}>
                    <span>{trade[1]}</span>

                    <button
                        type="button"
                        onClick={() => onEdit(trade)}
                    >
                        Edit trade {trade[0]}
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(trade[0])}
                    >
                        Delete trade {trade[0]}
                    </button>
                </div>
            ))}

            {editingTradeId !== null && (
                <button
                    type="button"
                    onClick={() => onUpdate(editingTradeId)}
                >
                    Save trade
                </button>
            )}
        </div>
    ),
}));


const fakeSession = {
    access_token: "fake-token",
    user: {
        email: "test@example.com",
    },
};

const fakeAccounts = [
    {
        id: 7,
        user_id: "test-user",
        name: "FTMO 100K",
        starting_balance: 100000,
        currency: "USD",
        broker: "FTMO",
        account_type: "Prop Firm",
    },
];


let fetchMock: ReturnType<typeof vi.fn>;


function sessionResponse(
    session: {
        access_token: string;
        user: {
            email?: string;
        };
    } | null = fakeSession
) {
    return {
        data: {
            session,
        },
    };
}


function makeTrade({
    id = 1,
    symbol = "EURUSD",
    entryDatetime = "2026-08-12T10:00",
    exitDatetime = "2026-08-12T11:00",
}: {
    id?: number;
    symbol?: string;
    entryDatetime?: string;
    exitDatetime?: string;
} = {}): Trade {
    return [
        id,
        symbol,
        "long",
        1.15,
        1.14,
        1.17,
        2,
        250,
        entryDatetime,
        exitDatetime,
    ];
}


function makeTrades(amount: number): Trade[] {
    return Array.from(
        { length: amount },
        (_, index) =>
            makeTrade({
                id: index + 1,
                symbol: `TRADE-${index + 1}`,
            })
    );
}


function makeResponse({
    data = [],
    ok = true,
}: {
    data?: Trade[];
    ok?: boolean;
} = {}) {
    return {
        ok,
        json: async () => data,
    } as Response;
}


function makeAccountsResponse() {
    return {
        ok: true,
        json: async () => fakeAccounts,
    } as Response;
}


function mockLoadTrades(trades: Trade[]) {
    fetchMock.mockResolvedValue(
        makeResponse({
            data: trades,
        })
    );
}


async function renderLoadedPage(
    trades: Trade[]
) {
    mockLoadTrades(trades);

    render(<TradesPage />);

    await waitFor(() => {
        expect(
            screen.getByTestId("trade-count")
        ).toBeInTheDocument();
    });
}


describe("TradesPage", () => {
    beforeEach(() => {
        fetchMock = vi.fn();

        vi.stubGlobal(
            "fetch",
            fetchMock
        );

        mockGetSession.mockReset();
        mockSignOut.mockReset();
        mockUseSearchParams.mockReset();
        mockPush.mockReset();

        mockUseSearchParams.mockReturnValue(
            new URLSearchParams()
        );

        mockGetSession.mockResolvedValue(
            sessionResponse()
        );

        mockSignOut.mockResolvedValue(
            undefined
        );
    });


    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });


    test(
        "loads trades for the selected account",
        async () => {
            const accounts = [
                {
                    id: 7,
                    user_id: "test-user",
                    name: "FTMO 100K",
                    starting_balance: 100000,
                    currency: "USD",
                    broker: "FTMO",
                    account_type: "Prop Firm",
                },
            ];

            fetchMock
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () =>
                        accounts,
                } as Response)
                .mockResolvedValueOnce(
                    makeResponse({
                        data: [
                            makeTrade(),
                        ],
                    })
                );

            render(<TradesPage />);

            await waitFor(() => {
                expect(
                    fetchMock
                ).toHaveBeenCalledWith(
                    "http://127.0.0.1:8000/trades?account_id=7",
                    expect.objectContaining({
                        headers:
                            expect.objectContaining(
                                {
                                    Authorization:
                                        "Bearer fake-token",
                                }
                            ),
                    })
                );
            });
        }
    );


    test(
        "loads trades and paginates 20 at a time",
        async () => {
            await renderLoadedPage(
                makeTrades(21)
            );

            expect(
                screen.getByTestId(
                    "trade-count"
                )
            ).toHaveTextContent("20");

            expect(
                screen.getByText(
                    "TRADE-1"
                )
            ).toBeInTheDocument();

            expect(
                screen.queryByText(
                    "TRADE-21"
                )
            ).not.toBeInTheDocument();


            fireEvent.click(
                screen.getByRole(
                    "button",
                    { name: "2" }
                )
            );

            expect(
                screen.getByTestId(
                    "trade-count"
                )
            ).toHaveTextContent("1");

            expect(
                screen.getByText(
                    "TRADE-21"
                )
            ).toBeInTheDocument();


            fireEvent.click(
                screen.getByRole(
                    "button",
                    { name: "←" }
                )
            );

            expect(
                screen.getByText(
                    "TRADE-1"
                )
            ).toBeInTheDocument();


            fireEvent.click(
                screen.getByRole(
                    "button",
                    { name: "→" }
                )
            );

            expect(
                screen.getByText(
                    "TRADE-21"
                )
            ).toBeInTheDocument();
        }
    );


    test(
        "does not show pagination when there is only one page",
        async () => {
            await renderLoadedPage([
                makeTrade(),
            ]);

            expect(
                screen.queryByRole(
                    "button",
                    { name: "2" }
                )
            ).not.toBeInTheDocument();

            expect(
                screen.queryByRole(
                    "button",
                    { name: "→" }
                )
            ).not.toBeInTheDocument();
        }
    );


    test(
        "uses null email when session has no email",
        async () => {
            mockGetSession.mockResolvedValue(
                sessionResponse({
                    access_token:
                        "fake-token",
                    user: {},
                })
            );

            await renderLoadedPage([
                makeTrade(),
            ]);

            expect(
                screen.getByTestId(
                    "user-email"
                )
            ).toHaveTextContent(
                "no-email"
            );
        }
    );


    test(
        "loads edit state with dates",
        async () => {
            const trade =
                makeTrade();

            await renderLoadedPage([
                trade,
            ]);

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Edit trade 1",
                    }
                )
            );

            expect(
                screen.getByTestId(
                    "edit-state"
                )
            ).toHaveTextContent(
                "EURUSD | long | 1.15 | 1.14 | 1.17 | 2026-08-12T10:00 | 2026-08-12T11:00"
            );
        }
    );


    test(
        "updates a trade and reloads after success",
        async () => {
            const trade =
                makeTrade();

            fetchMock
                .mockResolvedValueOnce(
                    makeAccountsResponse()
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        data: [
                            trade,
                        ],
                    })
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        ok: true,
                    })
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        data: [
                            trade,
                        ],
                    })
                );

            render(<TradesPage />);

            await screen.findByText(
                "EURUSD"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Edit trade 1",
                    }
                )
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Save trade",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    fetchMock
                ).toHaveBeenCalledWith(
                    "http://127.0.0.1:8000/trades/1",
                    expect.objectContaining(
                        {
                            method:
                                "PATCH",
                        }
                    )
                );
            });

            expect(
                fetchMock
            ).toHaveBeenCalledTimes(4);
        }
    );


    test(
        "does not reload when update fails",
        async () => {
            const trade =
                makeTrade();

            fetchMock
                .mockResolvedValueOnce(
                    makeAccountsResponse()
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        data: [
                            trade,
                        ],
                    })
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        ok: false,
                    })
                );

            render(<TradesPage />);

            await screen.findByText(
                "EURUSD"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Edit trade 1",
                    }
                )
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Save trade",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    fetchMock
                ).toHaveBeenCalledTimes(
                    3
                );
            });
        }
    );


    test(
        "stops update when session is missing",
        async () => {
            const trade =
                makeTrade();

            mockGetSession
                .mockResolvedValueOnce(
                    sessionResponse()
                )
                .mockResolvedValueOnce(
                    sessionResponse()
                )
                .mockResolvedValueOnce(
                    sessionResponse(
                        null
                    )
                );

            mockLoadTrades([
                trade,
            ]);

            render(<TradesPage />);

            await screen.findByText(
                "EURUSD"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Edit trade 1",
                    }
                )
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Save trade",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    mockGetSession
                ).toHaveBeenCalledTimes(
                    3
                );
            });

            expect(
                fetchMock
            ).toHaveBeenCalledTimes(2);
        }
    );


    test(
        "deletes a trade and reloads after success",
        async () => {
            const trade =
                makeTrade();

            vi.spyOn(
                window,
                "confirm"
            ).mockReturnValue(true);

            fetchMock
                .mockResolvedValueOnce(
                    makeAccountsResponse()
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        data: [
                            trade,
                        ],
                    })
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        ok: true,
                    })
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        data: [],
                    })
                );

            render(<TradesPage />);

            await screen.findByText(
                "EURUSD"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Delete trade 1",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    fetchMock
                ).toHaveBeenCalledWith(
                    "http://127.0.0.1:8000/trades/1",
                    expect.objectContaining(
                        {
                            method:
                                "DELETE",
                        }
                    )
                );
            });

            expect(
                fetchMock
            ).toHaveBeenCalledTimes(4);
        }
    );


    test(
        "does not delete when confirmation is cancelled",
        async () => {
            vi.spyOn(
                window,
                "confirm"
            ).mockReturnValue(false);

            await renderLoadedPage([
                makeTrade(),
            ]);

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Delete trade 1",
                    }
                )
            );

            expect(
                fetchMock
            ).toHaveBeenCalledTimes(2);
        }
    );


    test(
        "does not reload when delete fails",
        async () => {
            vi.spyOn(
                window,
                "confirm"
            ).mockReturnValue(true);

            fetchMock
                .mockResolvedValueOnce(
                    makeAccountsResponse()
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        data: [
                            makeTrade(),
                        ],
                    })
                )
                .mockResolvedValueOnce(
                    makeResponse({
                        ok: false,
                    })
                );

            render(<TradesPage />);

            await screen.findByText(
                "EURUSD"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Delete trade 1",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    fetchMock
                ).toHaveBeenCalledTimes(
                    3
                );
            });
        }
    );


    test(
        "stops delete when session is missing",
        async () => {
            vi.spyOn(
                window,
                "confirm"
            ).mockReturnValue(true);

            mockGetSession
                .mockResolvedValueOnce(
                    sessionResponse()
                )
                .mockResolvedValueOnce(
                    sessionResponse()
                )
                .mockResolvedValueOnce(
                    sessionResponse(
                        null
                    )
                );

            mockLoadTrades([
                makeTrade(),
            ]);

            render(<TradesPage />);

            await screen.findByText(
                "EURUSD"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Delete trade 1",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    mockGetSession
                ).toHaveBeenCalledTimes(
                    3
                );
            });

            expect(
                fetchMock
            ).toHaveBeenCalledTimes(2);
        }
    );


    test(
        "does not load trades when session is missing",
        async () => {
            mockGetSession.mockResolvedValue(
                sessionResponse(null)
            );

            render(<TradesPage />);

            await waitFor(() => {
                expect(
                    mockGetSession
                ).toHaveBeenCalledTimes(
                    1
                );
            });

            expect(
                fetchMock
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "logs out",
        async () => {
            await renderLoadedPage([
                makeTrade(),
            ]);

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Fake logout",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    mockSignOut
                ).toHaveBeenCalledTimes(
                    1
                );
            });
        }
    );


    test(
        "shows the trades page when the user has no accounts",
        async () => {
            fetchMock.mockResolvedValueOnce(
                {
                    ok: true,
                    json: async () =>
                        [],
                } as Response
            );

            render(<TradesPage />);

            expect(
                await screen.findByRole(
                    "heading",
                    {
                        name:
                            "Trades",
                    }
                )
            ).toBeInTheDocument();

            expect(
                fetchMock
            ).toHaveBeenCalledTimes(1);
        }
    );


    test(
        "shows the trades page when loading accounts fails",
        async () => {
            fetchMock.mockResolvedValueOnce(
                {
                    ok: false,
                } as Response
            );

            render(<TradesPage />);

            expect(
                await screen.findByRole(
                    "heading",
                    {
                        name:
                            "Trades",
                    }
                )
            ).toBeInTheDocument();
        }
    );
});