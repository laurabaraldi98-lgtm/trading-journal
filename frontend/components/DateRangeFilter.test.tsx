import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import DateRangeFilter from "./DateRangeFilter";

afterEach(cleanup);

describe("DateRangeFilter", () => {
    test("changes preset", () => {
        const onPresetChange = vi.fn();

        render(
            <DateRangeFilter
                preset="all"
                dateFrom=""
                dateTo=""
                onPresetChange={onPresetChange}
                onDateFromChange={vi.fn()}
                onDateToChange={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: "All time" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByLabelText("From")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Last 30 days" }));
        fireEvent.click(screen.getByRole("button", { name: "Last 90 days" }));
        fireEvent.click(screen.getByRole("button", { name: "Custom" }));
        expect(onPresetChange).toHaveBeenNthCalledWith(1, "30d");
        expect(onPresetChange).toHaveBeenNthCalledWith(2, "90d");
        expect(onPresetChange).toHaveBeenNthCalledWith(3, "custom");
    });

    test("changes custom dates", () => {
        const onDateFromChange = vi.fn();
        const onDateToChange = vi.fn();

        render(
            <DateRangeFilter
                preset="custom"
                dateFrom="2026-08-01"
                dateTo="2026-08-31"
                onPresetChange={vi.fn()}
                onDateFromChange={onDateFromChange}
                onDateToChange={onDateToChange}
            />
        );

        fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-07-01" } });
        fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-07-31" } });
        expect(onDateFromChange).toHaveBeenCalledWith("2026-07-01");
        expect(onDateToChange).toHaveBeenCalledWith("2026-07-31");
    });

    test("shows an error for a reversed range", () => {
        render(
            <DateRangeFilter
                preset="custom"
                dateFrom="2026-09-05"
                dateTo="2026-09-01"
                onPresetChange={vi.fn()}
                onDateFromChange={vi.fn()}
                onDateToChange={vi.fn()}
            />
        );

        expect(screen.getByRole("alert")).toHaveTextContent("Start date cannot be after end date.");
        expect(screen.getByLabelText("From")).toHaveAttribute("max", "2026-09-01");
        expect(screen.getByLabelText("To")).toHaveAttribute("min", "2026-09-05");
    });
});
