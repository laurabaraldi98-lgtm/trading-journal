export type Trade = [
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

type StatisticsCardsProps = {
    trades: Trade[];
    accountSize: string;
    currency: string;
};

export default function StatisticsCards({
    trades,
    accountSize,
    currency,
}: StatisticsCardsProps) {
    const totalR = trades.reduce(
        (total, trade) => total + trade[6],
        0
    );

    const totalTrades = trades.length;

    const winningTrades = trades.filter(
        (trade) => trade[6] > 0
    ).length;

    const winRate =
        totalTrades === 0
            ? 0
            : (winningTrades / totalTrades) * 100;

    const averageR =
        totalTrades === 0
            ? 0
            : totalR / totalTrades;

    return (
        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl bg-white p-5 border border-zinc-200">
                <p className="text-sm text-zinc-500">Total R</p>
                <p className="text-2xl font-bold mt-2">
                    {totalR.toFixed(2)}R
                </p>
            </div>

            <div className="rounded-xl bg-white p-5 border border-zinc-200">
                <p className="text-sm text-zinc-500">Win Rate</p>
                <p className="text-2xl font-bold mt-2">
                    {winRate.toFixed(1)}%
                </p>
            </div>

            <div className="rounded-xl bg-white p-5 border border-zinc-200">
                <p className="text-sm text-zinc-500">Average R</p>
                <p className="text-2xl font-bold mt-2">
                    {averageR.toFixed(2)}R
                </p>
            </div>

            <div className="rounded-xl bg-white p-5 border border-zinc-200">
                <p className="text-sm text-zinc-500">Total Trades</p>
                <p className="text-2xl font-bold mt-2">
                    {totalTrades}
                </p>
            </div>

            <div className="rounded-xl bg-white p-5 border border-zinc-200">
                <p className="text-sm text-zinc-500">
                    Account Size
                </p>

                <p className="text-2xl font-bold mt-2">
                    {accountSize
                        ? `${currency} ${Number(accountSize).toLocaleString("en-US")}`
                        : "Not set"}
                </p>
            </div>
        </div>
    );
}