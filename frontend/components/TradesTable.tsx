type Trade = [
    number,
    string,
    string,
    number,
    number,
    number,
    number,
    string | null,
    string | null
];

type TradesTableProps = {
    trades: Trade[];
    editingTradeId: number | null;

    symbol: string;
    direction: string;
    entry: string;
    stop: string;
    exit: string;
    entryDatetime: string;
    exitDatetime: string;

    setSymbol: (value: string) => void;
    setDirection: (value: string) => void;
    setEntry: (value: string) => void;
    setStop: (value: string) => void;
    setExit: (value: string) => void;
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
    entryDatetime,
    exitDatetime,
    setSymbol,
    setDirection,
    setEntry,
    setStop,
    setExit,
    setEntryDatetime,
    setExitDatetime,
    onEdit,
    onUpdate,
    onDelete,
}: TradesTableProps) {
    return (
        <div className="mt-8 rounded-xl bg-white p-6 border border-zinc-200">
            <h3 className="text-xl font-semibold mb-4">
                Recent Trades
            </h3>

            <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full">
                    <thead>
                        <tr className="border-b border-zinc-200 text-left text-sm text-zinc-500">
                            <th className="py-3 pr-6">Symbol</th>
                            <th className="py-3 pr-6">Direction</th>
                            <th className="py-3 pr-6">Entry</th>
                            <th className="py-3 pr-6">Stop</th>
                            <th className="py-3 pr-6">Exit</th>
                            <th className="py-3 pr-6">Entry Time</th>
                            <th className="py-3 pr-6">Exit Time</th>
                            <th className="py-3 pr-6">Result</th>
                            <th className="py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {trades.map((trade) => (
                            <tr
                                key={trade[0]}
                                className="border-b border-zinc-200"
                            >
                                {editingTradeId === trade[0] ? (
                                    <>
                                        <td className="py-3 pr-6">
                                            <input
                                                value={symbol}
                                                onChange={(event) =>
                                                    setSymbol(event.target.value)
                                                }
                                                className="rounded border border-zinc-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-3 pr-6">
                                            <select
                                                value={direction}
                                                onChange={(event) =>
                                                    setDirection(event.target.value)
                                                }
                                                className="rounded border border-zinc-300 px-2 py-1"
                                            >
                                                <option value="long">Long</option>
                                                <option value="short">Short</option>
                                            </select>
                                        </td>

                                        <td className="py-3 pr-6">
                                            <input
                                                value={entry}
                                                onChange={(event) =>
                                                    setEntry(event.target.value)
                                                }
                                                className="w-24 rounded border border-zinc-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-3 pr-6">
                                            <input
                                                value={stop}
                                                onChange={(event) =>
                                                    setStop(event.target.value)
                                                }
                                                className="w-24 rounded border border-zinc-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-3 pr-6">
                                            <input
                                                value={exit}
                                                onChange={(event) =>
                                                    setExit(event.target.value)
                                                }
                                                className="w-24 rounded border border-zinc-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-3 pr-6">
                                            <input
                                                type="datetime-local"
                                                value={entryDatetime}
                                                onChange={(event) =>
                                                    setEntryDatetime(event.target.value)
                                                }
                                                className="rounded border border-zinc-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-3 pr-6">
                                            <input
                                                type="datetime-local"
                                                value={exitDatetime}
                                                onChange={(event) =>
                                                    setExitDatetime(event.target.value)
                                                }
                                                className="rounded border border-zinc-300 px-2 py-1"
                                            />
                                        </td>

                                        <td className="py-3 pr-6">
                                            {trade[6]}R
                                        </td>

                                        <td className="py-3">
                                            <button
                                                onClick={() => onUpdate(trade[0])}
                                                className="cursor-pointer rounded-lg px-2 py-1 text-zinc-700 hover:bg-zinc-100"
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-3 pr-6">{trade[1]}</td>
                                        <td className="py-3 pr-6">{trade[2]}</td>
                                        <td className="py-3 pr-6">{trade[3]}</td>
                                        <td className="py-3 pr-6">{trade[4]}</td>
                                        <td className="py-3 pr-6">{trade[5]}</td>

                                        <td className="py-3 pr-6 whitespace-nowrap">
                                            {trade[7]
                                                ? new Date(trade[7]).toLocaleString()
                                                : "-"}
                                        </td>

                                        <td className="py-3 pr-6 whitespace-nowrap">
                                            {trade[8]
                                                ? new Date(trade[8]).toLocaleString()
                                                : "-"}
                                        </td>

                                        <td className="py-3 pr-6">
                                            {trade[6]}R
                                        </td>

                                        <td className="py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onEdit(trade)}
                                                    className="cursor-pointer rounded-lg px-2 py-1 text-zinc-700 hover:bg-zinc-100"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => onDelete(trade[0])}
                                                    className="cursor-pointer rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                >
                                                    Delete
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
        </div>
    );
}