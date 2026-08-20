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

import ResetPasswordPage from "./page";

type AuthCallback = (
    event: string,
    session: unknown
) => void;

const {
    mockOnAuthStateChange,
    mockUpdateUser,
    mockSignOut,
    mockUnsubscribe,
    mockPush,
} = vi.hoisted(() => ({
    mockOnAuthStateChange:
        vi.fn(),
    mockUpdateUser: vi.fn(),
    mockSignOut: vi.fn(),
    mockUnsubscribe: vi.fn(),
    mockPush: vi.fn(),
}));

let authCallback:
    | AuthCallback
    | null = null;

vi.mock("../../lib/supabase", () => ({
    supabase: {
        auth: {
            onAuthStateChange:
                mockOnAuthStateChange,
            updateUser:
                mockUpdateUser,
            signOut:
                mockSignOut,
        },
    },
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

function sendAuthEvent(
    event: string
) {
    act(() => {
        authCallback?.(
            event,
            null
        );
    });
}

function openRecoveryPage() {
    render(
        <ResetPasswordPage />
    );

    sendAuthEvent(
        "PASSWORD_RECOVERY"
    );
}

function fillPasswords(
    password: string,
    confirmPassword: string
) {
    fireEvent.change(
        screen.getByPlaceholderText(
            "New password"
        ),
        {
            target: {
                value: password,
            },
        }
    );

    fireEvent.change(
        screen.getByPlaceholderText(
            "Confirm password"
        ),
        {
            target: {
                value:
                    confirmPassword,
            },
        }
    );
}

describe(
    "ResetPasswordPage",
    () => {
        beforeEach(() => {
            authCallback = null;

            mockOnAuthStateChange.mockReset();
            mockUpdateUser.mockReset();
            mockSignOut.mockReset();
            mockUnsubscribe.mockReset();
            mockPush.mockReset();

            vi.spyOn(
                console,
                "log"
            ).mockImplementation(
                () => { }
            );

            mockOnAuthStateChange.mockImplementation(
                (
                    callback:
                        AuthCallback
                ) => {
                    authCallback =
                        callback;

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
        });

        afterEach(() => {
            cleanup();
            vi.restoreAllMocks();
        });

        test("subscribes to auth state changes", () => {
            render(
                <ResetPasswordPage />
            );

            expect(
                mockOnAuthStateChange
            ).toHaveBeenCalledTimes(
                1
            );
        });

        test("shows nothing while checking recovery state", () => {
            const {
                container,
            } = render(
                <ResetPasswordPage />
            );

            expect(
                container
            ).toBeEmptyDOMElement();
        });

        test("shows invalid link message without password recovery", () => {
            render(
                <ResetPasswordPage />
            );

            sendAuthEvent(
                "INITIAL_SESSION"
            );

            expect(
                screen.getByText(
                    "This password reset link is invalid or has expired."
                )
            ).toBeInTheDocument();
        });

        test("shows reset form during password recovery", () => {
            openRecoveryPage();

            expect(
                screen.getByRole(
                    "heading",
                    {
                        name:
                            "Reset password",
                    }
                )
            ).toBeInTheDocument();

            expect(
                screen.getByPlaceholderText(
                    "New password"
                )
            ).toBeInTheDocument();

            expect(
                screen.getByPlaceholderText(
                    "Confirm password"
                )
            ).toBeInTheDocument();
        });

        test("requires both password fields", async () => {
            openRecoveryPage();

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Update password",
                    }
                )
            );

            expect(
                await screen.findByText(
                    "Please fill in all required fields."
                )
            ).toBeInTheDocument();

            expect(
                mockUpdateUser
            ).not.toHaveBeenCalled();
        });

        test("requires confirm password when new password is filled", async () => {
            openRecoveryPage();

            fireEvent.change(
                screen.getByPlaceholderText(
                    "New password"
                ),
                {
                    target: {
                        value:
                            "newpassword123",
                    },
                }
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Update password",
                    }
                )
            );

            expect(
                await screen.findByText(
                    "Please fill in all required fields."
                )
            ).toBeInTheDocument();

            expect(
                mockUpdateUser
            ).not.toHaveBeenCalled();
        });

        test("rejects different passwords", async () => {
            openRecoveryPage();

            fillPasswords(
                "newpassword123",
                "different123"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Update password",
                    }
                )
            );

            expect(
                await screen.findByText(
                    "Passwords do not match."
                )
            ).toBeInTheDocument();

            expect(
                mockUpdateUser
            ).not.toHaveBeenCalled();
        });

        test("shows update password error", async () => {
            mockUpdateUser.mockResolvedValue({
                error: {
                    message:
                        "Unable to update password",
                },
            });

            openRecoveryPage();

            fillPasswords(
                "newpassword123",
                "newpassword123"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Update password",
                    }
                )
            );

            expect(
                await screen.findByText(
                    "Unable to update password"
                )
            ).toBeInTheDocument();

            expect(
                mockSignOut
            ).not.toHaveBeenCalled();

            expect(
                mockPush
            ).not.toHaveBeenCalled();
        });

        test("updates password with new password", async () => {
            mockUpdateUser.mockResolvedValue({
                error: null,
            });

            mockSignOut.mockResolvedValue({
                error: null,
            });

            openRecoveryPage();

            fillPasswords(
                "newpassword123",
                "newpassword123"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Update password",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    mockUpdateUser
                ).toHaveBeenCalledWith(
                    {
                        password:
                            "newpassword123",
                    }
                );
            });
        });

        test("signs out after updating password", async () => {
            mockUpdateUser.mockResolvedValue({
                error: null,
            });

            mockSignOut.mockResolvedValue({
                error: null,
            });

            openRecoveryPage();

            fillPasswords(
                "newpassword123",
                "newpassword123"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Update password",
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
        });

        test("redirects to login after updating password", async () => {
            mockUpdateUser.mockResolvedValue({
                error: null,
            });

            mockSignOut.mockResolvedValue({
                error: null,
            });

            openRecoveryPage();

            fillPasswords(
                "newpassword123",
                "newpassword123"
            );

            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Update password",
                    }
                )
            );

            await waitFor(() => {
                expect(
                    mockPush
                ).toHaveBeenCalledWith(
                    "/login"
                );
            });
        });

        test("unsubscribes from auth listener", () => {
            const {
                unmount,
            } = render(
                <ResetPasswordPage />
            );

            unmount();

            expect(
                mockUnsubscribe
            ).toHaveBeenCalledTimes(
                1
            );
        });
    }
);