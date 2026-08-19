import {
    Pencil,
    Trash2,
    Save,
} from "lucide-react";

import Link from "next/link";

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
    return (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <h3 className="text-lg font-semibold text-slate-900">
                    Recent Trades
                </h3>
            </div>

            <div className="overflow-x-auto pb-6">
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
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSymbol(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <select
                                                aria-label="Edit direction"
                                                value={
                                                    direction
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setDirection(
                                                        event
                                                            .target
                                                            .value
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

                                        <td className="py-4 pr-6">
                                            <input
                                                aria-label="Edit entry"
                                                value={entry}
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEntry(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <input
                                                aria-label="Edit stop"
                                                value={stop}
                                                onChange={(
                                                    event
                                                ) =>
                                                    setStop(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <input
                                                aria-label="Edit exit"
                                                value={exit}
                                                onChange={(
                                                    event
                                                ) =>
                                                    setExit(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <input
                                                type="datetime-local"
                                                aria-label="Edit entry datetime"
                                                value={
                                                    entryDatetime
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEntryDatetime(
                                                        event
                                                            .target
                                                            .value
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
                                                onChange={(
                                                    event
                                                ) =>
                                                    setExitDatetime(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                required
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <span
                                                className={
                                                    trade[6] >
                                                        0
                                                        ? "font-medium text-emerald-600"
                                                        : trade[6] <
                                                            0
                                                            ? "font-medium text-rose-600"
                                                            : "font-medium text-slate-500"
                                                }
                                            >
                                                {
                                                    trade[6]
                                                }
                                                R
                                            </span>
                                        </td>

                                        <td className="py-4 pr-6">
                                            <input
                                                type="number"
                                                aria-label="Edit P/L"
                                                value={pnl}
                                                onChange={(
                                                    event
                                                ) =>
                                                    setPnl(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="w-full min-w-0 rounded-lg border border-slate-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-4 pr-6">
                                            <button
                                                onClick={() =>
                                                    onUpdate(
                                                        trade[0]
                                                    )
                                                }
                                                aria-label="Save trade"
                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                            >
                                                <Save
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-4 pl-6 pr-6 font-medium text-slate-900">
                                            {
                                                trade[1]
                                            }
                                        </td>

                                        <td className="py-4 pr-6">
                                            <span
                                                className={
                                                    trade[2] ===
                                                        "long"
                                                        ? "font-semibold text-emerald-600"
                                                        : "font-semibold text-rose-600"
                                                }
                                            >
                                                {trade[2] ===
                                                    "long"
                                                    ? "Long ↑"
                                                    : "Short ↓"}
                                            </span>
                                        </td>

                                        <td className="py-4 pr-6">
                                            {
                                                trade[3]
                                            }
                                        </td>

                                        <td className="py-4 pr-6">
                                            {
                                                trade[4]
                                            }
                                        </td>

                                        <td className="py-4 pr-6">
                                            {
                                                trade[5]
                                            }
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
                                                    trade[6] >
                                                        0
                                                        ? "font-semibold text-emerald-600"
                                                        : trade[6] <
                                                            0
                                                            ? "font-semibold text-rose-600"
                                                            : "font-semibold text-slate-500"
                                                }
                                            >
                                                {
                                                    trade[6]
                                                }
                                                R
                                            </span>
                                        </td>

                                        <td className="py-4 pr-6">
                                            <span
                                                className={
                                                    trade[7] >
                                                        0
                                                        ? "font-semibold text-emerald-600"
                                                        : trade[7] <
                                                            0
                                                            ? "font-semibold text-rose-600"
                                                            : "font-semibold text-slate-500"
                                                }
                                            >
                                                {
                                                    trade[7]
                                                }
                                            </span>
                                        </td>

                                        <td className="py-4 pr-6">
                                            <div className="flex gap-2">
                                                <button
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
                                                    onClick={() =>
                                                        onDelete(
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

            {showViewAll && (
                <div className="flex justify-center border-t border-slate-100 px-4 py-4 sm:px-6">
                    <Link
                        href={
                            selectedAccountId !==
                                null
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