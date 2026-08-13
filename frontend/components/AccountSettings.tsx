type Props = {
    accountSize: string;
    currency: string;
    setAccountSize: (value: string) => void;
    setCurrency: (value: string) => void;
    onSave: () => void;
};

export default function AccountSettings({
    accountSize,
    currency,
    setAccountSize,
    setCurrency,
    onSave,
}: Props) {
    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-xl font-semibold">
                Account Settings
            </h3>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium">
                        Account size
                    </label>

                    <input
                        type="number"
                        value={accountSize}
                        onChange={(event) => setAccountSize(event.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Currency
                    </label>

                    <select
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                        className="rounded-lg border border-zinc-300 px-3 py-2"
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={onSave}
                        className="cursor-pointer rounded-lg bg-black px-5 py-2 text-white"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}