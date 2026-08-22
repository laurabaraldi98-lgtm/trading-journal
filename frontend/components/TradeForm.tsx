type TradeFormProps = {
    symbol: string;
    direction: string;
    entry: string;
    stop: string;
    exit: string;
    pnl: string;
    entryDatetime: string;
    exitDatetime: string;

    setSymbol: (value: string) => void;
    setDirection: (value: string) => void;
    setEntry: (value: string) => void;
    setStop: (value: string) => void;
    setExit: (value: string) => void;
    setPnl: (value: string) => void;
    setEntryDatetime: (value: string) => void;
    setExitDatetime: (value: string) => void;

    onSave: () => void;
};

export default function TradeForm({
    symbol,
    direction,
    entry,
    stop,
    exit,
    pnl,
    entryDatetime,
    exitDatetime,
    setSymbol,
    setDirection,
    setEntry,
    setStop,
    setExit,
    setPnl,
    setEntryDatetime,
    setExitDatetime,
    onSave,
}: TradeFormProps) {
    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-900">
                Add Trade
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Symbol
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                        type="text"
                        value={symbol}
                        onChange={(event) =>
                            setSymbol(event.target.value)
                        }
                        placeholder="Symbol"
                        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-slate-900 placeholder:text-slate-400"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Direction
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <select
                        value={direction}
                        onChange={(event) =>
                            setDirection(event.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-slate-900"
                    >
                        <option value="">Direction</option>
                        <option value="long">Long</option>
                        <option value="short">Short</option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Entry
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                        type="number"
                        value={entry}
                        onChange={(event) =>
                            setEntry(event.target.value)
                        }
                        placeholder="Entry"
                        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-slate-900 placeholder:text-slate-400"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Stop
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                        type="number"
                        value={stop}
                        onChange={(event) =>
                            setStop(event.target.value)
                        }
                        placeholder="Stop"
                        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-slate-900 placeholder:text-slate-400"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Exit price
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                        type="number"
                        value={exit}
                        onChange={(event) =>
                            setExit(event.target.value)
                        }
                        placeholder="Exit price"
                        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-slate-900 placeholder:text-slate-400"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        P/L
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                        type="number"
                        value={pnl}
                        onChange={(event) =>
                            setPnl(event.target.value)
                        }
                        placeholder="P/L"
                        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-slate-900 placeholder:text-slate-400"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Entry date
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                        type="datetime-local"
                        aria-label="Entry datetime"
                        value={entryDatetime}
                        onChange={(event) =>
                            setEntryDatetime(
                                event.target.value
                            )
                        }
                        required
                        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-slate-900"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Exit date
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                        type="datetime-local"
                        aria-label="Exit datetime"
                        value={exitDatetime}
                        onChange={(event) =>
                            setExitDatetime(
                                event.target.value
                            )
                        }
                        required
                        className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-slate-900"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={onSave}
                className="mt-4 cursor-pointer rounded-lg bg-black px-5 py-3 text-white"
            >
                Save Trade
            </button>
        </div>
    );
}