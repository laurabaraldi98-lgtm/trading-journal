import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

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

type Props = {
    trades: Trade[];
};

export default function EquityCurve({ trades }: Props) {
    let cumulativeR = 0;

    const equityData = trades.map((trade, index) => {
        cumulativeR += trade[6];

        return {
            tradeNumber: index + 1,
            equity: cumulativeR,
        };
    });

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">
                Cumulative R
            </h3>

            {trades.length === 0 ? (
                <p className="text-zinc-500">
                    No trades yet.
                </p>
            ) : (
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityData}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="tradeNumber"
                                label={{
                                    value: "Trade",
                                    position: "insideBottom",
                                    offset: -5,
                                }}
                            />

                            <YAxis
                                label={{
                                    value: "R",
                                    angle: -90,
                                    position: "insideLeft",
                                }}
                            />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="equity"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}