export type DateRangePreset = "all" | "30d" | "90d" | "custom";

type Props = {
    preset: DateRangePreset;
    dateFrom: string;
    dateTo: string;
    onPresetChange: (preset: DateRangePreset) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
};

export default function DateRangeFilter({
    preset,
    dateFrom,
    dateTo,
    onPresetChange,
    onDateFromChange,
    onDateToChange,
}: Props) {
    const hasInvalidRange = dateFrom !== "" && dateTo !== "" && dateFrom > dateTo;
    const presets: Array<{ value: DateRangePreset; label: string }> = [
        { value: "all", label: "All time" },
        { value: "30d", label: "Last 30 days" },
        { value: "90d", label: "Last 90 days" },
        { value: "custom", label: "Custom" },
    ];

    return (
        <section aria-label="Date range filter" className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
                {presets.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={preset === option.value}
                        onClick={() => onPresetChange(option.value)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${preset === option.value
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {preset === "custom" && (
                <div className="mt-4 flex flex-wrap gap-4">
                    <label className="text-sm font-medium text-slate-700">
                        From
                        <input
                            type="date"
                            value={dateFrom}
                            max={dateTo || undefined}
                            onChange={(event) => onDateFromChange(event.target.value)}
                            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
                        />
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                        To
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(event) => onDateToChange(event.target.value)}
                            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
                        />
                    </label>

                    {hasInvalidRange && (
                        <p role="alert" className="w-full text-sm font-medium text-red-600">
                            Start date cannot be after end date.
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
