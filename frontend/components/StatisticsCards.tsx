import {
    Activity,
    BadgeDollarSign,
    ListChecks,
    Target,
    TrendingUp,
    Wallet,
} from "lucide-react";

export type DashboardStatistics = {
    total_trades: number;
    winning_trades: number;
    total_pnl: number;
    total_r: number | null;
    trades_with_r: number;
    win_rate: number;
    average_r: number | null;
};

type StatisticsCardsProps = {
    statistics: DashboardStatistics;
    startingBalance: number;
    currency: string;
};

export default function StatisticsCards({
    statistics,
    startingBalance,
    currency,
}: StatisticsCardsProps) {
    const hasRData = statistics.trades_with_r > 0;

    let rCoverageText: string | null = null;

    if (!hasRData) {
        rCoverageText = "No risk data";
    } else if (statistics.trades_with_r < statistics.total_trades) {
        rCoverageText = `Based on ${statistics.trades_with_r} of ${statistics.total_trades} trades`;
    }

    const balance = startingBalance + statistics.total_pnl;

    return (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${!hasRData
                            ? "bg-slate-100 text-slate-500"
                            : statistics.total_r! >= 0
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                    >
                        <TrendingUp size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">Total R</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {hasRData ? `${statistics.total_r!.toFixed(2)}R` : "—"}
                        </p>
                        {rCoverageText && (
                            <p className="mt-1 text-xs text-slate-400">
                                {rCoverageText}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Target size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">Win Rate</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {statistics.win_rate.toFixed(1)}%
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
                        <p className="text-sm text-slate-500">Average R</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {statistics.average_r === null
                                ? "—"
                                : `${statistics.average_r.toFixed(2)}R`}
                        </p>
                        {rCoverageText && (
                            <p className="mt-1 text-xs text-slate-400">
                                {rCoverageText}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <ListChecks size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">Total Trades</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {statistics.total_trades}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${statistics.total_pnl >= 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                            }`}
                    >
                        <BadgeDollarSign size={23} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">P/L</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {`${currency} ${statistics.total_pnl.toLocaleString("en-US")}`}
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
                        <p className="text-sm text-slate-500">Balance</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {`${currency} ${balance.toLocaleString("en-US")}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
