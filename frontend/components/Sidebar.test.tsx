import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import Sidebar from "./Sidebar";

const { mockPathname } = vi.hoisted(() => ({
    mockPathname: vi.fn(() => "/"),
}));

vi.mock("next/navigation", () => ({
    usePathname: mockPathname,
}));

function renderSidebar(onLogout = vi.fn()) {
    render(<Sidebar userEmail="test@example.com" onLogout={onLogout} />);

    return {
        onLogout,
        openButton: screen.getByRole("button", { name: "Open navigation" }),
    };
}

function expectNavigationClosed() {
    expect(screen.getAllByRole("button", { name: "Close navigation" })).toHaveLength(1);
}

function openNavigation() {
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getAllByRole("button", { name: "Close navigation" })).toHaveLength(2);
}

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/");
});

describe("Sidebar", () => {
    test("renders the user email", () => {
        renderSidebar();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    test.each([
        ["Dashboard", "/"],
        ["Trades", "/trades"],
        ["Import CSV", "/import"],
        ["Accounts", "/accounts"],
    ])("renders the %s link", (name, href) => {
        renderSidebar();
        expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    });

    test("opens and closes mobile navigation", () => {
        renderSidebar();
        expectNavigationClosed();
        openNavigation();

        const closeButtons = screen.getAllByRole("button", { name: "Close navigation" });
        fireEvent.click(closeButtons[1]);
        expectNavigationClosed();

        openNavigation();
        const [overlayButton] = screen.getAllByRole("button", { name: "Close navigation" });
        fireEvent.click(overlayButton);
        expectNavigationClosed();
    });

    test.each([
        ["Dashboard", "/"],
        ["Trades", "/trades"],
        ["Import CSV", "/import"],
        ["Accounts", "/accounts"],
    ])("closes navigation when %s is clicked", (name, href) => {
        renderSidebar();
        openNavigation();

        const link = screen.getByRole("link", { name });
        expect(link).toHaveAttribute("href", href);
        fireEvent.click(link);
        expectNavigationClosed();
    });

    test("calls onLogout", () => {
        const onLogout = vi.fn();
        renderSidebar(onLogout);
        fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
        expect(onLogout).toHaveBeenCalledOnce();
    });

    test.each([
        ["/", "Dashboard"],
        ["/trades", "Trades"],
        ["/trades?account_id=7", "Trades"],
        ["/import", "Import CSV"],
        ["/accounts", "Accounts"],
    ])("marks %s route as active", (pathname, activeLink) => {
        mockPathname.mockReturnValue(pathname);
        renderSidebar();
        expect(screen.getByRole("link", { name: activeLink })).toHaveClass("bg-blue-50", "text-blue-600");
    });

    test("marks inactive links correctly", () => {
        mockPathname.mockReturnValue("/accounts");
        renderSidebar();

        for (const name of ["Dashboard", "Trades", "Import CSV"]) {
            expect(screen.getByRole("link", { name })).toHaveClass("text-slate-600");
        }
    });
});
