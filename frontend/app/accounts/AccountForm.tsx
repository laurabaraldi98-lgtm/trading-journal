type Props = {
    name: string;
    startingBalance: string;
    currency: string;
    broker: string;
    accountType: string;

    setName: (value: string) => void;
    setStartingBalance: (value: string) => void;
    setCurrency: (value: string) => void;
    setBroker: (value: string) => void;
    setAccountType: (value: string) => void;

    onSave: () => void;
};

export default function AccountForm({
    name,
    startingBalance,
    currency,
    broker,
    accountType,
    setName,
    setStartingBalance,
    setCurrency,
    setBroker,
    setAccountType,
    onSave,
}: Props) {
    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-xl font-semibold">
                Account
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div className="lg:col-span-3">
                    <label className="mb-1 block text-sm font-medium">
                        Account name
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="e.g. Main account"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>

                <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-medium">
                        Starting balance
                        <span className="ml-1 text-red-600">*</span>
                    </label>
                    <input
                        type="number"
                        value={startingBalance}
                        onChange={(event) =>
                            setStartingBalance(event.target.value)
                        }
                        placeholder="e.g. 10000"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>

                <div className="lg:col-span-1">
                    <label className="mb-1 block text-sm font-medium">
                        Currency
                        <span className="ml-1 text-red-600">*</span>
                    </label>

                    <select
                        value={currency}
                        onChange={(event) =>
                            setCurrency(event.target.value)
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>

                <div className="lg:col-span-3">
                    <label className="mb-1 block text-sm font-medium">
                        Broker
                    </label>

                    <input
                        type="text"
                        value={broker}
                        onChange={(event) =>
                            setBroker(event.target.value)
                        }
                        placeholder="e.g. Interactive Brokers"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>

                <div className="lg:col-span-3">
                    <label className="mb-1 block text-sm font-medium">
                        Account type
                    </label>

                    <input
                        type="text"
                        value={accountType}
                        onChange={(event) =>
                            setAccountType(event.target.value)
                        }
                        placeholder="e.g. Personal account"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>
            </div>

            <div className="mt-5 flex justify-end">
                <button
                    type="button"
                    onClick={onSave}
                    className="cursor-pointer rounded-lg bg-black px-5 py-2 text-white transition hover:bg-zinc-800"
                >
                    Save account
                </button>
            </div>
        </div>
    );
}