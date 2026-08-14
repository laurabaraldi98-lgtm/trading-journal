import {
    render,
    screen,
    fireEvent,
    waitFor,
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

import LoginPage from "./page";


const {
    mockSignInWithPassword,
    mockSignUp,
} = vi.hoisted(() => ({
    mockSignInWithPassword: vi.fn(),
    mockSignUp: vi.fn(),
}));


vi.mock("../../lib/supabase", () => ({
    supabase: {
        auth: {
            signInWithPassword:
                mockSignInWithPassword,

            signUp:
                mockSignUp,
        },
    },
}));


function fillCredentials() {
    fireEvent.change(
        screen.getByPlaceholderText(
            "Email"
        ),
        {
            target: {
                value: "test@example.com",
            },
        }
    );

    fireEvent.change(
        screen.getByPlaceholderText(
            "Password"
        ),
        {
            target: {
                value: "secret123",
            },
        }
    );
}


describe("LoginPage", () => {
    beforeEach(() => {
        mockSignInWithPassword.mockReset();
        mockSignUp.mockReset();
    });


    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });


    test("renders the login form", () => {
        render(<LoginPage />);

        expect(
            screen.getByRole(
                "heading",
                {
                    name: "Trading Journal",
                }
            )
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText(
                "Email"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText(
                "Password"
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole(
                "button",
                {
                    name: "Sign In",
                }
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole(
                "button",
                {
                    name: "Create Account",
                }
            )
        ).toBeInTheDocument();
    });


    test("sends email and password when signing in", async () => {
        mockSignInWithPassword.mockResolvedValue({
            error: null,
        });

        render(<LoginPage />);

        fillCredentials();

        fireEvent.click(
            screen.getByRole(
                "button",
                {
                    name: "Sign In",
                }
            )
        );

        await waitFor(() => {
            expect(
                mockSignInWithPassword
            ).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "secret123",
            });
        });
    });


    test("shows login error message", async () => {
        mockSignInWithPassword.mockResolvedValue({
            error: {
                message:
                    "Invalid login credentials",
            },
        });

        render(<LoginPage />);

        fillCredentials();

        fireEvent.click(
            screen.getByRole(
                "button",
                {
                    name: "Sign In",
                }
            )
        );

        expect(
            await screen.findByText(
                "Invalid login credentials"
            )
        ).toBeInTheDocument();
    });


    test("sends email and password when creating an account", async () => {
        mockSignUp.mockResolvedValue({
            error: null,
        });

        render(<LoginPage />);

        fillCredentials();

        fireEvent.click(
            screen.getByRole(
                "button",
                {
                    name: "Create Account",
                }
            )
        );

        await waitFor(() => {
            expect(
                mockSignUp
            ).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "secret123",
            });
        });

        expect(
            await screen.findByText(
                "Check your email to confirm your account."
            )
        ).toBeInTheDocument();
    });


    test("shows signup error message", async () => {
        mockSignUp.mockResolvedValue({
            error: {
                message:
                    "User already registered",
            },
        });

        render(<LoginPage />);

        fillCredentials();

        fireEvent.click(
            screen.getByRole(
                "button",
                {
                    name: "Create Account",
                }
            )
        );

        expect(
            await screen.findByText(
                "User already registered"
            )
        ).toBeInTheDocument();
    });
});