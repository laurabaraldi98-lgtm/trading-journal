import {
    ChartNoAxesCombined,
    Target,
    Activity,
    BriefcaseBusiness,
    Wallet,
} from "lucide-react";

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
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <ChartNoAxesCombined size={23} />
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
                            {averageR.toFixed(2)}R
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <BriefcaseBusiness size={23} />
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <Wallet size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Account Size
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {accountSize
                                ? `${currency} ${Number(accountSize).toLocaleString("en-US")}`
                                : "Not set"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}