import {
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

import AccountsPage from "./page";

const {
    mockGetSession,
    mockSignOut,
    mockOnAuthStateChange,
    mockPush,
    mockRouter,
    mockUnsubscribe,
} = vi.hoisted(() => {
    const mockPush = vi.fn();
    const mockUnsubscribe = vi.fn();

    return {
        mockGetSession: vi.fn(),
        mockSignOut: vi.fn(),
        mockOnAuthStateChange: vi.fn(),
        mockPush,
        mockUnsubscribe,
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
            onAuthStateChange: mockOnAuthStateChange,
        },
    },
}));

vi.mock("next/navigation", () => ({
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
            <span>Sidebar email: {userEmail ?? "none"}</span>

            <button type="button" onClick={onLogout}>
                Fake logout
            </button>
        </div>
    ),
}));

vi.mock("./AccountForm", () => ({
    default: ({
        name,
        startingBalance,
        currency,
        broker,
        accountType,
        setName,
        setStartingBalance,
        setCurrency,
        setBroker,
        setAccountType,
        onSave,
    }: {
        name: string;
        startingBalance: string;
        currency: string;
        broker: string;
        accountType: string;
        setName: (value: string) => void;
        setStartingBalance: (value: string) => void;
        setCurrency: (value: string) => void;
        setBroker: (value: string) => void;
        setAccountType: (value: string) => void;
        onSave: () => void;
    }) => (
        <div>
            <div>Fake account form</div>

            <input
                aria-label="New account name"
                value={name}
                onChange={(event) => setName(event.target.value)}
            />

            <input
                aria-label="New starting balance"
                value={startingBalance}
                onChange={(event) =>
                    setStartingBalance(event.target.value)
                }
            />

            <select
                aria-label="New currency"
                value={currency}
                onChange={(event) =>
                    setCurrency(event.target.value)
                }
            >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
            </select>

            <input
                aria-label="New broker"
                value={broker}
                onChange={(event) => setBroker(event.target.value)}
            />

            <input
                aria-label="New account type"
                value={accountType}
                onChange={(event) =>
                    setAccountType(event.target.value)
                }
            />

            <button type="button" onClick={onSave}>
                Fake save account
            </button>
        </div>
    ),
}));

const fakeSession = {
    access_token: "fake-token",
    user: {
        email: "test@example.com",
    },
};

const fakeAccount = {
    id: 7,
    user_id: "test-user",
    name: "FTMO 100K",
    starting_balance: 100000,
    currency: "USD",
    broker: "FTMO",
    account_type: "Prop Firm",
};

function successfulResponse(data: unknown) {
    return {
        ok: true,
        json: async () => data,
    } as Response;
}

