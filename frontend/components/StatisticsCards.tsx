import {
    TrendingUp,
    Target,
    Activity,
    ListChecks,
    BadgeDollarSign,
    Wallet,
} from "lucide-react";

export type Trade = [
    number,
    string,
    string,
    number,
    number | null,
    number,
    number | null,
    number,
    string | null,
    string | null
];

type StatisticsCardsProps = {
    trades: Trade[];
    startingBalance: number;
    currency: string;
};

export default function StatisticsCards({
    trades,
    startingBalance,
    currency,
}: StatisticsCardsProps) {
    const tradesWithR = trades.filter(
        (trade) => trade[6] !== null
    );

    const totalR = tradesWithR.reduce(
        (total, trade) =>
            total + trade[6]!,
        0
    );

    const totalTrades = trades.length;

    const winningTrades = trades.filter(
        (trade) => trade[7] > 0
    ).length;

    const winRate =
        totalTrades === 0
            ? 0
            : (winningTrades / totalTrades) * 100;

    const averageR =
        tradesWithR.length === 0
            ? null
            : totalR / tradesWithR.length;

    const totalPnl = trades.reduce(
        (total, trade) => total + trade[7],
        0
    );

    const balance = startingBalance + totalPnl;

    return (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${totalR >= 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                            }`}
                    >
                        <TrendingUp size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Total R
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {totalR.toFixed(2)}R
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Target size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Win Rate
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {winRate.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Activity size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Average R
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {averageR === null
                                ? "—"
                                : `${averageR.toFixed(2)}R`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <ListChecks size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Total Trades
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {totalTrades}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${totalPnl >= 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                            }`}
                    >
                        <BadgeDollarSign size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            P/L
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {`${currency} ${totalPnl.toLocaleString("en-US")}`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Wallet size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Balance
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {`${currency} ${balance.toLocaleString("en-US")}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}