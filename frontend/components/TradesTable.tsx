import { useState } from "react";
import Link from "next/link";
import {
    Pencil,
    Trash2,
    Save,
} from "lucide-react";

type Trade = [
    number,
    string,
    string,
    number,
    number,
    number,
    number,
    number,
    string,
    string
];

type TradesTableProps = {
    trades: Trade[];
    editingTradeId: number | null;

    symbol: string;
    direction: string;
    entry: string;
    stop: string;
    exit: string;
    pnl: string;
    entryDatetime: string;
    exitDatetime: string;

    showViewAll?: boolean;
    selectedAccountId?: number | null;

    setSymbol: (value: string) => void;
    setDirection: (value: string) => void;
    setEntry: (value: string) => void;
    setStop: (value: string) => void;
    setExit: (value: string) => void;
    setPnl: (value: string) => void;
    setEntryDatetime: (value: string) => void;
    setExitDatetime: (value: string) => void;

    onEdit: (trade: Trade) => void;
    onUpdate: (tradeId: number) => void;
    onDelete: (tradeId: number) => void;
};

export default function TradesTable({
    trades,
    editingTradeId,
    symbol,
    direction,
    entry,
    stop,
    exit,
    pnl,
    entryDatetime,
    exitDatetime,
    showViewAll = false,
    selectedAccountId = null,
    setSymbol,
    setDirection,
    setEntry,
    setStop,
    setExit,
    setPnl,
    setEntryDatetime,
    setExitDatetime,
    onEdit,
    onUpdate,
    onDelete,
}: TradesTableProps) {
    const [
        tradeToDelete,
        setTradeToDelete,
    ] = useState<number | null>(null);

    function confirmDelete() {
        onDelete(tradeToDelete!);
        setTradeToDelete(null);
    }

    return (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <h3 className="text-lg font-semibold text-slate-900">
                    Recent Trades
                </h3>
            </div>

            {/* MOBILE */}
            <div className="divide-y divide-slate-100 md:hidden">
                {trades.map((trade) =>
                    editingTradeId === trade[0] ? (
                        <div
                            key={trade[0]}
                            className="space-y-4 p-4"
                        >
                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-500">
                                    Symbol
                                </span>
                                <input
                                    aria-label="Edit symbol"
                                    value={symbol}
                                    onChange={(event) =>
                                        setSymbol(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-500">
                                    Direction
                                </span>
                                <select
                                    aria-label="Edit direction"
                                    value={direction}
                                    onChange={(event) =>
                                        setDirection(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                >
                                    <option value="long">
                                        Long
                                    </option>
                                    <option value="short">
                                        Short
                                    </option>
                                </select>
                            </label>

                            <div className="grid grid-cols-3 gap-3">
                                <label>
                                    <span className="mb-1 block text-xs font-medium text-slate-500">
                                        Entry
                                    </span>
                                    <input
                                        aria-label="Edit entry"
                                        value={entry}
                                        onChange={(event) =>
                                            setEntry(
                                                event.target.value
                                            )
                                        }
                                        className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                    />
                                </label>

                                <label>
                                    <span className="mb-1 block text-xs font-medium text-slate-500">
                                        Stop
                                    </span>
                                    <input
                                        aria-label="Edit stop"
                                        value={stop}
                                        onChange={(event) =>
                                            setStop(
                                                event.target.value
                                            )
                                        }
                                        className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                    />
                                </label>

                                <label>
                                    <span className="mb-1 block text-xs font-medium text-slate-500">
                                        Exit
                                    </span>
                                    <input
                                        aria-label="Edit exit"
                                        value={exit}
                                        onChange={(event) =>
                                            setExit(
                                                event.target.value
                                            )
                                        }
                                        className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-500">
                                    Entry time
                                </span>
                                <input
                                    type="datetime-local"
                                    aria-label="Edit entry datetime"
                                    value={entryDatetime}
                                    onChange={(event) =>
                                        setEntryDatetime(
                                            event.target.value
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-500">
                                    Exit time
                                </span>
                                <input
                                    type="datetime-local"
                                    aria-label="Edit exit datetime"
                                    value={exitDatetime}
                                    onChange={(event) =>
                                        setExitDatetime(
                                            event.target.value
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-slate-500">
                                    P/L
                                </span>
                                <input
                                    type="number"
                                    aria-label="Edit P/L"
                                    value={pnl}
                                    onChange={(event) =>
                                        setPnl(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={() =>
                                    onUpdate(trade[0])
                                }
                                aria-label="Save trade"
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
                            >
                                <Save size={16} />
                                Save
                            </button>
                        </div>
                    ) : (
                        <div
                            key={trade[0]}
                            className="p-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {trade[1]}
                                    </p>

                                    <p
                                        className={
                                            trade[2] === "long"
                                                ? "mt-1 text-sm font-semibold text-emerald-600"
                                                : "mt-1 text-sm font-semibold text-rose-600"
                                        }
                                    >
                                        {trade[2] === "long"
                                            ? "Long ↑"
                                            : "Short ↓"}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p
                                        className={
                                            trade[6] > 0
                                                ? "font-semibold text-emerald-600"
                                                : trade[6] < 0
                                                    ? "font-semibold text-rose-600"
                                                    : "font-semibold text-slate-500"
                                        }
                                    >
                                        {trade[6]}R
                                    </p>

                                    <p
                                        className={
                                            trade[7] > 0
                                                ? "mt-1 text-sm font-medium text-emerald-600"
                                                : trade[7] < 0
                                                    ? "mt-1 text-sm font-medium text-rose-600"
                                                    : "mt-1 text-sm font-medium text-slate-500"
                                        }
                                    >
                                        P/L {trade[7]}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                {[
                                    ["Entry", trade[3]],
                                    ["Stop", trade[4]],
                                    ["Exit", trade[5]],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <p className="text-xs text-slate-400">
                                            {label}
                                        </p>
                                        <p className="mt-1 text-slate-700">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onEdit(trade)
                                    }
                                    aria-label="Edit trade"
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                                >
                                    <Pencil size={15} />
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setTradeToDelete(
                                            trade[0]
                                        )
                                    }
                                    aria-label="Delete trade"
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-rose-50 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
                                >
                                    <Trash2 size={15} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* DESKTOP */}
            <div className="hidden overflow-x-auto pb-6 md:block">
                <table className="w-full min-w-[1100px] table-fixed">
                    <colgroup>
                        <col className="w-[170px]" />
                        <col className="w-[110px]" />
                        <col className="w-[95px]" />
                        <col className="w-[95px]" />
                        <col className="w-[95px]" />
                        <col className="w-[190px]" />
                        <col className="w-[190px]" />
                        <col className="w-[90px]" />
                        <col className="w-[100px]" />
                        <col className="w-[110px]" />
                    </colgroup>

                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                            <th className="py-3 pl-6 pr-6">
                                Symbol
                            </th>
                            <th className="py-3 pr-6">
                                Direction
                            </th>
                            <th className="py-3 pr-6">
                                Entry
                            </th>
                            <th className="py-3 pr-6">
                                Stop
                            </th>
                            <th className="py-3 pr-6">
                                Exit
                            </th>
                            <th className="py-3 pr-6">
                                Entry Time
                            </th>
                            <th className="py-3 pr-6">
                                Exit Time
                            </th>
                            <th className="py-3 pr-6">
                                Result
                            </th>
                            <th className="py-3 pr-6">
                                P/L
                            </th>
                            <th className="py-3 pr-6">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {trades.map((trade) => (
                            <tr
                                key={trade[0]}
                                className="border-b border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                                {editingTradeId ===
                                    trade[0] ? (
                                    <>
                                        <td className="py-4 pl-6 pr-6">
                                            <input
                                                aria-label="Edit symbol"
                                                value={symbol}
                                                onChange={(event) =>
                                                    setSymbol(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <select
                                                aria-label="Edit direction"
                                                value={direction}
                                                onChange={(event) =>
                                                    setDirection(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            >
                                                <option value="long">
                                                    Long
                                                </option>
                                                <option value="short">
                                                    Short
                                                </option>
                                            </select>
                                        </td>

                                        {[
                                            [
                                                "Edit entry",
                                                entry,
                                                setEntry,
                                            ],
                                            [
                                                "Edit stop",
                                                stop,
                                                setStop,
                                            ],
                                            [
                                                "Edit exit",
                                                exit,
                                                setExit,
                                            ],
                                        ].map(
                                            ([
                                                label,
                                                value,
                                                setter,
                                            ]) => (
                                                <td
                                                    key={
                                                        label as string
                                                    }
                                                    className="py-4 pr-6"
                                                >
                                                    <input
                                                        aria-label={
                                                            label as string
                                                        }
                                                        value={
                                                            value as string
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            (
                                                                setter as (
                                                                    value: string
                                                                ) => void
                                                            )(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                                    />
                                                </td>
                                            )
                                        )}

                                        <td className="py-4 pr-6">
                                            <input
                                                type="datetime-local"
                                                aria-label="Edit entry datetime"
                                                value={
                                                    entryDatetime
                                                }
                                                onChange={(event) =>
                                                    setEntryDatetime(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <input
                                                type="datetime-local"
                                                aria-label="Edit exit datetime"
                                                value={
                                                    exitDatetime
                                                }
                                                onChange={(event) =>
                                                    setExitDatetime(
                                                        event.target.value
                                                    )
                                                }
                                                required
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <span
                                                className={
                                                    trade[6] > 0
                                                        ? "font-medium text-emerald-600"
                                                        : trade[6] < 0
                                                            ? "font-medium text-rose-600"
                                                            : "font-medium text-slate-500"
                                                }
                                            >
                                                {trade[6]}R
                                            </span>
                                        </td>

                                        <td className="py-4 pr-6">
                                            <input
                                                type="number"
                                                aria-label="Edit P/L"
                                                value={pnl}
                                                onChange={(event) =>
                                                    setPnl(
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onUpdate(
                                                        trade[0]
                                                    )
                                                }
                                                aria-label="Save trade"
                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                            >
                                                <Save
                                                    size={16}
                                                />
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-4 pl-6 pr-6 font-medium text-slate-900">
                                            {trade[1]}
                                        </td>

                                        <td className="py-4 pr-6">
                                            <span
                                                className={
                                                    trade[2] === "long"
                                                        ? "font-semibold text-emerald-600"
                                                        : "font-semibold text-rose-600"
                                                }
                                            >
                                                {trade[2] === "long"
                                                    ? "Long ↑"
                                                    : "Short ↓"}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-6">
                                            {trade[3]}
                                        </td>
                                        <td className="py-4 pr-6">
                                            {trade[4]}
                                        </td>
                                        <td className="py-4 pr-6">
                                            {trade[5]}
                                        </td>

                                        <td className="whitespace-nowrap py-4 pr-6">
                                            {new Date(
                                                trade[8]
                                            ).toLocaleString()}
                                        </td>

                                        <td className="whitespace-nowrap py-4 pr-6">
                                            {new Date(
                                                trade[9]
                                            ).toLocaleString()}
                                        </td>

                                        <td className="py-4 pr-6">
                                            <span
                                                className={
                                                    trade[6] > 0
                                                        ? "font-semibold text-emerald-600"
                                                        : trade[6] < 0
                                                            ? "font-semibold text-rose-600"
                                                            : "font-semibold text-slate-500"
                                                }
                                            >
                                                {trade[6]}R
                                            </span>
                                        </td>

                                        <td className="py-4 pr-6">
                                            <span
                                                className={
                                                    trade[7] > 0
                                                        ? "font-semibold text-emerald-600"
                                                        : trade[7] < 0
                                                            ? "font-semibold text-rose-600"
                                                            : "font-semibold text-slate-500"
                                                }
                                            >
                                                {trade[7]}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-6">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit(
                                                            trade
                                                        )
                                                    }
                                                    aria-label="Edit trade"
                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                                >
                                                    <Pencil
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setTradeToDelete(
                                                            trade[0]
                                                        )
                                                    }
                                                    aria-label="Delete trade"
                                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                                                >
                                                    <Trash2
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {tradeToDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-rose-600">
                            Delete trade
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-slate-700">
                            Are you sure you want to permanently delete this trade?
                        </p>

                        <p className="mt-3 font-semibold text-rose-600">
                            This action cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setTradeToDelete(null)
                                }
                                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                            >
                                Delete permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showViewAll && (
                <div className="flex justify-center border-t border-slate-100 px-4 py-4 sm:px-6">
                    <Link
                        href={
                            selectedAccountId !== null
                                ? `/trades?account_id=${selectedAccountId}`
                                : "/trades"
                        }
                        className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                        View all trades →
                    </Link>
                </div>
            )}
        </div>
    );
}