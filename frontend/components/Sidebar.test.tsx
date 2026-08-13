import {
    render,
    screen,
    fireEvent,
    cleanup
} from "@testing-library/react";
import {
    describe,
    expect,
    test,
    vi,
    afterEach
} from "vitest";

import Sidebar from "./Sidebar";

afterEach(() => {
    cleanup();
});

describe("Sidebar", () => {
    test("shows the user email", () => {
        render(
            <Sidebar
                userEmail="test@example.com"
                onLogout={() => { }}
            />
        );

        expect(
            screen.getByText("test@example.com")
        ).toBeInTheDocument();
    });

    test("calls onLogout when Sign Out is clicked", () => {
        const mockLogout = vi.fn();

        render(
            <Sidebar
                userEmail="test@example.com"
                onLogout={mockLogout}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Sign Out" })
        );

        expect(mockLogout).toHaveBeenCalledOnce();
    });
});

test("renders navigation links", () => {
    render(
        <Sidebar
            userEmail="test@example.com"
            onLogout={() => { }}
        />
    );

    expect(
        screen.getByRole("link", { name: "Dashboard" })
    ).toHaveAttribute("href", "/");

    expect(
        screen.getByRole("link", { name: "Settings" })
    ).toHaveAttribute("href", "/settings");
});