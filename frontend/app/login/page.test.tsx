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

import LoginPage from "./page";

const {
    mockSignInWithPassword,
    mockSignUp,
    mockResetPasswordForEmail,
    mockPush,
} = vi.hoisted(() => ({
    mockSignInWithPassword: vi.fn(),
    mockSignUp: vi.fn(),
    mockResetPasswordForEmail: vi.fn(),
    mockPush: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
    supabase: {
        auth: {
            signInWithPassword:
                mockSignInWithPassword,
            signUp: mockSignUp,
            resetPasswordForEmail:
                mockResetPasswordForEmail,
        },
    },
}));

vi.mock("../../lib/api", () => ({
    SITE_URL: "http://localhost:3000",
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

function getEmailInput() {
    return screen.getAllByLabelText(
        "Email"
    )[0];
}

function getPasswordInput() {
    return screen.getAllByLabelText(
        "Password"
    )[0];
}

function getConfirmPasswordInput() {
    return screen.getAllByLabelText(
        "Confirm password"
    )[0];
}

function getSignInButton() {
    return screen.getAllByRole(
        "button",
        {
            name: /^Sign in/,
        }
    )[0];
}

function getCreateAccountButton() {
    return screen.getAllByRole(
        "button",
        {
            name: /^Create account/,
        }
    )[0];
}

function getForgotPasswordButton() {
    return screen.getAllByRole(
        "button",
        {
            name: /Forgot/,
        }
    )[0];
}

function fillLoginCredentials() {
    fireEvent.change(
        getEmailInput(),
        {
            target: {
                value: "test@example.com",
            },
        }
    );

    fireEvent.change(
        getPasswordInput(),
        {
            target: {
                value: "secret123",
            },
        }
    );
}

function switchToSignUp() {
    fireEvent.click(
        screen.getAllByRole(
            "button",
            {
                name: "Create one",
            }
        )[0]
    );
}

function fillSignUpCredentials() {
    fillLoginCredentials();

    fireEvent.change(
        getConfirmPasswordInput(),
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
        mockResetPasswordForEmail.mockReset();
        mockPush.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    test("renders the sign in form", () => {
        render(<LoginPage />);

        expect(
            screen.getAllByRole(
                "heading",
                {
                    name: "Trading Journal",
                }
            ).length
        ).toBeGreaterThan(0);

        expect(
            screen.getAllByLabelText(
                "Email"
            ).length
        ).toBeGreaterThan(0);

        expect(
            screen.getAllByLabelText(
                "Password"
            ).length
        ).toBeGreaterThan(0);

        expect(
            screen.getAllByRole(
                "button",
                {
                    name: /^Sign in/,
                }
            ).length
        ).toBeGreaterThan(0);
    });

    test("shows disabled demo buttons", () => {
        render(<LoginPage />);

        const demoButtons =
            screen.getAllByRole(
                "button",
                {
                    name: "Try demo",
                }
            );

        expect(
            demoButtons.length
        ).toBeGreaterThan(0);

        demoButtons.forEach(
            (button) => {
                expect(
                    button
                ).toBeDisabled();
            }
        );
    });

    test("signs in with email and password", async () => {
        mockSignInWithPassword.mockResolvedValue({
            error: null,
        });

        render(<LoginPage />);

        fillLoginCredentials();

        fireEvent.click(
            getSignInButton()
        );

        await waitFor(() => {
            expect(
                mockSignInWithPassword
            ).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "secret123",
            });
        });

        expect(
            mockPush
        ).toHaveBeenCalledWith("/");
    });

    test("shows login error message", async () => {
        mockSignInWithPassword.mockResolvedValue({
            error: {
                message:
                    "Invalid login credentials",
            },
        });

        render(<LoginPage />);

        fillLoginCredentials();

        fireEvent.click(
            getSignInButton()
        );

        expect(
            (
                await screen.findAllByText(
                    "Invalid login credentials"
                )
            ).length
        ).toBeGreaterThan(0);

        expect(
            mockPush
        ).not.toHaveBeenCalled();
    });

    test("switches to create account mode", () => {
        render(<LoginPage />);

        switchToSignUp();

        expect(
            screen.getAllByRole(
                "heading",
                {
                    name:
                        "Create account",
                }
            ).length
        ).toBeGreaterThan(0);

        expect(
            screen.getAllByLabelText(
                "Confirm password"
            ).length
        ).toBeGreaterThan(0);
    });

    test("keeps email but clears password when switching mode", () => {
        render(<LoginPage />);

        fillLoginCredentials();

        switchToSignUp();

        expect(
            getEmailInput()
        ).toHaveValue(
            "test@example.com"
        );

        expect(
            getPasswordInput()
        ).toHaveValue("");
    });

    test("does not create account when passwords do not match", async () => {
        render(<LoginPage />);

        switchToSignUp();

        fillLoginCredentials();

        fireEvent.change(
            getConfirmPasswordInput(),
            {
                target: {
                    value:
                        "different123",
                },
            }
        );

        fireEvent.click(
            getCreateAccountButton()
        );

        expect(
            (
                await screen.findAllByText(
                    "Passwords do not match."
                )
            ).length
        ).toBeGreaterThan(0);

        expect(
            mockSignUp
        ).not.toHaveBeenCalled();
    });

    test("creates an account", async () => {
        mockSignUp.mockResolvedValue({
            error: null,
        });

        render(<LoginPage />);

        switchToSignUp();

        fillSignUpCredentials();

        fireEvent.click(
            getCreateAccountButton()
        );

        await waitFor(() => {
            expect(
                mockSignUp
            ).toHaveBeenCalledWith({
                email:
                    "test@example.com",
                password:
                    "secret123",
            });
        });

        expect(
            (
                await screen.findAllByText(
                    "Check your email to confirm your account."
                )
            ).length
        ).toBeGreaterThan(0);
    });

    test("shows signup error message", async () => {
        mockSignUp.mockResolvedValue({
            error: {
                message:
                    "User already registered",
            },
        });

        render(<LoginPage />);

        switchToSignUp();

        fillSignUpCredentials();

        fireEvent.click(
            getCreateAccountButton()
        );

        expect(
            (
                await screen.findAllByText(
                    "User already registered"
                )
            ).length
        ).toBeGreaterThan(0);
    });

    test("asks for email before password reset", async () => {
        render(<LoginPage />);

        fireEvent.click(
            getForgotPasswordButton()
        );

        expect(
            (
                await screen.findAllByText(
                    "Enter your email first."
                )
            ).length
        ).toBeGreaterThan(0);

        expect(
            mockResetPasswordForEmail
        ).not.toHaveBeenCalled();
    });

    test("sends password reset email", async () => {
        mockResetPasswordForEmail.mockResolvedValue({
            error: null,
        });

        render(<LoginPage />);

        fireEvent.change(
            getEmailInput(),
            {
                target: {
                    value:
                        "test@example.com",
                },
            }
        );

        fireEvent.click(
            getForgotPasswordButton()
        );

        await waitFor(() => {
            expect(
                mockResetPasswordForEmail
            ).toHaveBeenCalledWith(
                "test@example.com",
                {
                    redirectTo:
                        "http://localhost:3000/reset-password",
                }
            );
        });

        expect(
            (
                await screen.findAllByText(
                    "Check your email for a password reset link."
                )
            ).length
        ).toBeGreaterThan(0);
    });

    test("shows password reset error message", async () => {
        mockResetPasswordForEmail.mockResolvedValue({
            error: {
                message:
                    "Unable to send reset email",
            },
        });

        render(<LoginPage />);

        fireEvent.change(
            getEmailInput(),
            {
                target: {
                    value:
                        "test@example.com",
                },
            }
        );

        fireEvent.click(
            getForgotPasswordButton()
        );

        expect(
            (
                await screen.findAllByText(
                    "Unable to send reset email"
                )
            ).length
        ).toBeGreaterThan(0);
    });

    test("switches back to sign in mode", () => {
        render(<LoginPage />);

        switchToSignUp();

        fireEvent.click(
            screen.getAllByRole(
                "button",
                {
                    name: "Sign in",
                }
            )[0]
        );

        expect(
            screen.getAllByRole(
                "heading",
                {
                    name: "Sign in",
                }
            ).length
        ).toBeGreaterThan(0);
    });
    test("handles mobile login and signup controls", async () => {
        mockSignInWithPassword.mockResolvedValue({
            error: null,
        });

        mockSignUp.mockResolvedValue({
            error: null,
        });

        mockResetPasswordForEmail.mockResolvedValue({
            error: null,
        });

        render(<LoginPage />);

        const emailInputs =
            screen.getAllByLabelText("Email");

        const passwordInputs =
            screen.getAllByLabelText("Password");

        fireEvent.change(
            emailInputs[1],
            {
                target: {
                    value: "mobile@example.com",
                },
            }
        );

        fireEvent.change(
            passwordInputs[1],
            {
                target: {
                    value: "mobile123",
                },
            }
        );

        fireEvent.click(
            screen.getAllByRole(
                "button",
                {
                    name: /Forgot/,
                }
            )[1]
        );

        await waitFor(() => {
            expect(
                mockResetPasswordForEmail
            ).toHaveBeenCalledWith(
                "mobile@example.com",
                {
                    redirectTo:
                        "http://localhost:3000/reset-password",
                }
            );
        });

        fireEvent.click(
            screen.getAllByRole(
                "button",
                {
                    name: /^Sign in/,
                }
            )[1]
        );

        await waitFor(() => {
            expect(
                mockSignInWithPassword
            ).toHaveBeenCalledWith({
                email: "mobile@example.com",
                password: "mobile123",
            });
        });

        fireEvent.click(
            screen.getAllByRole(
                "button",
                {
                    name: "Create one",
                }
            )[1]
        );

        const signupPasswordInputs =
            screen.getAllByLabelText(
                "Password"
            );

        const confirmPasswordInputs =
            screen.getAllByLabelText(
                "Confirm password"
            );

        fireEvent.change(
            signupPasswordInputs[1],
            {
                target: {
                    value: "newmobile123",
                },
            }
        );

        fireEvent.change(
            confirmPasswordInputs[1],
            {
                target: {
                    value: "newmobile123",
                },
            }
        );

        fireEvent.click(
            screen.getAllByRole(
                "button",
                {
                    name: /^Create account/,
                }
            )[1]
        );

        await waitFor(() => {
            expect(
                mockSignUp
            ).toHaveBeenCalledWith({
                email: "mobile@example.com",
                password: "newmobile123",
            });
        });

        fireEvent.click(
            screen.getAllByRole(
                "button",
                {
                    name: "Sign in",
                }
            )[1]
        );

        expect(
            screen.getAllByRole(
                "heading",
                {
                    name: "Sign in",
                }
            ).length
        ).toBeGreaterThan(0);
    });
});