import {
    cleanup,
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
} = vi.hoisted(() => {
    const mockPush = vi.fn();

    return {
        mockGetSession: vi.fn(),
        mockSignOut: vi.fn(),
        mockOnAuthStateChange: vi.fn(),
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
            onAuthStateChange: mockOnAuthStateChange,
        },
    },
}));

vi.mock("next/navigation", () => ({
    useRouter: () => mockRouter,
}));

vi.mock("../../components/Sidebar", () => ({
    default: () => <div>Fake sidebar</div>,
}));

vi.mock("./AccountForm", () => ({
    default: () => <div>Fake account form</div>,
}));

const fakeSession = {
    access_token: "fake-token",
    user: {
        email: "test@example.com",
    },
};

let fetchMock: ReturnType<typeof vi.fn>;

describe("AccountsPage", () => {
    beforeEach(() => {
        fetchMock = vi.fn();

        vi.stubGlobal(
            "fetch",
            fetchMock
        );

        mockGetSession.mockReset();
        mockSignOut.mockReset();
        mockOnAuthStateChange.mockReset();
        mockPush.mockReset();

        mockGetSession.mockResolvedValue({
            data: {
                session: fakeSession,
            },
        });

        mockOnAuthStateChange.mockReturnValue({
            data: {
                subscription: {
                    unsubscribe: vi.fn(),
                },
            },
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test("shows empty state when the user has no accounts", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => [],
        } as Response);

        render(<AccountsPage />);

        expect(
            await screen.findByText("No accounts yet.")
        ).toBeInTheDocument();
    });

    test("shows the user's accounts", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            json: async () => [
                {
                    id: 7,
                    user_id: "test-user",
                    name: "FTMO 100K",
                    starting_balance: 100000,
                    currency: "USD",
                    broker: "FTMO",
                    account_type: "Prop Firm",
                },
            ],
        } as Response);

        render(<AccountsPage />);

        expect(
            await screen.findByText("FTMO 100K")
        ).toBeInTheDocument();
    });

    test("redirects to login when there is no session", async () => {
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
    });
});