function failedResponse(status = 500) {
    return {
        ok: false,
        status,
        json: async () => ({}),
    } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

async function renderWithAccounts(
    accounts: Array<typeof fakeAccount> = []
) {
    fetchMock.mockResolvedValue(successfulResponse(accounts));

    render(<AccountsPage />);

    if (accounts.length === 0) {
        await screen.findByText("No accounts yet.");
        return;
    }

    await screen.findByText(accounts[0].name);
}

function openAddAccountForm() {
    fireEvent.click(
        screen.getByRole("button", {
            name: "+ Add account",
        })
    );
}

function fillNewAccountForm({
    name = "New FTMO",
    balance = "200000",
    currency = "EUR",
    broker = "Broker X",
    type = "Funded",
} = {}) {
    fireEvent.change(
        screen.getByLabelText("New account name"),
        {
            target: { value: name },
        }
    );

    fireEvent.change(
        screen.getByLabelText("New starting balance"),
        {
            target: { value: balance },
        }
    );

    fireEvent.change(
        screen.getByLabelText("New currency"),
        {
            target: { value: currency },
        }
    );

    fireEvent.change(
        screen.getByLabelText("New broker"),
        {
            target: { value: broker },
        }
    );

    fireEvent.change(
        screen.getByLabelText("New account type"),
        {
            target: { value: type },
        }
    );
}

function saveNewAccount() {
    fireEvent.click(
        screen.getByRole("button", {
            name: "Fake save account",
        })
    );
}

function editAccount() {
    fireEvent.click(
        screen.getByRole("button", {
            name: "Edit account",
        })
    );
}

function openDeleteDialog() {
    fireEvent.click(
        screen.getByRole("button", {
            name: "Delete account",
        })
    );
}

function confirmDelete() {
    fireEvent.click(
        screen.getByRole("button", {
            name: "Delete permanently",
        })
    );
}

describe("AccountsPage", () => {
    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        mockGetSession.mockReset();
        mockSignOut.mockReset();
        mockOnAuthStateChange.mockReset();
        mockPush.mockReset();
        mockUnsubscribe.mockReset();

        mockGetSession.mockResolvedValue({
            data: {
                session: fakeSession,
            },
        });

        mockSignOut.mockResolvedValue({});

        mockOnAuthStateChange.mockReturnValue({
            data: {
                subscription: {
                    unsubscribe: mockUnsubscribe,
                },
            },
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe("loading accounts", () => {
        test("shows empty state when the user has no accounts", async () => {
            await renderWithAccounts();

            expect(
                screen.getByText("No accounts yet.")
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    "Sidebar email: test@example.com"
                )
            ).toBeInTheDocument();
        });

        test("shows the user's accounts", async () => {
            await renderWithAccounts([fakeAccount]);

            expect(
                screen.getByText("FTMO 100K")
            ).toBeInTheDocument();

            expect(
                screen.getByText("100000")
            ).toBeInTheDocument();

            expect(
                screen.getByText("FTMO")
            ).toBeInTheDocument();

            expect(
                screen.getByText("Prop Firm")
            ).toBeInTheDocument();
        });

        test(
            "shows fallback values when broker and account type are missing",
            async () => {
                fetchMock.mockResolvedValue(
                    successfulResponse([
                        {
                            ...fakeAccount,
                            broker: null,
                            account_type: null,
                        },
                    ])
                );

                render(<AccountsPage />);

                await screen.findByText("FTMO 100K");

                expect(
                    screen.getAllByText("—")
                ).toHaveLength(2);
            }
        );

        test("handles a failed accounts request", async () => {
            fetchMock.mockResolvedValue(
                failedResponse(500)
            );

            render(<AccountsPage />);

            expect(
                await screen.findByText(
                    "No accounts yet."
                )
            ).toBeInTheDocument();
        });
    });

    describe("authentication", () => {
        test(
            "redirects to login when there is no initial session",
            async () => {
                mockGetSession.mockResolvedValue({
                    data: {
                        session: null,
                    },
                });

                render(<AccountsPage />);

                await waitFor(() => {
                    expect(mockPush)
                        .toHaveBeenCalledWith("/login");
                });

                expect(fetchMock)
                    .not.toHaveBeenCalled();
            }
        );

        test(
            "redirects if the session disappears before loading accounts",
            async () => {
                mockGetSession
                    .mockResolvedValueOnce({
                        data: {
                            session: fakeSession,
                        },
                    })
                    .mockResolvedValueOnce({
                        data: {
                            session: null,
                        },
                    });

                render(<AccountsPage />);

                await waitFor(() => {
                    expect(mockPush)
                        .toHaveBeenCalledWith("/login");
                });

                expect(fetchMock)
                    .not.toHaveBeenCalled();
            }
        );

        test("logs the user out and redirects to login", async () => {
            await renderWithAccounts();

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Fake logout",
                })
            );

            await waitFor(() => {
                expect(mockSignOut)
                    .toHaveBeenCalledOnce();

                expect(mockPush)
                    .toHaveBeenCalledWith("/login");
            });
        });

        test(
            "redirects when auth state changes to logged out",
            async () => {
                let authCallback:
                    | ((
                        event: string,
                        session:
                            | typeof fakeSession
                            | null
                    ) => void)
                    | undefined;

                mockOnAuthStateChange.mockImplementation(
                    (callback) => {
                        authCallback = callback;

                        return {
                            data: {
                                subscription: {
                                    unsubscribe:
                                        mockUnsubscribe,
                                },
                            },
                        };
                    }
                );

                await renderWithAccounts();

                authCallback?.("SIGNED_OUT", null);

                await waitFor(() => {
                    expect(mockPush)
                        .toHaveBeenCalledWith("/login");
                });
            }
        );

        test(
            "updates the displayed email after an auth state change",
            async () => {
                let authCallback:
                    | ((
                        event: string,
                        session: {
                            access_token: string;
                            user: {
                                email?: string;
                            };
                        } | null
                    ) => void)
                    | undefined;

                mockOnAuthStateChange.mockImplementation(
                    (callback) => {
                        authCallback = callback;

                        return {
                            data: {
                                subscription: {
                                    unsubscribe:
                                        mockUnsubscribe,
                                },
                            },
                        };
                    }
                );

                await renderWithAccounts();

                authCallback?.(
                    "TOKEN_REFRESHED",
                    {
                        access_token: "new-token",
                        user: {
                            email: "new@example.com",
                        },
                    }
                );

                expect(
                    await screen.findByText(
                        "Sidebar email: new@example.com"
                    )
                ).toBeInTheDocument();
            }
        );

        test(
            "sets the displayed email to null after an auth change without email",
            async () => {
                let authCallback:
                    | ((
                        event: string,
                        session: {
                            access_token: string;
                            user: {
                                email?: string;
                            };
                        } | null
                    ) => void)
                    | undefined;

                mockOnAuthStateChange.mockImplementation(
                    (callback) => {
                        authCallback = callback;

                        return {
                            data: {
                                subscription: {
                                    unsubscribe:
                                        mockUnsubscribe,
                                },
                            },
                        };
                    }
                );

                await renderWithAccounts();

                authCallback?.(
                    "TOKEN_REFRESHED",
                    {
                        access_token: "new-token",
                        user: {},
                    }
                );

                expect(
                    await screen.findByText(
                        "Sidebar email: none"
                    )
                ).toBeInTheDocument();
            }
        );

        test("supports an initial session without an email", async () => {
            mockGetSession.mockResolvedValue({
                data: {
                    session: {
                        access_token: "fake-token",
                        user: {},
                    },
                },
            });

            fetchMock.mockResolvedValue(
                successfulResponse([])
            );

            render(<AccountsPage />);

            expect(
                await screen.findByText(
                    "Sidebar email: none"
                )
            ).toBeInTheDocument();
        });

        test(
            "unsubscribes from auth changes when the page unmounts",
            async () => {
                fetchMock.mockResolvedValue(
                    successfulResponse([])
                );

                const { unmount } =
                    render(<AccountsPage />);

                await screen.findByText(
                    "No accounts yet."
                );

                unmount();

                expect(mockUnsubscribe)
                    .toHaveBeenCalledOnce();
            }
        );
    });

    describe("creating accounts", () => {
        test("opens and closes the add account form", async () => {
            await renderWithAccounts();

            openAddAccountForm();

            expect(
                screen.getByText("Fake account form")
            ).toBeInTheDocument();

            fireEvent.change(
                screen.getByLabelText(
                    "New account name"
                ),
                {
                    target: {
                        value: "Temporary",
                    },
                }
            );

            openAddAccountForm();

            expect(
                screen.queryByText("Fake account form")
            ).not.toBeInTheDocument();

            openAddAccountForm();

            expect(
                screen.getByLabelText(
                    "New account name"
                )
            ).toHaveValue("");
        });

        test(
            "creates a new account and reloads the account list",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        successfulResponse([])
                    )
                    .mockResolvedValueOnce(
                        successfulResponse({
                            id: 8,
                        })
                    )
                    .mockResolvedValueOnce(
                        successfulResponse([
                            {
                                ...fakeAccount,
                                id: 8,
                                name: "New FTMO",
                                starting_balance:
                                    200000,
                                currency: "EUR",
                                broker: "Broker X",
                                account_type:
                                    "Funded",
                            },
                        ])
                    );

                render(<AccountsPage />);

                await screen.findByText(
                    "No accounts yet."
                );

                openAddAccountForm();
                fillNewAccountForm();
                saveNewAccount();

                await waitFor(() => {
                    expect(fetchMock)
                        .toHaveBeenCalledTimes(3);
                });

                expect(fetchMock)
                    .toHaveBeenNthCalledWith(
                        2,
                        "http://127.0.0.1:8000/accounts",
                        expect.objectContaining({
                            method: "POST",
                            body: JSON.stringify({
                                name: "New FTMO",
                                starting_balance:
                                    200000,
                                currency: "EUR",
                                broker: "Broker X",
                                account_type:
                                    "Funded",
                            }),
                        })
                    );

                expect(
                    await screen.findByText(
                        "New FTMO"
                    )
                ).toBeInTheDocument();

                expect(
                    screen.queryByText(
                        "Fake account form"
                    )
                ).not.toBeInTheDocument();
            }
        );

        test(
            "sends null for optional fields when creating an account",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        successfulResponse([])
                    )
                    .mockResolvedValueOnce(
                        successfulResponse({
                            id: 8,
                        })
                    )
                    .mockResolvedValueOnce(
                        successfulResponse([])
                    );

                render(<AccountsPage />);

                await screen.findByText(
                    "No accounts yet."
                );

                openAddAccountForm();

                fillNewAccountForm({
                    name: "Simple",
                    balance: "50000",
                    currency: "USD",
                    broker: "",
                    type: "",
                });

                saveNewAccount();

                await waitFor(() => {
                    expect(fetchMock)
                        .toHaveBeenCalledTimes(3);
                });

                expect(fetchMock)
                    .toHaveBeenNthCalledWith(
                        2,
                        "http://127.0.0.1:8000/accounts",
                        expect.objectContaining({
                            body: JSON.stringify({
                                name: "Simple",
                                starting_balance:
                                    50000,
                                currency: "USD",
                                broker: null,
                                account_type: null,
                            }),
                        })
                    );
            }
        );

        test(
            "keeps the form open when creating an account fails",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        successfulResponse([])
                    )
                    .mockResolvedValueOnce(
                        failedResponse()
                    );

                render(<AccountsPage />);

                await screen.findByText(
                    "No accounts yet."
                );

                openAddAccountForm();
                saveNewAccount();

                await waitFor(() => {
                    expect(fetchMock)
                        .toHaveBeenCalledTimes(2);
                });

                expect(
                    screen.getByText(
                        "Fake account form"
                    )
                ).toBeInTheDocument();
            }
        );

        test(
            "redirects when the session disappears before saving",
            async () => {
                mockGetSession
                    .mockResolvedValueOnce({
                        data: {
                            session: fakeSession,
                        },
                    })
                    .mockResolvedValueOnce({
                        data: {
                            session: fakeSession,
                        },
                    })
                    .mockResolvedValueOnce({
                        data: {
                            session: null,
                        },
                    });

                fetchMock.mockResolvedValue(
                    successfulResponse([])
                );

                render(<AccountsPage />);

                await screen.findByText(
                    "No accounts yet."
                );

                openAddAccountForm();
                saveNewAccount();

                await waitFor(() => {
                    expect(mockPush)
                        .toHaveBeenCalledWith("/login");
                });

                expect(fetchMock)
                    .toHaveBeenCalledTimes(1);
            }
        );
    });

    describe("editing accounts", () => {
        test("edits an existing account", async () => {
            fetchMock
                .mockResolvedValueOnce(
                    successfulResponse([
                        fakeAccount,
                    ])
                )
                .mockResolvedValueOnce(
                    successfulResponse({
                        id: 7,
                    })
                )
                .mockResolvedValueOnce(
                    successfulResponse([
                        {
                            ...fakeAccount,
                            name: "Updated account",
                            starting_balance:
                                120000,
                            currency: "GBP",
                            broker:
                                "Updated broker",
                            account_type:
                                "Personal",
                        },
                    ])
                );

            render(<AccountsPage />);

            await screen.findByText("FTMO 100K");

            editAccount();

            const textInputs =
                screen.getAllByRole("textbox");

            fireEvent.change(textInputs[0], {
                target: {
                    value: "Updated account",
                },
            });

            fireEvent.change(
                screen.getByRole("spinbutton"),
                {
                    target: {
                        value: "120000",
                    },
                }
            );

            fireEvent.change(
                screen.getByRole("combobox"),
                {
                    target: {
                        value: "GBP",
                    },
                }
            );

            fireEvent.change(textInputs[1], {
                target: {
                    value: "Updated broker",
                },
            });

            fireEvent.change(textInputs[2], {
                target: {
                    value: "Personal",
                },
            });

            fireEvent.click(
                screen.getByRole("button", {
                    name: "Save account",
                })
            );

            await waitFor(() => {
                expect(fetchMock)
                    .toHaveBeenCalledTimes(3);
            });

            expect(fetchMock)
                .toHaveBeenNthCalledWith(
                    2,
                    "http://127.0.0.1:8000/accounts/7",
                    expect.objectContaining({
                        method: "PATCH",
                        body: JSON.stringify({
                            name: "Updated account",
                            starting_balance:
                                120000,
                            currency: "GBP",
                            broker:
                                "Updated broker",
                            account_type:
                                "Personal",
                        }),
                    })
                );

            expect(
                await screen.findByText(
                    "Updated account"
                )
            ).toBeInTheDocument();
        });

        test(
            "uses empty editable fields for null broker and type",
            async () => {
                fetchMock.mockResolvedValue(
                    successfulResponse([
                        {
                            ...fakeAccount,
                            broker: null,
                            account_type: null,
                        },
                    ])
                );

                render(<AccountsPage />);

                await screen.findByText("FTMO 100K");

                editAccount();

                const textInputs =
                    screen.getAllByRole("textbox");

                expect(textInputs[1])
                    .toHaveValue("");

                expect(textInputs[2])
                    .toHaveValue("");
            }
        );

        test(
            "does not finish editing when update fails",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        successfulResponse([
                            fakeAccount,
                        ])
                    )
                    .mockResolvedValueOnce(
                        failedResponse()
                    );

                render(<AccountsPage />);

                await screen.findByText("FTMO 100K");

                editAccount();

                fireEvent.click(
                    screen.getByRole("button", {
                        name: "Save account",
                    })
                );

                await waitFor(() => {
                    expect(fetchMock)
                        .toHaveBeenCalledTimes(2);
                });

                expect(
                    screen.getByRole("button", {
                        name: "Save account",
                    })
                ).toBeInTheDocument();
            }
        );
    });

    describe("deleting accounts", () => {
        test(
            "opens and cancels the delete confirmation",
            async () => {
                await renderWithAccounts([
                    fakeAccount,
                ]);

                openDeleteDialog();

                expect(
                    screen.getByText(
                        "This action cannot be undone."
                    )
                ).toBeInTheDocument();

                fireEvent.click(
                    screen.getByRole("button", {
                        name: "Cancel",
                    })
                );

                expect(
                    screen.queryByText(
                        "This action cannot be undone."
                    )
                ).not.toBeInTheDocument();
            }
        );

        test(
            "deletes an account and reloads the list",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        successfulResponse([
                            fakeAccount,
                        ])
                    )
                    .mockResolvedValueOnce(
                        successfulResponse({})
                    )
                    .mockResolvedValueOnce(
                        successfulResponse([])
                    );

                render(<AccountsPage />);

                await screen.findByText("FTMO 100K");

                openDeleteDialog();
                confirmDelete();

                await waitFor(() => {
                    expect(fetchMock)
                        .toHaveBeenCalledTimes(3);
                });

                expect(fetchMock)
                    .toHaveBeenNthCalledWith(
                        2,
                        "http://127.0.0.1:8000/accounts/7",
                        expect.objectContaining({
                            method: "DELETE",
                        })
                    );

                expect(
                    await screen.findByText(
                        "No accounts yet."
                    )
                ).toBeInTheDocument();

                expect(
                    screen.queryByText(
                        "This action cannot be undone."
                    )
                ).not.toBeInTheDocument();
            }
        );

        test(
            "keeps delete confirmation open when delete fails",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        successfulResponse([
                            fakeAccount,
                        ])
                    )
                    .mockResolvedValueOnce(
                        failedResponse()
                    );

                render(<AccountsPage />);

                await screen.findByText("FTMO 100K");

                openDeleteDialog();
                confirmDelete();

                await waitFor(() => {
                    expect(fetchMock)
                        .toHaveBeenCalledTimes(2);
                });

                expect(
                    screen.getByText(
                        "This action cannot be undone."
                    )
                ).toBeInTheDocument();
            }
        );

        test(
            "redirects when session disappears before deleting",
            async () => {
                mockGetSession
                    .mockResolvedValueOnce({
                        data: {
                            session: fakeSession,
                        },
                    })
                    .mockResolvedValueOnce({
                        data: {
                            session: fakeSession,
                        },
                    })
                    .mockResolvedValueOnce({
                        data: {
                            session: null,
                        },
                    });

                fetchMock.mockResolvedValue(
                    successfulResponse([
                        fakeAccount,
                    ])
                );

                render(<AccountsPage />);

                await screen.findByText("FTMO 100K");

                openDeleteDialog();
                confirmDelete();

                await waitFor(() => {
                    expect(mockPush)
                        .toHaveBeenCalledWith("/login");
                });

                expect(fetchMock)
                    .toHaveBeenCalledTimes(1);
            }
        );

        test(
            "resets edit state when the account being edited is deleted",
            async () => {
                fetchMock
                    .mockResolvedValueOnce(
                        successfulResponse([
                            fakeAccount,
                        ])
                    )
                    .mockResolvedValueOnce(
                        successfulResponse({})
                    )
                    .mockResolvedValueOnce(
                        successfulResponse([])
                    );

                render(<AccountsPage />);

                await screen.findByText("FTMO 100K");

                openDeleteDialog();
                editAccount();

                expect(
                    screen.getByRole("button", {
                        name: "Save account",
                    })
                ).toBeInTheDocument();

                confirmDelete();

                expect(
                    await screen.findByText(
                        "No accounts yet."
                    )
                ).toBeInTheDocument();
            }
        );
    });
});