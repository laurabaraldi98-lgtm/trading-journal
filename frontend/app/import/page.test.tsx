import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ImportPage from "./page";

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
        mockRouter: { push: mockPush },
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

const fakeSession = {
    access_token: "fake-token",
    user: { email: "test@example.com" },
};

const fakeAccounts = [
    { id: 7, name: "FTMO 100K" },
    { id: 8, name: "Second account" },
];

function response(data: unknown, ok = true) {
    return {
        ok,
        json: async () => data,
    } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

async function renderLoadedPage(accounts = fakeAccounts) {
    fetchMock.mockResolvedValueOnce(response(accounts));
    render(<ImportPage />);
    await screen.findByRole("heading", { name: "Import CSV" });
}

function selectCsvFile(name = "trades.csv") {
    const file = new File(["symbol,direction\nEURUSD,buy"], name, {
        type: "text/csv",
    });

    fireEvent.change(screen.getByLabelText("CSV file"), {
        target: { files: [file] },
    });

    return file;
}

function clickImport() {
    fireEvent.click(screen.getByRole("button", { name: "Import trades" }));
}

describe("ImportPage", () => {
    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        mockGetSession.mockReset();
        mockSignOut.mockReset();
        mockOnAuthStateChange.mockReset();
        mockPush.mockReset();
        mockUnsubscribe.mockReset();
        mockGetSession.mockResolvedValue({ data: { session: fakeSession } });
        mockSignOut.mockResolvedValue({});
        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test("loads accounts and displays the user email", async () => {
        await renderLoadedPage();

        expect(screen.getByLabelText("Account")).toHaveValue("7");
        expect(screen.getByText("FTMO 100K")).toBeInTheDocument();
        expect(
            screen.getByText("Sidebar email: test@example.com")
        ).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith(
            "http://127.0.0.1:8000/accounts",
            expect.objectContaining({
                cache: "no-store",
                headers: { Authorization: "Bearer fake-token" },
            })
        );
    });

    test("shows an error when accounts cannot be loaded", async () => {
        fetchMock.mockResolvedValueOnce(response({}, false));
        render(<ImportPage />);

        expect(
            await screen.findByText("Unable to load accounts.")
        ).toBeInTheDocument();
    });

    test("shows the empty account state", async () => {
        await renderLoadedPage([]);

        expect(screen.getByText("No accounts available")).toBeInTheDocument();
        expect(
            screen.getByText("Create an account before importing trades.")
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Import trades" })).toBeDisabled();
    });

    test("redirects when the initial session is missing", async () => {
        mockGetSession.mockResolvedValueOnce({ data: { session: null } });
        render(<ImportPage />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    test("updates the email after an auth change", async () => {
        let authCallback:
            | ((event: string, session: typeof fakeSession | null) => void)
            | undefined;

        mockOnAuthStateChange.mockImplementation((callback) => {
            authCallback = callback;
            return {
                data: { subscription: { unsubscribe: mockUnsubscribe } },
            };
        });

        await renderLoadedPage();
        authCallback?.("TOKEN_REFRESHED", {
            access_token: "new-token",
            user: { email: "new@example.com" },
        });

        expect(
            await screen.findByText("Sidebar email: new@example.com")
        ).toBeInTheDocument();
    });

    test("redirects when the auth session disappears", async () => {
        let authCallback:
            | ((event: string, session: typeof fakeSession | null) => void)
            | undefined;

        mockOnAuthStateChange.mockImplementation((callback) => {
            authCallback = callback;
            return {
                data: { subscription: { unsubscribe: mockUnsubscribe } },
            };
        });

        await renderLoadedPage();
        authCallback?.("SIGNED_OUT", null);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    test("unsubscribes from auth changes on unmount", async () => {
        fetchMock.mockResolvedValueOnce(response(fakeAccounts));
        const { unmount } = render(<ImportPage />);
        await screen.findByRole("heading", { name: "Import CSV" });

        unmount();
        expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });

    test("logs out and redirects to login", async () => {
        await renderLoadedPage();
        fireEvent.click(screen.getByRole("button", { name: "Fake logout" }));

        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalledOnce();
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    test("requires a CSV file", async () => {
        await renderLoadedPage();
        clickImport();

        expect(
            screen.getByText("Please select a CSV file.")
        ).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test.each([
        [1, "1 trade imported successfully."],
        [2, "2 trades imported successfully."],
    ])("imports %s trades", async (count, expectedMessage) => {
        fetchMock
            .mockResolvedValueOnce(response(fakeAccounts))
            .mockResolvedValueOnce(response({ imported_count: count }));
        render(<ImportPage />);
        await screen.findByRole("heading", { name: "Import CSV" });
        const file = selectCsvFile();
        clickImport();

        expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
        const [, options] = fetchMock.mock.calls[1];
        const body = options.body as FormData;

        expect(fetchMock.mock.calls[1][0]).toBe("http://127.0.0.1:8000/imports");
        expect(options).toMatchObject({
            method: "POST",
            headers: { Authorization: "Bearer fake-token" },
        });
        expect(body.get("file")).toBe(file);
        expect(body.get("account_id")).toBe("7");
        expect(screen.getByLabelText("CSV file")).toHaveValue("");
    });

    test("imports into the account selected by the user", async () => {
        fetchMock
            .mockResolvedValueOnce(response(fakeAccounts))
            .mockResolvedValueOnce(response({ imported_count: 1 }));
        render(<ImportPage />);
        await screen.findByRole("heading", { name: "Import CSV" });
        fireEvent.change(screen.getByLabelText("Account"), {
            target: { value: "8" },
        });
        selectCsvFile();
        clickImport();

        await screen.findByText("1 trade imported successfully.");
        const body = fetchMock.mock.calls[1][1].body as FormData;
        expect(body.get("account_id")).toBe("8");
    });

    test("redirects if the session is missing during import", async () => {
        mockGetSession
            .mockResolvedValueOnce({ data: { session: fakeSession } })
            .mockResolvedValueOnce({ data: { session: null } });
        await renderLoadedPage();
        selectCsvFile();
        clickImport();

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test.each([
        ["a string error", { detail: "CSV file is empty" }, "CSV file is empty"],
        ["missing columns", { detail: { message: "CSV columns could not be mapped automatically", missing_fields: ["pnl", "exit"], ambiguous_fields: {} } }, "CSV columns could not be mapped automatically: pnl, exit."],
        ["ambiguous columns", { detail: { message: "CSV columns could not be mapped automatically", missing_fields: [], ambiguous_fields: { entry: ["Entry", "Open Price"] } } }, "CSV columns could not be mapped automatically: entry."],
        ["multiple invalid rows", { detail: { message: "CSV contains invalid rows", errors: [{ row: 2, field: "direction", message: "Unsupported direction value: Hold" }, { row: 3, field: "pnl", message: "Invalid numeric value" }] } }, "Row 2, direction: Unsupported direction value: Hold (1 more errors)"],
        ["one invalid row", { detail: { errors: [{ row: 2, field: "direction", message: "Unsupported direction value: Hold" }] } }, "Row 2, direction: Unsupported direction value: Hold"],
        ["a custom object message", { detail: { message: "Custom import error" } }, "Custom import error"],
        ["the default missing-column message", { detail: { missing_fields: ["pnl"] } }, "Required columns are missing: pnl."],
        ["the default ambiguous-column message", { detail: { ambiguous_fields: { entry: ["Entry", "Open Price"] } } }, "Some columns are ambiguous: entry."],
        ["a missing detail", {}, "Unable to import this CSV file."],
        ["an empty detail object", { detail: {} }, "Unable to import this CSV file."],
    ])("shows %s returned by the backend", async (_name, data, expectedMessage) => {
        fetchMock.mockResolvedValueOnce(response(fakeAccounts)).mockResolvedValueOnce(response(data, false));
        render(<ImportPage />);
        await screen.findByRole("heading", { name: "Import CSV" });
        selectCsvFile();
        clickImport();

        expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    });

    test("handles a user without an email address", async () => {
        mockGetSession.mockResolvedValueOnce({
            data: {
                session: {
                    access_token: "fake-token",
                    user: {},
                },
            },
        });
        fetchMock.mockResolvedValueOnce(response(fakeAccounts));
        render(<ImportPage />);

        expect(await screen.findByText(
            "Sidebar email: none"
        )).toBeInTheDocument();
    });

    test("handles an auth update without an email address", async () => {
        let authCallback:
            | ((event: string, session: {
                access_token: string;
                user: { email?: string };
            } | null) => void)
            | undefined;

        mockOnAuthStateChange.mockImplementation((callback) => {
            authCallback = callback;
            return {
                data: { subscription: { unsubscribe: mockUnsubscribe } },
            };
        });

        await renderLoadedPage();
        authCallback?.("TOKEN_REFRESHED", {
            access_token: "new-token",
            user: {},
        });

        expect(await screen.findByText(
            "Sidebar email: none"
        )).toBeInTheDocument();
    });

    test("requires a file after the selected file is cleared", async () => {
        await renderLoadedPage();
        selectCsvFile();
        fireEvent.change(screen.getByLabelText("CSV file"), {
            target: { files: [] },
        });
        clickImport();

        expect(
            screen.getByText("Please select a CSV file.")
        ).toBeInTheDocument();
    });

    test("shows the loading state while importing", async () => {
        let finishImport: (value: Response) => void = () => undefined;
        const pendingImport = new Promise<Response>((resolve) => {
            finishImport = resolve;
        });
        fetchMock
            .mockResolvedValueOnce(response(fakeAccounts))
            .mockReturnValueOnce(pendingImport);
        render(<ImportPage />);
        await screen.findByRole("heading", { name: "Import CSV" });
        selectCsvFile();
        clickImport();

        expect(await screen.findByRole(
            "button",
            { name: "Importing..." }
        )).toBeDisabled();

        finishImport(response({ imported_count: 1 }));
        expect(await screen.findByText(
            "1 trade imported successfully."
        )).toBeInTheDocument();
    });

    test("shows a connection error when fetch rejects", async () => {
        fetchMock
            .mockResolvedValueOnce(response(fakeAccounts))
            .mockRejectedValueOnce(new Error("Network error"));
        render(<ImportPage />);
        await screen.findByRole("heading", { name: "Import CSV" });
        selectCsvFile();
        clickImport();

        expect(await screen.findByText(
            "Unable to connect to the server."
        )).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Import trades" })).toBeEnabled();
    });
});
