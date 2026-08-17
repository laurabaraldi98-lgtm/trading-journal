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
        <div className="mt-6 rounded-xl bg-white p-6 border border-zinc-200">
            <h3 className="text-xl font-semibold mb-4">
                Add Trade
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                    type="text"
                    value={symbol}
                    onChange={(event) =>
                        setSymbol(event.target.value)
                    }
                    placeholder="Symbol"
                    className="rounded-lg border border-zinc-300 p-3"
                />

                <select
                    value={direction}
                    onChange={(event) =>
                        setDirection(event.target.value)
                    }
                    className="rounded-lg border border-zinc-300 p-3"
                >
                    <option value="">Direction</option>
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                </select>

                <input
                    type="number"
                    value={entry}
                    onChange={(event) =>
                        setEntry(event.target.value)
                    }
                    placeholder="Entry"
                    className="rounded-lg border border-zinc-300 p-3"
                />

                <input
                    type="number"
                    value={stop}
                    onChange={(event) =>
                        setStop(event.target.value)
                    }
                    placeholder="Stop"
                    className="rounded-lg border border-zinc-300 p-3"
                />

                <input
                    type="number"
                    value={exit}
                    onChange={(event) =>
                        setExit(event.target.value)
                    }
                    placeholder="Exit price"
                    className="rounded-lg border border-zinc-300 p-3"
                />

                <input
                    type="number"
                    value={pnl}
                    onChange={(event) =>
                        setPnl(event.target.value)
                    }
                    placeholder="P/L"
                    className="rounded-lg border border-zinc-300 p-3"
                />

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
                    className="rounded-lg border border-zinc-300 p-3"
                />

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
                    className="rounded-lg border border-zinc-300 p-3"
                />
            </div>

            <button
                onClick={onSave}
                className="mt-4 cursor-pointer rounded-lg bg-black px-5 py-3 text-white"
            >
                Save Trade
            </button>
        </div>
    );
}